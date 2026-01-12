import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { generateCaseNumber } from '@/lib/utils';

const createCaseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  caseType: z.enum([
    'CONSUMER_DISPUTE',
    'RENTAL_DEPOSIT',
    'UNPAID_INVOICE',
    'CONTRACT_BREACH',
    'PROPERTY_DAMAGE',
    'SERVICE_COMPLAINT',
    'EMPLOYMENT_DISPUTE',
    'OTHER',
  ]),
  category: z.enum([
    'VINTED',
    'AIRBNB',
    'FREELANCE',
    'LANDLORD_TENANT',
    'ONLINE_PURCHASE',
    'LOCAL_SERVICE',
    'OTHER',
  ]),
  claimAmount: z.number().positive().max(5000, 'Claim amount must be under 5000 EUR'),
  opponentName: z.string().optional(),
  opponentEmail: z.string().email().optional().or(z.literal('')),
  opponentPhone: z.string().optional(),
  opponentAddress: z.string().optional(),
  opponentType: z.enum(['INDIVIDUAL', 'COMPANY', 'PLATFORM', 'GOVERNMENT']).optional(),
  incidentDate: z.string().optional(),
});

// GET - List user's cases
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where = {
      userId: session.user.id,
      ...(status && { status: status as any }),
    };

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: {
              documents: true,
              communications: true,
            },
          },
        },
      }),
      prisma.case.count({ where }),
    ]);

    return NextResponse.json({
      cases,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cases' },
      { status: 500 }
    );
  }
}

// POST - Create new case
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createCaseSchema.parse(body);

    const caseNumber = generateCaseNumber();

    const newCase = await prisma.case.create({
      data: {
        userId: session.user.id,
        caseNumber,
        title: validatedData.title,
        description: validatedData.description,
        caseType: validatedData.caseType,
        category: validatedData.category,
        claimAmount: validatedData.claimAmount,
        opponentName: validatedData.opponentName,
        opponentEmail: validatedData.opponentEmail || null,
        opponentPhone: validatedData.opponentPhone,
        opponentAddress: validatedData.opponentAddress,
        opponentType: validatedData.opponentType,
        incidentDate: validatedData.incidentDate
          ? new Date(validatedData.incidentDate)
          : null,
        status: 'INTAKE',
        currentStep: 'ANALYSIS',
      },
    });

    // Create initial timeline event
    await prisma.timelineEvent.create({
      data: {
        caseId: newCase.id,
        eventType: 'CASE_CREATED',
        title: 'Byla sukurta',
        description: `Byla "${newCase.title}" buvo sukurta`,
        icon: 'file-plus',
        color: 'blue',
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'CASE_UPDATE',
        title: 'Nauja byla sukurta',
        message: `Jūsų byla "${newCase.title}" buvo sėkmingai sukurta. Galite įkelti įrodymus ir pradėti analizę.`,
        caseId: newCase.id,
        actionUrl: `/dashboard/cases/${newCase.id}`,
      },
    });

    return NextResponse.json(newCase, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating case:', error);
    return NextResponse.json(
      { error: 'Failed to create case' },
      { status: 500 }
    );
  }
}
