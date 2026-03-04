import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
// GET /api/regulations/[id]/comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const comments = await db.comment.findMany({
      where: { regulationId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, role: true } }
      }
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

// POST /api/regulations/[id]/comments
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { content, section } = await request.json()

    const user = await db.user.findFirst()

    const comment = await db.comment.create({
      data: {
        regulationId: id,
        userId: user?.id || '',
        content,
        section
      },
      include: {
        user: { select: { id: true, name: true, role: true } }
      }
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: user?.id || '',
        action: 'ADD_COMMENT',
        entityType: 'Comment',
        entityId: comment.id,
        details: { message: `Added comment to regulation` },
        regulationId: id
      }
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
