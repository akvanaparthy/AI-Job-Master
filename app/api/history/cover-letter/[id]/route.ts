import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db/prisma';

// GET - Fetch a single cover letter
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the cover letter
    const coverLetter = await prisma.coverLetter.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!coverLetter) {
      return NextResponse.json(
        { error: 'Cover letter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ coverLetter });
  } catch (error: any) {
    console.error('Fetch cover letter error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch cover letter' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a cover letter
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const coverLetter = await prisma.coverLetter.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!coverLetter) {
      return NextResponse.json(
        { error: 'Cover letter not found' },
        { status: 404 }
      );
    }

    // Delete the cover letter
    await prisma.coverLetter.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete cover letter error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete cover letter' },
      { status: 500 }
    );
  }
}
