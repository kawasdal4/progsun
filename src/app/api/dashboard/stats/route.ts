import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/dashboard/stats
export async function GET() {
  try {
    const currentYear = new Date().getFullYear()

    const [
      totalRegulations,
      draftCount,
      pendingApproval,
      finalThisYear,
      byJenis,
      byStatus,
      recentActivity
    ] = await Promise.all([
      // Total regulations
      db.regulation.count(),
      
      // Draft count (all non-final statuses)
      db.regulation.count({
        where: {
          status: { in: ['DRAFT_WILAYAH', 'REVIEW_SUBSTANSI', 'REVIEW_HUKUM', 'REVISI'] }
        }
      }),
      
      // Pending approval
      db.regulation.count({
        where: { status: 'MENUNGGU_PERSETUJUAN' }
      }),
      
      // Final this year
      db.regulation.count({
        where: {
          status: 'FINAL',
          tahun: currentYear
        }
      }),
      
      // By jenis
      db.regulation.groupBy({
        by: ['jenis'],
        _count: { id: true }
      }),
      
      // By status
      db.regulation.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      
      // Recent activity
      db.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, role: true } }
        }
      })
    ])

    // Transform groupBy results
    const byJenisMap = byJenis.reduce((acc, item) => {
      acc[item.jenis] = item._count.id
      return acc
    }, {} as Record<string, number>)

    const byStatusMap = byStatus.reduce((acc, item) => {
      acc[item.status] = item._count.id
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      stats: {
        totalRegulations,
        draftCount,
        pendingApproval,
        finalThisYear,
        byJenis: byJenisMap,
        byStatus: byStatusMap,
        recentActivity
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 })
  }
}
