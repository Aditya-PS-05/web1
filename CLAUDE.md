# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **BoardHub**, a Trello-style Kanban board application built as part of a 24-hour full-stack showcase challenge. It's a Next.js application with MongoDB backend, implementing boards → lists → cards hierarchy.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm start` - Start production server
- `npm run lint` - Run ESLint checks
- `npm run lint:fix` - Fix ESLint issues automatically

### Pre-commit Hooks
- Husky is configured with pre-commit hooks that run `npm run lint`
- All commits must pass linting before being accepted

## Architecture

### Tech Stack
- **Frontend**: Next.js 15.3+ with React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes with server actions
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Tailwind CSS with postcss and autoprefixer
- **Linting**: ESLint with TypeScript, Prettier, and Next.js rules
- **State Management**: React Context (BoardContext)

### Project Structure
```
src/
├── app/                 # Next.js 15 app router
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   ├── not-found.tsx   # 404 page
│   └── globals.css     # Global styles
├── components/
│   ├── layout/         # Layout components (Header, Footer)
│   └── ui/            # Reusable UI components (Button)
├── contexts/          # React contexts (BoardContext)
└── libs/
    └── db/           # Database layer
        ├── mongoose.ts    # Database connection with caching
        └── models/       # Mongoose models (Board, User)
```

### Key Patterns
- **Database Connection**: Uses global caching pattern for Mongoose connections to prevent connection exhaustion in serverless environments
- **Path Aliases**: Configured TypeScript paths for clean imports:
  - `@components/*` → `src/components/*`
  - `@libs/*` → `src/libs/*`
  - `@models/*` → `src/libs/db/models/*`
  - `@contexts/*` → `src/contexts/*`
  - `@hooks/*` → `src/hooks/*`

### Environment Variables
- `MONGO_URI` - MongoDB connection string (required)
- Create `.env.local` file for local development

### Required Features (Assignment Context)
The project must implement these core features:
- **U0**: Core CRUD for boards, lists & cards
- **U1**: Responsive board UI with drag-and-drop (@dnd-kit)
- **U2**: Dark/Light theme toggle
- **U3**: Empty states & skeleton loaders
- **E0**: API routes & server actions for CRUD
- **E1**: Manual auth with signup/login, cookie sessions
- **E2**: MongoDB schema & indexes
- **E3**: Global error boundary & logging

### Development Notes
- Uses Next.js 15 with app router and server actions
- TypeScript strict mode enabled
- ESLint configured with Prettier integration
- Husky pre-commit hooks ensure code quality
- MongoDB connection uses singleton pattern for serverless optimization

## Quick Start
1. Install dependencies: `npm install`
2. Set up environment: Copy `.env.example` to `.env.local` and configure `MONGO_URI`
3. Start development: `npm run dev`
4. Access application at `http://localhost:3000`