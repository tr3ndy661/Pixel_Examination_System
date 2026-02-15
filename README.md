# Pixel Examination System

A modern, full-featured online examination platform built with Next.js 15, Payload CMS, and PostgreSQL.

## Features

### Student Portal
- 📝 Take tests with timer and auto-save
- 📊 View detailed results with explanations
- 📈 Track progress and performance
- 🎯 Mock test mode for practice
- 📱 Fully responsive mobile design
- 💬 Feedback system

### Admin Panel
- 👥 User management
- 📚 Test and question management
- 📋 View all test attempts
- 💾 Full CRUD operations
- 📊 Feedback monitoring

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **CMS:** Payload CMS 3.0
- **Database:** PostgreSQL
- **Auth:** JWT
- **Styling:** Tailwind CSS
- **Language:** TypeScript

## Quick Start

### Development

1. **Clone and install:**
```bash
git clone <repository-url>
cd pixel-examination-systems-main
npm install
```

2. **Setup environment:**
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DATABASE_URI=postgresql://user:password@localhost:5432/exam_db
PAYLOAD_SECRET=your-secret-key-min-32-characters
```

3. **Run development server:**
```bash
npm run dev
```

4. **Access:**
- Frontend: http://localhost:3000
- Admin: http://localhost:3000/admin

### Production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed production deployment instructions.

**Quick production build:**
```bash
npm run build
npm start
```

**Docker:**
```bash
docker-compose up -d
```

## Project Structure

```
src/
├── app/
│   ├── (frontend)/          # Student-facing pages
│   │   ├── dashboard/       # Student dashboard
│   │   ├── tests/           # Test taking interface
│   │   ├── results/         # Results viewing
│   │   └── profile/         # User profile
│   └── api/                 # API routes
├── collections/             # Payload CMS collections
│   ├── Users.ts
│   ├── Tests.ts
│   ├── Questions.ts
│   ├── TestAttempts.ts
│   └── Feedbacks.ts
└── lib/                     # Utilities and helpers
```

## Environment Variables

Required:
- `DATABASE_URI` - PostgreSQL connection string
- `PAYLOAD_SECRET` - Secret key for JWT (32+ chars)

Optional:
- `NEXT_PUBLIC_SERVER_URL` - Public URL for production
- `NODE_ENV` - Environment (development/production)

## Default Credentials

After first deployment, create admin user at `/admin`

## Features in Detail

### Test Taking
- Multiple question types (MCQ, True/False, Short Answer)
- Question flagging for review
- Auto-save functionality
- Timer with warnings
- Mock test mode

### Results
- Detailed score breakdown
- Question-by-question review
- Correct answer explanations
- Performance analytics
- Filter by test/date

### Admin
- Manage users and roles
- Create and edit tests
- Question bank management
- View all submissions
- Monitor feedback

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run generate:types` - Generate TypeScript types

## Deployment Platforms

- ✅ Vercel (Recommended)
- ✅ Docker/Docker Compose
- ✅ VPS (DigitalOcean, AWS, etc.)
- ✅ Railway
- ✅ Render

## Support

For issues and questions:
1. Check [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Review error logs
3. Verify environment variables
4. Check database connection

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.
