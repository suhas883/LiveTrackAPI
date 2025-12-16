# LiveTrackings.com - Deployment Guide

## Download
Download the project archive from your Replit app:
`https://your-replit-url.replit.app/livetrackings-export.tar.gz`

Extract with: `tar -xzf livetrackings-export.tar.gz`

## Environment Variables Required

```env
# TrackingMore API (Required for live tracking)
TRACKINGMORE_API_KEY=your_trackingmore_api_key

# Perplexity API (Required for AI predictions)
PERPLEXITY_API_KEY=your_perplexity_api_key

# PostgreSQL Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Session Secret (generate a random string)
SESSION_SECRET=your_random_session_secret
```

## Deployment Options

### Option 1: Vercel (Requires Modifications)

Vercel is serverless-focused. This app needs modifications:

1. **Split the app:**
   - Deploy frontend to Vercel
   - Deploy API to Railway/Render/Fly.io

2. **Or use Vercel Serverless Functions:**
   - Move Express routes to `/api` folder as serverless functions
   - Use Vercel Postgres or external database

### Option 2: Railway (Recommended - Easiest)

1. Push to GitHub
2. Connect GitHub to Railway
3. Railway auto-detects Node.js
4. Add environment variables in Railway dashboard
5. Railway provides free PostgreSQL

```bash
# Railway CLI
railway login
railway init
railway up
```

### Option 3: Render

1. Push to GitHub
2. Create new "Web Service" on Render
3. Connect your repository
4. Set build command: `npm install && npm run build`
5. Set start command: `npm start`
6. Add environment variables
7. Create PostgreSQL database on Render

### Option 4: Fly.io

```bash
# Install Fly CLI
fly launch
fly secrets set TRACKINGMORE_API_KEY=xxx
fly secrets set PERPLEXITY_API_KEY=xxx
fly secrets set DATABASE_URL=xxx
fly deploy
```

## Build Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start

# Development mode
npm run dev
```

## Database Setup

The app uses Drizzle ORM with PostgreSQL. After setting DATABASE_URL:

```bash
# Push schema to database
npm run db:push
```

## Project Structure

```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── lib/
├── server/           # Express backend
│   ├── routes.ts     # API endpoints
│   ├── trackingmore.ts  # TrackingMore integration
│   ├── perplexity.ts # Perplexity AI integration
│   └── storage.ts    # Database operations
├── shared/           # Shared types
│   └── schema.ts     # Database schema
└── package.json
```

## API Endpoints

- `POST /api/track` - Track a package
- `GET /api/history` - Get tracking history
- `DELETE /api/history/:id` - Delete history item

## Architecture

```
┌─────────────────────────────────────────────┐
│  TrackingMore API (Live Data Layer)         │
│  - 1,500+ carriers worldwide                │
│  - Real-time tracking events                │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  Perplexity RAG (AI Intelligence Layer)     │
│  - Delivery predictions                     │
│  - Delay risk analysis                      │
│  - Smart recommendations                    │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  PostgreSQL (Data Persistence)              │
│  - Tracking records                         │
│  - Search history                           │
└─────────────────────────────────────────────┘
```

## Support

For TrackingMore API: https://www.trackingmore.com
For Perplexity API: https://www.perplexity.ai
