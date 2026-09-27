import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

@Injectable()
export class AiService {
  private groq: Groq;
  private readonly logger = new Logger(AiService.name);
  private readonly model: string;

  constructor(private configService: ConfigService) {
    this.groq = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
    });
    this.model =
      this.configService.get<string>('GROQ_MODEL') ||
      'llama-3.3-70b-versatile';
  }

  async chat(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: {
      temperature?: number;
      maxTokens?: number;
      responseFormat?: { type: 'json_object' };
    },
  ) {
    try {
      const response = await this.groq.chat.completions.create({
        model: this.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 4096,
        response_format: options?.responseFormat,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error: any) {
      this.logger.error('Groq API error:', error.message);
      throw error;
    }
  }

  async generateProjectPlan(params: {
    description: string;
    duration?: string;
    teamSize?: number;
  }) {
    const systemPrompt = `You are an expert project manager AI assistant. You help teams break down projects into milestones and tasks.

You MUST respond with valid JSON only. No markdown, no explanations outside JSON.

The JSON structure must be:
{
  "projectName": "string",
  "description": "string",
  "milestones": [
    {
      "title": "string",
      "description": "string",
      "durationDays": number,
      "tasks": [
        {
          "title": "string",
          "description": "string",
          "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
          "estimatedHours": number
        }
      ]
    }
  ]
}

Rules:
- Project name should be concise and professional
- Each milestone represents a phase (3-6 milestones typical)
- Each milestone has 3-8 tasks
- Priorities reflect real-world importance
- Estimated hours should be realistic
- Task titles are action-oriented (start with verb)
- Be specific to the project description`;

    const userPrompt = `Create a detailed project plan for the following:

Project: ${params.description}
${params.duration ? `Duration: ${params.duration}` : ''}
${params.teamSize ? `Team size: ${params.teamSize} people` : ''}

Generate a comprehensive plan with milestones and tasks. Respond in JSON only.`;

    const content = await this.chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        temperature: 0.7,
        maxTokens: 4096,
        responseFormat: { type: 'json_object' },
      },
    );

    try {
      return JSON.parse(content);
    } catch (error) {
      this.logger.error('Failed to parse AI response:', content);
      throw new Error('AI returned invalid JSON');
    }
  }

  async generateTaskBreakdown(params: {
    taskTitle: string;
    taskDescription?: string;
    projectContext?: string;
  }) {
    const systemPrompt = `You are an expert developer AI assistant. You help break down tasks into actionable subtasks.

You MUST respond with valid JSON only. No markdown, no explanations outside JSON.

The JSON structure must be:
{
  "description": "string (improved task description)",
  "subtasks": [
    {
      "title": "string",
      "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
      "estimatedHours": number
    }
  ],
  "technicalNotes": "string (optional technical suggestions)"
}

Rules:
- Description should be clear and actionable
- 3-8 subtasks per task
- Subtasks should be specific implementation steps
- Priorities reflect dependencies and importance
- Estimated hours realistic for each subtask
- Task titles start with verbs`;

    const userPrompt = `Break down the following task into subtasks:

Task: ${params.taskTitle}
${params.taskDescription ? `Description: ${params.taskDescription}` : ''}
${params.projectContext ? `Project context: ${params.projectContext}` : ''}

Respond in JSON only.`;

    const content = await this.chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        temperature: 0.7,
        maxTokens: 2048,
        responseFormat: { type: 'json_object' },
      },
    );

    try {
      return JSON.parse(content);
    } catch (error) {
      this.logger.error('Failed to parse AI response:', content);
      throw new Error('AI returned invalid JSON');
    }
  }

  async analyzeProjectRisk(params: {
    projectName: string;
    progress: number;
    totalTasks: number;
    doneTasks: number;
    overdueTasks: number;
    blockedTasks: number;
    teamWorkload: Array<{ name: string; activeTasks: number }>;
    daysRemaining: number;
  }) {
    const systemPrompt = `You are an expert project risk analyst. Analyze project health and provide actionable insights.

You MUST respond with valid JSON only. No markdown, no explanations outside JSON.

The JSON structure must be:
{
  "healthScore": number (0-100),
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "summary": "string (2-3 sentences)",
  "risks": [
    {
      "title": "string",
      "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      "description": "string",
      "recommendation": "string"
    }
  ],
  "recommendations": ["string", "string"]
}

Rules:
- healthScore reflects realistic project health
- 1-5 risks depending on severity
- Recommendations are actionable
- Be honest about risks (don't sugarcoat)`;

    const userPrompt = `Analyze this project:

Project: ${params.projectName}
Progress: ${params.progress}%
Tasks: ${params.doneTasks}/${params.totalTasks} done
Overdue tasks: ${params.overdueTasks}
Blocked tasks: ${params.blockedTasks}
Days remaining: ${params.daysRemaining}
Team workload:
${params.teamWorkload.map((m) => `  - ${m.name}: ${m.activeTasks} active tasks`).join('\n')}

Provide a risk analysis. Respond in JSON only.`;

    const content = await this.chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        temperature: 0.5,
        maxTokens: 2048,
        responseFormat: { type: 'json_object' },
      },
    );

    try {
      return JSON.parse(content);
    } catch (error) {
      this.logger.error('Failed to parse AI response:', content);
      throw new Error('AI returned invalid JSON');
    }
  }

  async generateProjectSummary(params: {
    projectName: string;
    description?: string;
    progress: number;
    totalTasks: number;
    doneTasks: number;
    inProgressTasks: number;
    milestones: Array<{
      title: string;
      status: string;
      progress: number;
    }>;
    recentActivity: Array<{ action: string; user: string }>;
  }) {
    const systemPrompt = `You are an expert at summarizing project status for stakeholders. Be concise, clear, and actionable.

Respond in plain text (no JSON, no markdown headers). Keep it to 3-5 paragraphs.

Include:
1. Overall project status
2. Key achievements
3. Current focus
4. Any concerns
5. Next steps`;

    const userPrompt = `Summarize this project:

Project: ${params.projectName}
${params.description ? `Description: ${params.description}` : ''}

Progress: ${params.progress}%
Tasks: ${params.doneTasks}/${params.totalTasks} done, ${params.inProgressTasks} in progress

Milestones:
${params.milestones.map((m) => `  - ${m.title} (${m.status}): ${m.progress}%`).join('\n')}

Recent activity:
${params.recentActivity.slice(0, 10).map((a) => `  - ${a.user}: ${a.action}`).join('\n')}

Provide a concise summary for the team and stakeholders.`;

    return this.chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        temperature: 0.7,
        maxTokens: 1024,
      },
    );
  }

  async createProjectFromPlan(params: {
    organizationId: string;
    userId: string;
    projectName: string;
    description?: string;
    milestones: Array<{
      title: string;
      description?: string;
      durationDays?: number;
      tasks: Array<{
        title: string;
        description?: string;
        priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
        estimatedHours?: number;
      }>;
    }>;
    startDate?: string;
    prisma: any; // PrismaService (injected)
  }) {
    const {
      organizationId,
      userId,
      projectName,
      description,
      milestones,
      startDate,
      prisma,
    } = params;

    // Calculate end date
    const totalDays = milestones.reduce(
      (sum, m) => sum + (m.durationDays || 7),
      0,
    );

    const projectStart = startDate ? new Date(startDate) : new Date();
    const projectEnd = new Date(projectStart);
    projectEnd.setDate(projectEnd.getDate() + totalDays);

    // Create project with everything in transaction
    const project = await prisma.$transaction(async (tx: any) => {
      // Create project
      const newProject = await tx.project.create({
        data: {
          name: projectName,
          description,
          organizationId,
          creatorId: userId,
          status: 'ACTIVE',
          startDate: projectStart,
          endDate: projectEnd,
          members: {
            create: {
              userId,
              role: 'OWNER',
            },
          },
        },
      });

      // Track cumulative days for milestone due dates
      let cumulativeDays = 0;

      // Create milestones and tasks
      for (let i = 0; i < milestones.length; i++) {
        const milestone = milestones[i];
        cumulativeDays += milestone.durationDays || 7;

        const milestoneDueDate = new Date(projectStart);
        milestoneDueDate.setDate(milestoneDueDate.getDate() + cumulativeDays);

        const createdMilestone = await tx.milestone.create({
          data: {
            title: milestone.title,
            description: milestone.description,
            projectId: newProject.id,
            dueDate: milestoneDueDate,
            status: 'PENDING',
            order: i,
          },
        });

        // Create tasks for this milestone
        for (let j = 0; j < milestone.tasks.length; j++) {
          const task = milestone.tasks[j];

          await tx.task.create({
            data: {
              title: task.title,
              description: task.description,
              projectId: newProject.id,
              milestoneId: createdMilestone.id,
              creatorId: userId,
              status: 'TODO',
              priority: task.priority || 'MEDIUM',
              order: j,
              dueDate: milestoneDueDate,
            },
          });
        }
      }

      return newProject;
    });

    return project;
  }
}