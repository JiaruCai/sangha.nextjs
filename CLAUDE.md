# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (usually runs on port 3000, but may use 3001+ if occupied)
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality

## Project Architecture

This is a Next.js 15 application using the App Router architecture with TypeScript. The project appears to be for "JoinSangha", a meditation/mindfulness application.

### Key Technologies
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling (with custom animations like `orbit-slow`)
- **Framer Motion** for animations
- **Stripe** for payment processing
- **Nodemailer** for email functionality
- **React Icons** for iconography

### Directory Structure

#### `/app` - Main application directory (App Router)
- `layout.tsx` - Root layout with custom fonts (Arsenal, Geist)
- `page.tsx` - Homepage composed of Hero, Features, Testimonials, Footer
- `/components` - Shared components (SEO component)
- `/download` - Download page components
- `/merchandise` - E-commerce functionality with Stripe integration
- `/career` - Career/jobs page with job popup functionality
- `/partnership` - Partnership page
- `/team-blog` - Blog functionality

#### `/pages/api` - API routes (Pages Router for API)
- `stripe-webhook.ts` - Stripe webhook handler for payment events
- `create-payment-intent.ts` - Payment processing
- `get-merchandise.ts` - Merchandise data
- `save-order.ts` - Order persistence
- Email API routes for applications and partnerships

### Configuration Details

#### Next.js Configuration
- External image domains configured: `i.ibb.co`, `images.pexels.com`
- Mixed routing: App Router for pages, Pages Router for API routes

#### TypeScript Configuration
- Path aliases: `@/*` maps to `./src/*` (though src directory doesn't exist)
- Strict mode enabled

#### Styling
- Tailwind CSS with custom keyframes for orbit animation
- Custom font variables for Arsenal and Geist fonts
- Form plugin enabled (`@tailwindcss/forms`)

### Payment Integration
The application has comprehensive Stripe integration:
- Payment intents for merchandise purchases
- Webhook handling for payment success/failure events
- Cart modal functionality
- Order saving system

### Email Functionality
Uses Nodemailer for:
- Application submissions (career page)
- Partnership inquiries
- Order confirmations (implied from webhook structure)

### Environment Variables Required
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signature verification
- Email configuration for Nodemailer (specific variables not visible in code)

### Component Patterns
- Pages use SEO component for meta tags
- Consistent layout pattern: SEO + NavBar + Content + Footer
- Components are typically co-located with their page directories
- TypeScript interfaces for props and data structures