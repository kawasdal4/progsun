import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/regulations/[id]/workflow - Update regulation status
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { status, notes } = await request.json()

    const existing = await db.regulation.findUnique({
      where: { id },
      include: { createdBy: { select: { id: true, name: true } } }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Regulation not found' }, { status: 404 })
    }

    const user = await db.user.findFirst()
    const now = new Date()

    // Prepare update data
    const updateData: any = {
      status,
      updatedAt: now
    }

    // If transitioning to FINAL, set finalizedAt and generate nomor if not set
    if (status === 'FINAL' && !existing.finalizedAt) {
      updateData.finalizedAt = now
      
      // Auto-generate nomor if not set
      if (!existing.nomor) {
        const yearRegulations = await db.regulation.count({
          where: {
            tahun: existing.tahun,
            jenis: existing.jenis,
            nomor: { not: null }
          }
        })
        updateData.nomor = String(yearRegulations + 1)
      }
    }

    // If transitioning to DICABUT, set dicabutAt
    if (status === 'DICABUT') {
      updateData.dicabutAt = now
    }

    // Create version snapshot before status change
    await db.regulationVersion.create({
      data: {
        regulationId: id,
        versionNumber: existing.version,
        changeSummary: `Status changed from ${existing.status} to ${status}${notes ? `: ${notes}` : ''}`,
        snapshot: {
          status: existing.status,
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
      data: updateData,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    // Create approval record if status is FINAL or REVISI (rejected)
    if (status === 'FINAL' || status === 'REVISI') {
      await db.approvalRecord.create({
        data: {
          regulationId: id,
          approvedById: user?.id || '',
          action: status === 'FINAL' ? 'APPROVED' : 'REQUEST_REVISION',
          notes
        }
      })
    }

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: user?.id || '',
        action: `STATUS_CHANGE_${status}`,
        entityType: 'Regulation',
        entityId: id,
        details: { 
          previousStatus: existing.status,
          newStatus: status,
          notes,
          message: `Status changed to ${status}: ${existing.tentang}`
        },
        regulationId: id
      }
    })

    return NextResponse.json(regulation)
  } catch (error) {
    console.error('Error updating workflow:', error)
    return NextResponse.json({ error: 'Failed to update workflow' }, { status: 500 })
  }
}
