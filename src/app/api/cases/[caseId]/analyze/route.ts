import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { analyzeCaseWithAI } from '@/lib/services/ai-legal-analysis';

export async function POST(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const analysis = await analyzeCaseWithAI(params.caseId, session.user.id);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error analyzing case:', error);
    return NextResponse.json(
      { error: 'Failed to analyze case' },
      { status: 500 }
    );
  }
}
