import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
// GET /api/regulations/[id]/versions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const versions = await db.regulationVersion.findMany({
      where: { regulationId: id },
      orderBy: { versionNumber: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true } }
      }
    })

    return NextResponse.json({ versions })
  } catch (error) {
    console.error('Error fetching versions:', error)
    return NextResponse.json({ error: 'Failed to fetch versions' }, { status: 500 })
  }
}
