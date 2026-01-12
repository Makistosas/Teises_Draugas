import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  generateDemandLetter,
  sendViaEPristatymas,
} from '@/lib/services/demand-letter-generator';
import { z } from 'zod';

const generateSchema = z.object({
  tone: z.enum(['formal', 'firm', 'final_warning']).default('formal'),
  responseDeadlineDays: z.number().min(7).max(30).default(14),
});

const sendSchema = z.object({
  demandLetterId: z.string(),
});

// GET - List demand letters for a case
export async function GET(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify case ownership
    const caseData = await prisma.case.findFirst({
      where: {
        id: params.caseId,
        userId: session.user.id,
      },
    });

    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const demandLetters = await prisma.demandLetter.findMany({
      where: { caseId: params.caseId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(demandLetters);
  } catch (error) {
    console.error('Error fetching demand letters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch demand letters' },
      { status: 500 }
    );
  }
}

// POST - Generate new demand letter
export async function POST(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify case ownership
    const caseData = await prisma.case.findFirst({
      where: {
        id: params.caseId,
        userId: session.user.id,
      },
    });

    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = generateSchema.parse(body);

    const letter = await generateDemandLetter({
      caseId: params.caseId,
      userId: session.user.id,
      tone: validatedData.tone,
      responseDeadlineDays: validatedData.responseDeadlineDays,
    });

    return NextResponse.json(letter, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error generating demand letter:', error);
    return NextResponse.json(
      { error: 'Failed to generate demand letter' },
      { status: 500 }
    );
  }
}

// PUT - Send demand letter via E. pristatymas
export async function PUT(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = sendSchema.parse(body);

    const result = await sendViaEPristatymas(
      validatedData.demandLetterId,
      session.user.id
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Demand letter sent successfully',
      deliveryRef: result.deliveryRef,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error sending demand letter:', error);
    return NextResponse.json(
      { error: 'Failed to send demand letter' },
      { status: 500 }
    );
  }
}
