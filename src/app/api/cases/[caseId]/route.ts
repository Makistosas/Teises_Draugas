import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateCaseSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  opponentName: z.string().optional(),
  opponentEmail: z.string().email().optional().or(z.literal('')),
  opponentPhone: z.string().optional(),
  opponentAddress: z.string().optional(),
  opponentType: z.enum(['INDIVIDUAL', 'COMPANY', 'PLATFORM', 'GOVERNMENT']).optional(),
  status: z.enum([
    'INTAKE',
    'ANALYSIS',
    'DEMAND_LETTER',
    'AWAITING_RESPONSE',
    'NEGOTIATION',
    'PREPARING_FILING',
    'FILED',
    'IN_COURT',
    'RESOLVED',
    'CLOSED',
  ]).optional(),
  currentStep: z.enum([
    'ANALYSIS',
    'DEMAND_LETTER',
    'RESPONSE',
    'COURT_FILING',
    'RESOLUTION',
  ]).optional(),
});

// GET - Get single case
export async function GET(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const caseData = await prisma.case.findFirst({
      where: {
        id: params.caseId,
        userId: session.user.id,
      },
      include: {
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
        communications: {
          orderBy: { createdAt: 'desc' },
        },
        timelineEvents: {
          orderBy: { eventDate: 'desc' },
        },
        demandLetters: {
          orderBy: { createdAt: 'desc' },
        },
        courtFilings: {
          orderBy: { createdAt: 'desc' },
        },
        negotiations: {
          orderBy: { createdAt: 'desc' },
        },
        lawyerReviews: {
          orderBy: { requestedAt: 'desc' },
          include: {
            lawyer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    return NextResponse.json(caseData);
  } catch (error) {
    console.error('Error fetching case:', error);
    return NextResponse.json(
      { error: 'Failed to fetch case' },
      { status: 500 }
    );
  }
}

// PATCH - Update case
export async function PATCH(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const existingCase = await prisma.case.findFirst({
      where: {
        id: params.caseId,
        userId: session.user.id,
      },
    });

    if (!existingCase) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateCaseSchema.parse(body);

    const updatedCase = await prisma.case.update({
      where: { id: params.caseId },
      data: {
        ...validatedData,
        opponentEmail: validatedData.opponentEmail || null,
      },
    });

    return NextResponse.json(updatedCase);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating case:', error);
    return NextResponse.json(
      { error: 'Failed to update case' },
      { status: 500 }
    );
  }
}

// DELETE - Delete case
export async function DELETE(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const existingCase = await prisma.case.findFirst({
      where: {
        id: params.caseId,
        userId: session.user.id,
      },
    });

    if (!existingCase) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Only allow deletion of cases in INTAKE status
    if (existingCase.status !== 'INTAKE' && existingCase.status !== 'CLOSED') {
      return NextResponse.json(
        { error: 'Cannot delete case in progress. Close the case first.' },
        { status: 400 }
      );
    }

    await prisma.case.delete({
      where: { id: params.caseId },
    });

    return NextResponse.json({ message: 'Case deleted successfully' });
  } catch (error) {
    console.error('Error deleting case:', error);
    return NextResponse.json(
      { error: 'Failed to delete case' },
      { status: 500 }
    );
  }
}
