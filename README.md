# ShortLink - Modern URL Shortener

A production-ready URL shortening service built with React, TypeScript, and Supabase.

## Features

- **Custom URL Aliases** - Create branded, memorable short links with custom slugs
- **Detailed Analytics** - Track clicks, referrers, devices, and geographic data in real-time
- **QR Code Generation** - Generate and download QR codes for all your short URLs
- **Secure & Private** - Enterprise-grade security with URL validation and IP hashing
- **API Access** - Full REST API with authentication for automation and integrations
- **Soft Deletes** - Recoverable URL deletion with 30-day retention period
- **Edge Performance** - Lightning-fast redirects powered by Supabase Edge Functions

## Tech Stack

- **Frontend**: Vite + React 18 + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Row Level Security)
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Edge Functions**: Deno runtime for global performance

## Getting Started

### Prerequisites

- Node.js 16+ and npm installed ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Supabase account and project

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd sl2

# Install dependencies
npm i

# Start development server (runs on port 8080)
npm run dev
```

### Build for Production

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

### Linting

```bash
npm run lint
```

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   └── ...             # Custom components
├── pages/              # Route pages (Index, Auth, Dashboard, NotFound)
├── integrations/       # Supabase client and types
├── lib/                # Utility functions (slug generation, QR codes)
└── hooks/              # Custom React hooks

supabase/
├── migrations/         # Database schema migrations
└── functions/          # Edge functions (redirect logic)
```

## Environment Variables

Create a `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Database Setup

The database schema includes:
- **profiles** - User profile information
- **urls** - Shortened URLs with metadata
- **clicks** - Click analytics data
- **api_keys** - API authentication keys

All tables have Row Level Security (RLS) enabled for multi-tenant security.

## Contributing

Contributions are welcome! Please ensure all code passes linting and follows the existing code style.

## License

MIT License - see LICENSE file for details
