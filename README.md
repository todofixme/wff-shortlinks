# WfF Shortlinks

A React-based link shortener application for [wff-berlin.de](https://wff-berlin.de) that generates short, trackable links with optional UTM parameters and resolves them via Apache mod_rewrite rules.

## Purpose

This application serves two primary functions:

1. **Generate Short Links**: Convert long wff-berlin.de URLs with many query parameters into short, easy-to-read links with optional UTM tracking parameters (source, campaign)
2. **Resolve Short Links**: Apache mod_rewrite rules redirect short links back to their original long URLs with query parameters intact

## URL Patterns

The application recognizes and converts the following wff-berlin.de URL patterns:

| Pattern Type | Long URL | Short URL |
|--------------|----------|-----------|
| **News** | `?action=start_news&cmd=view&id=123` | `/n/123` |
| **Veranstaltung** | `?veranstaltung=456` | `/v/456` |
| **Veranstaltung Anmelden** | `?veranstaltunganmelden=789` | `/va/789` |
| **Events Anmeldungen** | `?action=events_anmeldungen&id=101` | `/ea/101` |
| **Newsletter** | `?newsletter=abc` | `/nl/abc` |
| **Article** | `?artikel=202` | `/a/202` |
| **Newsletter + Article** | `?newsletter=abc&artikel=202` | `/a/202/nl/abc` |
| **Downloads** | `?action=data_raum&id=99&download=file.pdf` | `/dr/99/dl/file.pdf` |

### UTM Parameters

Short links can be enriched with tracking parameters:

- **UTM Source**: `/s/{source}` - Supported sources: email, mail, ert, strava, whatsapp, instagram, facebook
- **UTM Campaign**: `/c/{campaign}` - Free-form campaign identifier

**Example**: `/v/456/s/email/c/nl2512` resolves to:
```
https://wff-berlin.de/?veranstaltung=456&utm_source=email&utm_campaign=nl2512
```

### Modifying URL Patterns

To add new URL patterns:

1. Add pattern to `URL_PATTERNS` array in `src/lib/shortener.ts`
2. Add corresponding RewriteRule to `htaccess` file
3. Add tests in `src/lib/shortener.test.ts`
4. Add pattern to `URL Patterns` in this file

## Technologies Used

### Frontend
- **React 19** - JavaScript UI framework
- **TypeScript** - Type-safe development
- **Vite 7** - Fast build tool with SWC for hot module replacement
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Accessible and reusable UI components
- **Lucide React** - Icon library

### Testing & Development
- **Vitest** - Unit testing framework
- **ESLint** - Code linting with TypeScript support
- **pnpm** - Fast, disk-efficient package manager

### Deployment
- **Apache HTTP Server 2.4** - Web server with mod_rewrite for URL resolution
- **Docker Compose** - Containerized deployment

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- pnpm (`npm install -g pnpm`)
- Docker & Docker Compose (for deployment)

### Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Run linting
pnpm lint

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Local Deployment with Docker

```bash
# Build the application for local testing
VITE_SHORT_URL_BASE=http://localhost pnpm build

# Start Apache server
docker compose up -d

# View logs
docker compose logs -f

# Stop server
docker compose down
```

The app will be accessible at `http://localhost/app/` when running via Docker.

**Note**: The `VITE_SHORT_URL_BASE` environment variable must be set during the build step to generate short links that work with your local Docker setup (`http://localhost` instead of the production domain).

## Project Structure

```
.
├── src/
│   ├── components/ui/      # shadcn/ui components
│   ├── lib/
│   │   ├── shortener.ts    # Core URL shortening logic
│   │   ├── shortener.test.ts # Tests
│   │   └── utils.ts        # Utility functions
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── httpd.conf              # Apache configuration
├── htaccess                # mod_rewrite rules
├── compose.yml             # Docker Compose configuration
└── vite.config.ts          # Vite build configuration
```

## Development Notes

- The app validates that all input URLs start with `https://wff-berlin.de`
- Downloads use PHP-style URL encoding (spaces as `+` instead of `%20`)
- Apache rewrite rules chain together using the `[N]` flag - each rule processes one URL segment at a time, restarting the rewrite process until all segments are converted to query parameters
