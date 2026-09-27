# ORBIT

## AI-Powered Team and Project Operations Platform

Orbit is a full-stack SaaS platform that combines project management, team collaboration, real-time communication, and AI-powered project intelligence into one application.

It is designed to help teams plan projects, manage tasks, collaborate in real time, monitor progress, and use AI to turn project ideas into structured and actionable plans.

## Product Demo

[Watch the Orbit Demo Video](https://drive.google.com/file/d/1XOdcxa0zW00zyeqoZ9Q7BljMus7r3DYX/view?usp=drive_link)

The demo showcases the main Orbit workflow, including authentication, organizations, project management, Kanban boards, tasks, AI-powered features, collaboration, analytics, and subscription management.

## Core Features

### AI Project Intelligence

Orbit integrates AI throughout the project lifecycle to help teams move from ideas to execution.

* Generate complete project plans from natural-language descriptions
* Automatically break projects and tasks into actionable subtasks
* Analyze projects and identify potential risks
* Provide AI-generated recommendations
* Generate project summaries and insights

### Project Management

* Project and task management
* Kanban boards with drag-and-drop functionality
* Milestones and roadmap planning
* Task dependencies
* Priorities, labels, comments, and due dates
* Project progress tracking
* Project analytics and reporting

### Team Collaboration

* Multi-organization architecture
* Role-based access control
* Organization and member management
* Real-time project chat
* Online presence indicators
* Typing indicators
* Real-time task and project updates
* Email invitations

### SaaS Billing

Orbit includes a complete subscription and billing system.

* Free, Pro, and Business plans
* Stripe Checkout
* Subscription management
* Customer billing portal
* Stripe webhooks
* Invoice history

## Technology Stack

### Frontend

* Next.js 16
* React 19
* TypeScript
* Tailwind CSS
* React Query
* Zustand
* Socket.IO Client
* dnd-kit
* Recharts
* Zod

### Backend

* NestJS 12
* TypeScript
* PostgreSQL
* Prisma
* Redis
* Socket.IO
* JWT
* Bcrypt
* Stripe SDK
* Groq SDK
* Swagger

### Infrastructure

* Docker
* Docker Compose
* GitHub Actions
* Vitest

## Architecture

```text
                         ORBIT
                           |
              ┌────────────┴────────────┐
              |                         |
       Next.js Frontend           NestJS Backend
              |                         |
              |                  REST API / WebSockets
              |                         |
              |              ┌──────────┴──────────┐
              |              |                     |
              |         PostgreSQL               Redis
              |              |                     |
              |           Prisma              Caching / Queues
              |              |
              |      ┌───────┼────────┐
              |      |       |        |
              |    Groq    Stripe   Email
              |     AI     Billing   Service
              |
        Real-Time UI
```

The platform follows a separated frontend and backend architecture.

The **Next.js frontend** provides the product interface and real-time user experience, while the **NestJS backend** handles business logic, authentication, APIs, data management, and integrations.

**PostgreSQL** serves as the primary relational database through Prisma, while **Redis** supports caching and background processing.

External services such as **Groq**, **Stripe**, and email services extend Orbit with AI capabilities, subscription billing, and communication workflows.

## Project Structure

```text
orbit-saas/
├── frontend/              Next.js application
├── backend/               NestJS API
├── docker/                Docker configuration
└── docker-compose.yml     Infrastructure configuration
```

## What Orbit Demonstrates

Orbit was built as a production-oriented full-stack SaaS application and demonstrates experience across multiple areas of modern software engineering:

* Full-stack product architecture
* Multi-tenant SaaS design
* Authentication and authorization
* Role-based access control
* REST API development
* Real-time WebSocket communication
* Relational database architecture
* AI API integration
* AI-assisted project workflows
* Subscription and payment systems
* Redis-based caching and background processing
* Docker-based infrastructure
* CI/CD workflows
* Automated testing
* API documentation

## Status

Orbit is an actively developed SaaS platform combining project management, collaboration, AI-powered workflows, analytics, real-time communication, and subscription management in a unified product.
