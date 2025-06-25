# Team Productivity Reporting Platform
*An analytics dashboard for engineering team productivity metrics*

## Features

- 📊 **Sprint Velocity Tracking** - Monitor team performance across sprints
- 🐞 **Bug Rate Analysis** - Track and analyze defect trends
- ⏱️ **Resolution Time Metrics** - Measure ticket and issue resolution efficiency
- 🔍 **Natural Language Queries** - Query data using plain English (e.g., "Show Q1 velocity for Frontend")
- 📤 **PDF Report Generation** - Export comprehensive reports
- 🚀 **Real-time Data Updates** - Live dashboard updates

## Tech Stack

| Component       | Technology                  |
|-----------------|----------------------------|
| Frontend        | Next.js 14 + Tailwind CSS |
| Backend         | Express.js + TypeScript    |
| Database        | PostgreSQL 15              |
| ORM             | Prisma                     |
| NLP Processing  | Custom Regex Engine        |
| PDF Generation  | React-to-PDF               |

## Prerequisites

- Node.js v18+
- PostgreSQL 15+
- PNPM (recommended)

## Setup Guide

### 1. Clone the Repository

```bash
git clone <repository-url>
cd team-productivity-platform
```

### 2. Database Configuration

```bash
# Create PostgreSQL database
createdb team_productivity

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials (see Environment Variables section)
```

### 3. Install Dependencies

```bash
# Using PNPM (recommended)
pnpm install

# Or with NPM
npm install
```

### 4. Database Setup

```bash
# Run migrations
pnpm prisma migrate dev

# Seed sample data (optional)
pnpm prisma db seed
```

### 5. Start Development Servers

```bash
# Start backend (port 3001)
cd backend && pnpm dev

# In a new terminal, start frontend (port 3000)
cd frontend && pnpm dev
```

## Environment Variables

### Backend (.env)
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/team_productivity"
BACKEND_PORT=3001
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

## Project Structure

```
.
├── backend/
│   ├── prisma/           # Database schema and migrations
│   ├── src/
│   │   ├── services/     # Metrics and NLP services
│   │   ├── routes/       # API endpoints
│   │   └── index.ts      # Express server
├── frontend/
│   ├── components/       # React components
│   ├── lib/              # API client utilities
│   └── pages/            # Next.js routes
└── docs/                 # Screenshots and documentation assets
```

## Available Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development servers (both frontend & backend) |
| `pnpm build` | Create production build |
| `pnpm prisma studio` | Open database GUI |
| `pnpm test` | Run Jest tests |
| `pnpm lint` | Run ESLint |

## API Documentation

### Key Endpoints

**Get Velocity Metrics**
```http
GET /api/metrics/velocity?team=frontend&sprintId=123
```

**Natural Language Query**
```http
POST /api/metrics/text-query
Content-Type: application/json

{
  "query": "show Q1 bugs for backend team"
}
```

## Troubleshooting

### Common Issues

**Issue**: Prisma migration fails  
**Fix**: Ensure PostgreSQL is running and credentials in `.env` are correct

**Issue**: CORS errors during development  
**Fix**: Verify `FRONTEND_URL` in backend `.env` matches your development URL

**Issue**: PDF generation breaks  
**Fix**: Install Chromium dependencies:

```bash
# Ubuntu/Debian
sudo apt-get install chromium-browser

# macOS
brew install chromium

# Windows
# Download and install Chrome/Chromium manually
```

**Issue**: Natural language queries not working  
**Fix**: Check that the NLP service is running and regex patterns are configured correctly

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Workflow

### Database Changes
```bash
# After modifying prisma/schema.prisma
pnpm prisma migrate dev --name describe_your_change
pnpm prisma generate
```

### Testing
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test metrics.service.test.ts
```

### Building for Production
```bash
# Build both frontend and backend
pnpm build

# Start production server
pnpm start
```

## License

[MIT License](LICENSE) - see the LICENSE file for details.

## Support

For issues and questions:
- Create an issue in this repository
- Check the [troubleshooting section](#troubleshooting)
- Review the [API documentation](docs/api-reference.md)