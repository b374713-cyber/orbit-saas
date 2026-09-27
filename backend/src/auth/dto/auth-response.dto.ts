export class AuthResponseDto {
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  accessToken: string;
  refreshToken: string;
}