# SolixDB Dashboard

World-class, production-ready dashboard for SolixDB at `dashboard.solixdb.xyz`.

## Tech Stack

- **Next.js 15+** with App Router
- **TypeScript**
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **Framer Motion** for animations
- **Privy** for authentication (Google, GitHub, Email, Solana Wallet)
- **Supabase** for PostgreSQL database
- **React Hook Form + Zod** for forms
- **Recharts** for data visualization
- **Zustand** for state management
- **Lucide React** for icons

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file:
   ```env
   # Privy Authentication
   NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id

   # Supabase Database
   # Get these from: Supabase Dashboard → Settings → API
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...  # New publishable key
   SUPABASE_SERVICE_ROLE_KEY=your-secret-key-here     # From Secret keys section

   # API Configuration
   NEXT_PUBLIC_API_URL=https://api.solixdb.xyz
   ```
   
   See `ENV_SETUP.md` for detailed instructions on getting your API keys.

3. **Set up Supabase database:**
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql` in the Supabase SQL Editor
   - This will create all necessary tables and policies

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## Database Setup

The database schema is defined in `supabase/schema.sql`. Run this entire file in your Supabase SQL Editor to create:

- `users` table (for Privy-authenticated users)
- `api_keys` table (for API key management)
- `usage_logs` table (for tracking API usage)
- `monthly_credits` table (for credit management)

All tables use Row Level Security (RLS) with service role access.

## Authentication

The dashboard uses Privy for authentication, supporting:
- Email/Password
- Google OAuth
- GitHub OAuth
- Solana Wallet (Phantom, Solflare, etc.)

Users are automatically synced with the Supabase database on first login.

## Project Structure

```
dashboard/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities and helpers
│   ├── config/           # Configuration files
│   └── stores/           # Zustand state stores
├── public/               # Static assets
└── supabase/             # Database schema
```

## Deployment

The dashboard is ready to deploy to Vercel or any Next.js-compatible platform.

Make sure to set all environment variables in your deployment platform.
