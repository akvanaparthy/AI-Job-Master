import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db/prisma';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

// GET - Fetch all resumes for the user
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        isDefault: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ resumes });
  } catch (error: any) {
    console.error('Get resumes error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get resumes' },
      { status: 500 }
    );
  }
}

// POST - Upload new resume
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check current resume count
    const resumeCount = await prisma.resume.count({
      where: { userId: user.id },
    });

    if (resumeCount >= 3) {
      return NextResponse.json(
        { error: 'Maximum of 3 resumes allowed' },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;

    if (!file || !title) {
      return NextResponse.json(
        { error: 'File and title are required' },
        { status: 400 }
      );
    }

    // Extract text from file
    const content = await extractTextFromFile(file);

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract text from file' },
        { status: 400 }
      );
    }

    // Create resume (set as default if it's the first one)
    const isFirstResume = resumeCount === 0;
    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        title: title.trim(),
        content,
        isDefault: isFirstResume,
      },
    });

    return NextResponse.json({
      success: true,
      resume: {
        id: resume.id,
        title: resume.title,
        isDefault: resume.isDefault,
        createdAt: resume.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Upload resume error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload resume' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a resume
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const resumeId = searchParams.get('id');

    if (!resumeId) {
      return NextResponse.json(
        { error: 'Resume ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: user.id,
      },
    });

    if (!resume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }

    // Delete the resume
    await prisma.resume.delete({
      where: { id: resumeId },
    });

    // If deleted resume was default, set another as default
    if (resume.isDefault) {
      const firstResume = await prisma.resume.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });

      if (firstResume) {
        await prisma.resume.update({
          where: { id: firstResume.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete resume error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete resume' },
      { status: 500 }
    );
  }
}

// Helper function to extract text from file
async function extractTextFromFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  
  // For TXT files, return as-is
  if (file.type === 'text/plain') {
    const text = Buffer.from(buffer).toString('utf-8');
    return text.trim();
  }

  // For PDF files, use pdf-parse
  if (file.type === 'application/pdf') {
    try {
      const pdfBuffer = Buffer.from(buffer);
      const data = await pdf(pdfBuffer);
      return data.text.trim();
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error('Failed to parse PDF file. Please ensure it is a valid PDF document.');
    }
  }

  // For DOCX files, use mammoth
  if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      const docxBuffer = Buffer.from(buffer);
      const result = await mammoth.extractRawText({ buffer: docxBuffer });
      return result.value.trim();
    } catch (error) {
      console.error('DOCX parsing error:', error);
      throw new Error('Failed to parse DOCX file. Please ensure it is a valid Word document.');
    }
  }

  throw new Error('Unsupported file type. Please upload a .txt, .pdf, or .docx file.');
}
