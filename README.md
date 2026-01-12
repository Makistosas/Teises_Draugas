# Teisės Draugas (Legal Friend)

AI-powered legal assistant platform for Lithuanian civil disputes up to 5000 EUR.

## Overview

Teisės Draugas is an AI-driven Legal Agent tailored to Lithuania's civil justice system. The platform actively assists and executes key legal steps for users, specializing in civil disputes under 5,000 EUR where hiring a lawyer often costs more than the claim itself.

## Features

### Core Capabilities

- **Automated Case Assessment**: Upload evidence (screenshots, contracts, correspondence) and get AI analysis with win probability based on Lithuanian Civil Code
- **Demand Letter Generation**: Automatically generate professional demand letters (pretenzija) with proper legal citations
- **E. pristatymas Integration**: Send official documents via Lithuania's electronic delivery system
- **AI-Guided Negotiation**: Get recommendations for negotiating settlements based on similar case patterns
- **One-Click Court Filing**: Generate LITEKO-compatible court documents for e.teismas.lt submission
- **Bilingual Support**: Full Lithuanian and English interface

### Target Use Cases

- **Vinted Disputes**: Buyer/seller conflicts on the marketplace
- **Airbnb/Rental Issues**: Security deposit disputes, property damage claims
- **Unpaid Invoices**: Freelancer payment collection via court orders (teismo isakymas)
- **Consumer Disputes**: E-commerce issues, service complaints

### EU AI Act Compliance

- Transparent AI disclosure on all generated content
- Human-in-the-loop lawyer review option (20 EUR flat fee)
- Full audit logging of AI interactions
- GDPR-compliant data handling

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (Email, Smart-ID, Mobile-ID)
- **AI**: Anthropic Claude API
- **State Management**: TanStack Query, Zustand

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   └── cases/         # Case management API
│   ├── auth/              # Auth pages (login, register)
│   └── dashboard/         # Dashboard pages
├── components/
│   ├── case/              # Case-specific components
│   ├── compliance/        # AI Act compliance components
│   ├── layout/            # Header, Footer
│   └── ui/                # Base UI components
├── lib/
│   ├── i18n/              # Internationalization
│   └── services/          # Business logic services
│       ├── ai-legal-analysis.ts
│       ├── demand-letter-generator.ts
│       └── court-filing-generator.ts
└── prisma/
    └── schema.prisma      # Database schema
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Anthropic API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/teises-draugas.git
cd teises-draugas
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
npm run db:generate
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Environment Variables

See `.env.example` for all required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth.js secret
- `ANTHROPIC_API_KEY` - Claude API key
- `SMART_ID_*` - Smart-ID integration credentials
- `MOBILE_ID_*` - Mobile-ID integration credentials
- `E_PRISTATYMAS_*` - E. pristatymas API credentials
- `E_TEISMAS_*` - e.teismas API credentials

## API Endpoints

### Cases
- `GET /api/cases` - List user's cases
- `POST /api/cases` - Create new case
- `GET /api/cases/[id]` - Get case details
- `PATCH /api/cases/[id]` - Update case
- `DELETE /api/cases/[id]` - Delete case

### Documents
- `GET /api/cases/[id]/documents` - List case documents
- `POST /api/cases/[id]/documents` - Upload document

### AI Analysis
- `POST /api/cases/[id]/analyze` - Run AI case analysis

### Demand Letters
- `GET /api/cases/[id]/demand-letter` - List demand letters
- `POST /api/cases/[id]/demand-letter` - Generate new letter
- `PUT /api/cases/[id]/demand-letter` - Send via E. pristatymas

### Lawyer Review
- `GET /api/cases/[id]/lawyer-review` - Get reviews
- `POST /api/cases/[id]/lawyer-review` - Request review

## Database Schema

Key models:
- `User` - User accounts with role support (USER, LAWYER, ADMIN)
- `Case` - Legal cases with status tracking
- `Document` - Uploaded evidence and documents
- `DemandLetter` - Generated demand letters
- `CourtFiling` - Court submission documents
- `LawyerReview` - Human review requests
- `TimelineEvent` - Case progress tracking
- `AIInteractionLog` - AI compliance logging

## Legal Disclaimer

Teises Draugas is an AI assistant, not a licensed attorney. All recommendations are for guidance purposes only. For complex cases, we recommend consulting a qualified attorney.

## License

This project is proprietary software. All rights reserved.

## Contact

- Email: info@teisesdraugas.lt
- Website: https://teisesdraugas.lt
