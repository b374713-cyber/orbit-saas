# ORBIT — AI-Powered Team & Project Operations Platform

**A production-ready SaaS for modern teams**

Kanban | Real-time Chat | AI Planning | Milestones | Analytics | Stripe Subscriptions

---

## Demo

**[Watch the full demo on Google Drive](https://drive.google.com/file/d/1XOdcxa0zW00zyeqoZ9Q7BljMus7r3DYX/view?usp=drive_link)**

Full walkthrough: signup -> organization -> project -> Kanban -> tasks -> AI features -> Stripe subscription.

---

## Overview

ORBIT is a full-stack SaaS platform that helps teams plan, execute, and track projects with the power of AI. It combines modern project management (Kanban, milestones, analytics) with real-time collaboration (chat, WebSocket) and AI capabilities (project planning, task breakdown, risk detection, summaries).

Built from scratch with a clean architecture on both the backend and frontend, fully containerized with Docker, and deployed with CI/CD.

---

## Features

### Authentication & Multi-tenancy
- JWT authentication with access + refresh tokens
- Secure password hashing with bcrypt
- Multi-tenant organizations with role-based access control (RBAC)
- Roles: Owner, Admin, Member, Viewer

### Project & Task Management
- Full CRUD for projects and tasks
- Kanban board with drag & drop (`@dnd-kit`)
- Task priorities: Low, Medium, High, Urgent
- Task statuses: Backlog, To Do, In Progress, Review, Done
- Task comments and labels
- Dependencies between tasks with circular dependency detection

### Milestones & Roadmap
- Break projects into milestones
- Gantt-style timeline view
- Track progress across phases

### Analytics Dashboard
- 5 real-time charts powered by Recharts:
  - Progress over time
  - Tasks by status (pie)
  - Tasks by priority (bars)
  - Team workload
  - Velocity chart

### Real-time Chat
- WebSocket with Socket.IO
- Online users tracking
- Typing indicators
- Live message delivery

### AI Features (powered by Groq)
- AI Project Planner — describe an idea, get a full project with milestones and tasks
- AI Task Breakdown — split a task into subtasks
- AI Risk Detection — health score, risk analysis, and recommendations
- AI Project Summary — executive summary of project status
- Model: `openai/gpt-oss-120b`

### Stripe Subscriptions
- 3-tier plans: Free, Pro ($29), Business ($99)
- Stripe Checkout session flow
- Customer Portal for self-service billing
- Webhook handling for subscription lifecycle
- Invoice history with PDF downloads

### Email Invitations
- Nodemailer + Gmail
- Token-based invitation links
- Accept/decline flow

### Engineering
- Docker multi-stage builds
- Docker Compose for dev + prod
- GitHub Actions CI/CD
- Swagger/OpenAPI docs
- Vitest — 36 unit + E2E tests
- Full TypeScript across the stack

---

## Tech Stack

### Backend
| Tech | Purpose |
|------|---------|
| NestJS 12 | Progressive Node.js framework |
| Prisma 7 | Type-safe ORM |
| PostgreSQL 15 | Primary database |
| Redis 7 | Caching + sessions |
| Socket.IO | Real-time WebSocket |
| Groq AI | LLM inference |
| Nodemailer | Email delivery |
| Stripe SDK | Payments |
| JWT + Bcrypt | Auth |
| Swagger | API docs |

### Frontend
| Tech | Purpose |
|------|---------|
| Next.js 16 | React framework (App Router) |
| React 19 | UI library |
| TypeScript | Type safety |
| Tailwind CSS 4 | Styling |
| React Query | Server state |
| Zustand | Client state |
| Recharts | Charts |
| @dnd-kit | Drag & drop |
| Lucide | Icons |

### DevOps
| Tech | Purpose |
|------|---------|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| GitHub Actions | CI/CD |
| Vitest | Testing |


