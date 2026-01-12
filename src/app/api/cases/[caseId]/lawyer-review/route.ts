import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const requestReviewSchema = z.object({
  reviewType: z.enum(['DEMAND_LETTER', 'COURT_FILING', 'SETTLEMENT_AGREEMENT', 'GENERAL_ADVICE']),
  documentContent: z.string().optional(),
});

// GET - Get lawyer reviews for a case
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

    const reviews = await prisma.lawyerReview.findMany({
      where: { caseId: params.caseId },
      orderBy: { requestedAt: 'desc' },
      include: {
        lawyer: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching lawyer reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST - Request a new lawyer review
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
    const validatedData = requestReviewSchema.parse(body);

    // Get the document content based on review type
    let documentContent = validatedData.documentContent;
    let documentType = validatedData.reviewType;

    if (!documentContent) {
      // Try to get the latest document of the requested type
      if (validatedData.reviewType === 'DEMAND_LETTER') {
        const demandLetter = await prisma.demandLetter.findFirst({
          where: { caseId: params.caseId },
          orderBy: { createdAt: 'desc' },
        });
        documentContent = demandLetter?.content;
      } else if (validatedData.reviewType === 'COURT_FILING') {
        const courtFiling = await prisma.courtFiling.findFirst({
          where: { caseId: params.caseId },
          orderBy: { createdAt: 'desc' },
        });
        documentContent = courtFiling?.content;
      }
    }

    if (!documentContent) {
      return NextResponse.json(
        { error: 'No document content to review' },
        { status: 400 }
      );
    }

    // Create the review request
    const review = await prisma.lawyerReview.create({
      data: {
        caseId: params.caseId,
        userId: session.user.id,
        reviewType: validatedData.reviewType,
        documentType,
        documentContent,
        fee: 20.0, // Fixed fee of 20 EUR
        status: 'PENDING',
      },
    });

    // Create timeline event
    await prisma.timelineEvent.create({
      data: {
        caseId: params.caseId,
        eventType: 'LAWYER_REVIEW_REQUESTED',
        title: 'Užsakyta advokato peržiūra',
        description: `Užsakyta ${documentType} peržiūra. Kaina: 20 EUR`,
        icon: 'user-check',
        color: 'amber',
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'CASE_UPDATE',
        title: 'Advokato peržiūra užsakyta',
        message: 'Jūsų dokumentas bus peržiūrėtas per 24 valandas.',
        caseId: params.caseId,
        actionUrl: `/dashboard/cases/${params.caseId}`,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error requesting lawyer review:', error);
    return NextResponse.json(
      { error: 'Failed to request review' },
      { status: 500 }
    );
  }
}

// PATCH - Update review (for lawyers)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a lawyer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== 'LAWYER' && user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { reviewId, approved, comments, corrections } = body;

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID required' }, { status: 400 });
    }

    // Get the review
    const review = await prisma.lawyerReview.findUnique({
      where: { id: reviewId },
    });

    if (!review || review.caseId !== params.caseId) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Update the review
    const updatedReview = await prisma.lawyerReview.update({
      where: { id: reviewId },
      data: {
        lawyerId: session.user.id,
        status: 'COMPLETED',
        approved,
        comments,
        corrections,
        completedAt: new Date(),
      },
    });

    // Create timeline event
    await prisma.timelineEvent.create({
      data: {
        caseId: params.caseId,
        eventType: 'LAWYER_REVIEW_COMPLETE',
        title: approved ? 'Advokatas patvirtino dokumentą' : 'Advokatas siūlo pataisymus',
        description: comments || 'Peržiūra baigta',
        icon: approved ? 'check-circle' : 'edit',
        color: approved ? 'green' : 'amber',
      },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: review.userId,
        type: 'REVIEW_COMPLETE',
        title: 'Advokato peržiūra baigta',
        message: approved
          ? 'Jūsų dokumentas buvo patvirtintas advokato.'
          : 'Advokatas pateikė siūlomų pataisymų.',
        caseId: params.caseId,
        actionUrl: `/dashboard/cases/${params.caseId}`,
      },
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Error updating lawyer review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}
