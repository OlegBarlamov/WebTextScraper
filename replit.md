# Web Scraper Application

## Overview

This is a full-stack web scraping application built with React frontend and Express.js backend. The application allows users to input URLs and scrape website content, converting HTML to readable Markdown format. It features a modern UI built with shadcn/ui components and Tailwind CSS styling.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Library**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js 20
- **Web Scraping**: Cheerio for HTML parsing and TurndownService for HTML-to-Markdown conversion
- **Development Tools**: tsx for TypeScript execution in development

### Database Layer
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Database**: PostgreSQL 16 (configured via Replit modules)
- **Schema**: User management system with username/password authentication
- **Storage**: In-memory storage implementation with interface for future database integration

## Key Components

### Web Scraping Engine
- HTTP/HTTPS request handling with proper User-Agent headers
- HTML content extraction using Cheerio
- Markdown conversion via TurndownService
- Error handling for invalid URLs and network failures
- CORS support for cross-origin requests

### User Interface
- Clean, modern design with shadcn/ui components
- Form handling with validation
- Toast notifications for user feedback
- Responsive design with mobile support
- Loading states and error handling

### Authentication System (Prepared)
- User schema defined with Drizzle ORM
- Password-based authentication structure
- In-memory storage with database interface for future scaling

## Data Flow

1. **User Input**: User enters URL in the frontend form
2. **API Request**: Frontend sends GET request to `/api/scrape` endpoint with URL parameter
3. **URL Validation**: Backend validates URL format and accessibility
4. **Content Scraping**: Server fetches HTML content using appropriate HTTP client
5. **Content Processing**: HTML is parsed with Cheerio and converted to Markdown
6. **Response Handling**: Processed content is returned to frontend or error message on failure
7. **UI Update**: Frontend displays scraped content in textarea or shows error toast

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM)
- TanStack Query for data fetching
- Wouter for routing
- shadcn/ui component library
- Radix UI primitives
- Tailwind CSS for styling
- date-fns for date manipulation

### Backend Dependencies
- Express.js web framework
- Cheerio for HTML parsing
- TurndownService for HTML-to-Markdown conversion
- Drizzle ORM for database operations
- @neondatabase/serverless for PostgreSQL connectivity

### Development Dependencies
- Vite for build tooling
- TypeScript for type safety
- tsx for TypeScript execution
- ESBuild for production bundling

## Deployment Strategy

### Development Environment
- **Command**: `npm run dev`
- **Port**: 5000 (internal), 80 (external)
- **Hot Reload**: Vite HMR for frontend, tsx watch mode for backend
- **Database**: PostgreSQL via Replit modules

### Production Build
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Start Command**: `npm run start`
- **Deployment Target**: Replit Autoscale

### Configuration
- Environment variables for database connection
- Build process handles both frontend and backend bundling
- Static file serving for production assets

## Changelog
- June 27, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.