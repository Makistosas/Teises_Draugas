import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const documentMetadataSchema = z.object({
  documentType: z.enum([
    'SCREENSHOT',
    'CONTRACT',
    'INVOICE',
    'CORRESPONDENCE',
    'PHOTO_EVIDENCE',
    'IDENTITY',
    'BANK_STATEMENT',
    'COURT_DOCUMENT',
    'OTHER',
  ]),
  description: z.string().optional(),
});

// GET - List documents for a case
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

    const documents = await prisma.document.findMany({
      where: { caseId: params.caseId },
      orderBy: { uploadedAt: 'desc' },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST - Upload document
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metadata = formData.get('metadata') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be under 10MB' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      );
    }

    // Parse metadata
    let parsedMetadata;
    try {
      parsedMetadata = documentMetadataSchema.parse(JSON.parse(metadata || '{}'));
    } catch {
      parsedMetadata = { documentType: 'OTHER' as const };
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'uploads', params.caseId);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}-${file.name}`;
    const filePath = path.join(uploadDir, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create document record
    const document = await prisma.document.create({
      data: {
        userId: session.user.id,
        caseId: params.caseId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        filePath: `/uploads/${params.caseId}/${filename}`,
        documentType: parsedMetadata.documentType,
        description: parsedMetadata.description,
      },
    });

    // Create timeline event
    await prisma.timelineEvent.create({
      data: {
        caseId: params.caseId,
        eventType: 'DOCUMENT_UPLOADED',
        title: 'Dokumentas įkeltas',
        description: `Įkeltas dokumentas: ${file.name}`,
        icon: 'file-up',
        color: 'blue',
        documentId: document.id,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
