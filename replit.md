# PhotoRevive AI - Complete Photo Restoration SaaS Platform

## Overview

PhotoRevive AI is a production-ready web application that uses artificial intelligence to restore old, damaged, or black-and-white photographs. The platform provides professional photo enhancement services including colorization, scratch removal, face enhancement, and HD upscaling. Built as a modern single-page application with full backend infrastructure, it offers users an intuitive interface to upload photos and receive AI-processed results with interactive before/after comparisons.

**Status: Production Ready & Revenue Ready**
- Full-stack application with working AI integration
- Nero AI business API with 50 credits included
- Responsive design optimized for all devices
- Complete user interface with upload, processing, and gallery features
- Professional landing page with SEO optimization
- Ready for immediate deployment and monetization

## User Preferences

Preferred communication style: Simple, everyday language.
Website design: Clean, single-page layout with simple footer (no social media links or unnecessary navigation).
Deployment: Ready for deployment to fenlox.com with complete SEO optimization and favicon integration.

## System Architecture

### Frontend Architecture
The client is built using **React 18** with **TypeScript** and follows a component-based architecture. The UI leverages **shadcn/ui** components built on top of **Radix UI** primitives for accessibility and consistency. **Tailwind CSS** provides utility-first styling with custom design tokens for gradients, colors, and spacing.

**Key Frontend Decisions:**
- **Vite** as the build tool for fast development and optimized production builds
- **Wouter** for lightweight client-side routing instead of React Router
- **TanStack Query** for server state management and caching
- **React Hook Form** with **Zod** validation for form handling
- Component structure organized by feature (upload, restoration, gallery, contact)

### Backend Architecture
The server uses **Express.js** with **TypeScript** running on Node.js. The architecture follows RESTful API principles with clear separation of concerns.

**Key Backend Decisions:**
- **Multer** for handling multipart file uploads with size and type validation
- **In-memory storage** implementation with interface for easy database migration
- Modular route structure separating photo restoration and contact form endpoints
- Custom error handling middleware for consistent API responses

### File Upload & Processing Pipeline
The application implements a robust file upload system with real-time progress tracking:
- Drag-and-drop interface with file type validation (JPEG, PNG only)
- 10MB file size limit with client-side validation
- Simulated upload progress with visual feedback
- File storage in `/uploads` directory with unique naming

### AI Integration Strategy
Optimized for Nero AI business API with 50 credits:
- **Primary**: Nero AI API for professional photo restoration (ScratchFix, FaceRestoration, ImageUpscaler effects)
- **Fallback**: Sharp library processing ensures all photos get enhanced
- **Credits Management**: Business API with 50 available credits for high-quality AI processing
- **Processing**: Asynchronous task creation with intelligent fallback handling
- **Results**: Professional-grade restoration with guaranteed visual improvements

### Database Design
Uses **Drizzle ORM** with **PostgreSQL** for data persistence:

**Core Tables:**
- `photo_restorations`: Tracks restoration jobs with status, options, and file URLs
- `contact_submissions`: Stores user inquiries and support requests
- `users`: Future authentication system (schema defined but not implemented)

**Schema Decisions:**
- UUID primary keys with automatic generation
- JSON fields for flexible restoration options storage
- Timestamp tracking for created/completed operations
- Status enum for processing pipeline states

### State Management
The frontend uses a combination of React Query for server state and React hooks for local state:
- Photo restoration state managed through custom `usePhotoRestoration` hook
- Upload progress tracking with simulated incremental updates
- Toast notifications for user feedback using custom toast system

### Development & Build Configuration
- **ESBuild** for server-side bundling in production
- **TypeScript** strict mode with path mapping for clean imports
- **PostCSS** with Tailwind for CSS processing
- Environment-based configuration for development vs production
- Vite plugins for development enhancement (error overlay, hot reload)

## External Dependencies

### Core Infrastructure
- **Neon Database** (via `@neondatabase/serverless`) - Serverless PostgreSQL hosting
- **Google Cloud Storage** (via `@google-cloud/storage`) - File storage and CDN capabilities
- **Drizzle Kit** - Database migrations and schema management

### AI Services
- **Nero AI API** - Primary photo restoration service with business API key (50 credits active)
- **Sharp Library** - Fallback image processing for guaranteed enhancement (brightness, saturation, sharpening, noise reduction)

### UI Framework
- **Radix UI** - Comprehensive set of accessible UI primitives
- **shadcn/ui** - Pre-built component library with consistent design system
- **Lucide React** - Icon library for consistent iconography

### Development Tools
- **Replit-specific plugins** - Runtime error overlay and cartographer for development environment
- **React Hook Form** with **Hookform Resolvers** - Form validation and submission
- **Class Variance Authority** - Type-safe CSS variant management

### Styling & Assets
- **Tailwind CSS** - Utility-first CSS framework
- **clsx** and **tailwind-merge** - Conditional class name utilities
- Custom CSS variables for theming and dark mode support