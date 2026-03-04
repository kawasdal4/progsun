import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/regulations/[id] - Get single regulation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const regulation = await db.regulation.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true, unitKerja: true }
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 10,
          include: {
            createdBy: { select: { id: true, name: true } }
          }
        },
        sourceRelations: {
          include: {
            target: { select: { id: true, tentang: true, nomor: true, tahun: true, jenis: true } }
          }
        },
        targetRelations: {
          include: {
            source: { select: { id: true, tentang: true, nomor: true, tahun: true, jenis: true } }
          }
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, role: true } }
          }
        }
      }
    })

    if (!regulation) {
      return NextResponse.json({ error: 'Regulation not found' }, { status: 404 })
    }

    return NextResponse.json(regulation)
  } catch (error) {
    console.error('Error fetching regulation:', error)
    return NextResponse.json({ error: 'Failed to fetch regulation' }, { status: 500 })
  }
}

// PUT /api/regulations/[id] - Update regulation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    // Get existing regulation
    const existing = await db.regulation.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Regulation not found' }, { status: 404 })
    }

    // Check if FINAL - cannot edit
    if (existing.status === 'FINAL') {
      return NextResponse.json({ error: 'Cannot edit FINAL regulation' }, { status: 400 })
    }

    // Create version snapshot before update
    const user = await db.user.findFirst()
    const versionCount = await db.regulationVersion.count({
      where: { regulationId: id }
    })

    await db.regulationVersion.create({
      data: {
        regulationId: id,
        versionNumber: existing.version,
        changeSummary: `Auto-saved before update`,
        snapshot: {
          header: existing.header,
          konsiderans: existing.konsiderans,
          diktum: existing.diktum,
          batangTubuh: existing.batangTubuh,
          penutup: existing.penutup
        },
        createdById: user?.id || ''
      }
    })

    // Update regulation
    const regulation = await db.regulation.update({
      where: { id },
      data: {
        jenis: data.jenis,
        tahun: data.tahun,
        tentang: data.tentang,
        unitKerja: data.unitKerja,
        header: data.header,
        konsiderans: data.konsiderans,
        diktum: data.diktum,
        batangTubuh: data.batangTubuh,
        penutup: data.penutup,
        lampiran: data.lampiran,
        version: { increment: 1 },
        updatedAt: new Date()
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    // Update search index
    const searchContent = `${regulation.tentang} ${JSON.stringify(regulation.batangTubuh)} ${JSON.stringify(regulation.konsiderans)}`.toLowerCase()
    await db.searchIndex.upsert({
      where: { regulationId: id },
      create: {
        regulationId: id,
        content: searchContent
      },
      update: {
        content: searchContent,
        updatedAt: new Date()
      }
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: user?.id || '',
        action: 'UPDATE_REGULATION',
        entityType: 'Regulation',
        entityId: id,
        details: { message: `Updated regulation: ${regulation.tentang}` },
        regulationId: id
      }
    })

    return NextResponse.json(regulation)
  } catch (error) {
    console.error('Error updating regulation:', error)
    return NextResponse.json({ error: 'Failed to update regulation' }, { status: 500 })
  }
}

// DELETE /api/regulations/[id] - Delete regulation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const existing = await db.regulation.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Regulation not found' }, { status: 404 })
    }

    // Check if FINAL - cannot delete
    if (existing.status === 'FINAL') {
      return NextResponse.json({ error: 'Cannot delete FINAL regulation' }, { status: 400 })
    }

    // Delete related records first
    await db.searchIndex.deleteMany({ where: { regulationId: id } })
    await db.comment.deleteMany({ where: { regulationId: id } })
    await db.regulationVersion.deleteMany({ where: { regulationId: id } })
    await db.regulationRelation.deleteMany({ where: { sourceId: id } })
    await db.regulationRelation.deleteMany({ where: { targetId: id } })
    
    // Delete regulation
    await db.regulation.delete({ where: { id } })

    // Create audit log
    const user = await db.user.findFirst()
    await db.auditLog.create({
      data: {
        userId: user?.id || '',
        action: 'DELETE_REGULATION',
        entityType: 'Regulation',
        entityId: id,
        details: { message: `Deleted regulation: ${existing.tentang}` }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting regulation:', error)
    return NextResponse.json({ error: 'Failed to delete regulation' }, { status: 500 })
  }
}
