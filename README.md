# Beauty Clinic

A modern, multi-lingual beauty clinic management system built with Next.js 16, featuring comprehensive appointment scheduling, patient management, and financial tracking.

## Features

- 🌐 **Multi-language Support** - Full i18n with Persian (fa) and English (en) via `next-intl`
- 🎨 **Design System** - Strict design tokens with Tailwind CSS v4, dark/light mode support
- 🔐 **Authentication** - Secure auth with httpOnly cookies, session management via `jose`
- 💾 **Database** - PostgreSQL with Drizzle ORM, migrations, and seeding
- 🚀 **Performance** - Optimized with `next/font`, `next/image`, and server-side rendering
- ♿ **Accessibility** - WCAG AA compliant, full keyboard navigation, screen reader support
- 📱 **Responsive** - Mobile-first design from 300px to 4K+ resolutions
- 🧪 **Testing** - Unit tests with Vitest
- 🛡️ **Security** - Rate limiting (Upstash Redis), input validation with Zod, CSP headers

## Tech Stack

### Core
- **Framework:** Next.js 16.2.12 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4 + Radix UI primitives
- **Icons:** Lucide React

### Backend & Database
- **ORM:** Drizzle ORM
- **Database:** PostgreSQL (Supabase compatible)
- **Migrations:** Drizzle Kit
- **Caching/Rate Limiting:** Upstash Redis

### Authentication & Security
- **Auth:** Custom implementation with `jose` (JWT)
- **Password Hashing:** Argon2
- **Validation:** Zod

### Internationalization
- **i18n:** next-intl
- **Font:** Estedad (with OpenType feature ss01 for Persian numerals)

### Testing & Quality
- **Testing:** Vitest
- **Linting:** ESLint 9
- **Type Checking:** TypeScript strict mode

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database (local or Supabase)
- (Optional) Upstash Redis for rate limiting

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd beauty-clinic
```

2. Install dependencies:
```bash
pnpm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Configure your `.env.local`:
```bash
# Site URL (no trailing slash)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Database URLs
DATABASE_URL=postgres://user:password@host:6543/postgres?sslmode=require
DIRECT_URL=postgres://user:password@host:5432/postgres?sslmode=require

# Auth secret (generate with: openssl rand -base64 32)
AUTH_SECRET=your-auth-secret-here

# Encryption key (generate with: openssl rand -hex 32)
ENCRYPTION_KEY=your-encryption-key-here

# Optional: Redis for rate limiting
KV_REST_API_URL=your-upstash-url
KV_REST_API_TOKEN=your-upstash-token
```

5. Generate database schema:
```bash
pnpm db:generate
```

6. Run migrations:
```bash
pnpm db:migrate
```

7. Seed the database (optional):
```bash
pnpm db:seed
```

8. Start development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test` | Run Vitest tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm db:seed` | Seed database with initial data |

## Project Structure

```
beauty-clinic/
├── app/                    # Next.js App Router pages
├── components/             # Reusable React components
├── data/                   # Static data (menus, sidebars, etc.)
├── lib/                    # Utility functions and configurations
├── messages/               # i18n translation files (fa.json, en.json)
├── public/                 # Static assets
├── src/
│   ├── db/                 # Database schema, migrations, seed
│   └── i18n/               # Internationalization configuration
├── .env.example            # Environment variables template
├── drizzle.config.ts       # Drizzle ORM configuration
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies and scripts
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Design Principles

This project follows strict design guidelines outlined in [DESIGN_RULES.md](./DESIGN_RULES.md):

- **No hardcoded colors/spacings** - Only design tokens
- **Icons from lucide-react only** - No raw SVGs
- **Full RTL/LTR support** - Logical properties, dynamic `dir` attribute
- **WCAG AA compliance** - 4.5:1 contrast ratio minimum
- **Mobile-first responsive** - 300px to 4K+ support
- **Persian numeral handling** - Via Estedad font ss01 feature
- **Component states** - default, hover, active, focus, disabled, loading

## Security

- All secrets stored in environment variables
- Server-side validation with Zod for all user inputs
- httpOnly, secure, sameSite=strict cookies for auth tokens
- Rate limiting on sensitive endpoints (login, payments)
- Parameterized queries only (no raw SQL concatenation)
- Password hashing with Argon2
- CSP and security headers enabled

## SEO & Performance

- Dynamic metadata API for each page
- JSON-LD structured data
- Automatic sitemap.xml and robots.txt
- hreflang tags for fa/en versions
- Core Web Vitals optimized:
  - LCP < 2.5s
  - INP < 200ms
  - CLS < 0.1

## Deployment

### Vercel (Recommended)

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure environment variables
4. Deploy

### Manual Deployment

1. Build the application:
```bash
pnpm build
```

2. Start the production server:
```bash
pnpm start
```

Ensure you set `NODE_ENV=production` and configure your environment variables accordingly.

## Multi-language Support

The application supports Persian (fa) and English (en) with:

- Dynamic language switching without page reload
- Automatic RTL/LTR layout adjustment
- Localized dates, numbers, and currencies
- Translated form validations, placeholders, and error messages

To add a new language:
1. Create a new JSON file in `/messages` directory
2. Update routing configuration in `src/i18n/routing.ts`

## Database

### Schema Management

```bash
# After modifying src/db/schema.ts
pnpm db:generate    # Create migration files
pnpm db:migrate     # Apply migrations to database
```

### Development Tools

```bash
pnpm db:studio      # Open Drizzle Studio GUI
```

## Testing

```bash
pnpm test           # Run all tests
pnpm test:watch     # Watch mode for development
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure all tests pass (`pnpm test`)
4. Run type checking (`pnpm typecheck`)
5. Run linting (`pnpm lint`)
6. Submit a pull request

## License

Private - All rights reserved

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Radix UI Components](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Estedad Font](https://github.com/aminabedi68/Estedad)
