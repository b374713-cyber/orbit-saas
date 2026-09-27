import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Map of userId -> socketId (for tracking online users)
  private onlineUsers = new Map<string, string>();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private chatService: ChatService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const userId = payload.sub;
      client.data.userId = userId;

      // Track online user
      this.onlineUsers.set(userId, client.id);

      // Notify others
      this.server.emit('user:online', { userId });

      console.log(`✅ User ${userId} connected (socket: ${client.id})`);
    } catch (error: any) {
      console.error('❌ WebSocket auth failed:', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.onlineUsers.delete(userId);
      this.server.emit('user:offline', { userId });
      console.log(`❌ User ${userId} disconnected`);
    }
  }

  // ============================================
  // Join Project Room
  // ============================================
  @SubscribeMessage('project:join')
  async handleJoinProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string },
  ) {
    const userId = client.data.userId;

    // Verify user is a member of the project
    const isMember = await this.chatService.isProjectMember(data.projectId, userId);

    if (!isMember) {
      client.emit('error', { message: 'You are not a member of this project' });
      return;
    }

    client.join(`project:${data.projectId}`);
    console.log(`User ${userId} joined project:${data.projectId}`);

    // Notify others in the room
    client.to(`project:${data.projectId}`).emit('project:user_joined', {
      userId,
      projectId: data.projectId,
    });

    return { success: true, projectId: data.projectId };
  }

  // ============================================
  // Leave Project Room
  // ============================================
  @SubscribeMessage('project:leave')
  handleLeaveProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string },
  ) {
    client.leave(`project:${data.projectId}`);
    client.to(`project:${data.projectId}`).emit('project:user_left', {
      userId: client.data.userId,
      projectId: data.projectId,
    });
    return { success: true };
  }

  // ============================================
  // Send Message
  // ============================================
  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string; content: string },
  ) {
    const userId = client.data.userId;

    // Verify membership
    const isMember = await this.chatService.isProjectMember(data.projectId, userId);
    if (!isMember) {
      client.emit('error', { message: 'You are not a member of this project' });
      return;
    }

    // Save message to database
    const message = await this.chatService.createMessage(
      data.projectId,
      userId,
      data.content,
    );

    // Broadcast to all users in the project room
    this.server.to(`project:${data.projectId}`).emit('message:new', message);

    return message;
  }

  // ============================================
  // Typing Indicators
  // ============================================
  @SubscribeMessage('message:typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string; isTyping: boolean },
  ) {
    client.to(`project:${data.projectId}`).emit('message:typing', {
      userId: client.data.userId,
      isTyping: data.isTyping,
    });
  }

  // ============================================
  // Get Online Users
  // ============================================
  @SubscribeMessage('users:online')
  handleGetOnlineUsers() {
    return Array.from(this.onlineUsers.keys());
  }
}