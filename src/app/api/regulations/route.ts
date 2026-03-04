import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/regulations - List regulations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const jenis = searchParams.get('jenis')
    const search = searchParams.get('search')

    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (jenis && jenis !== 'all') {
      where.jenis = jenis
    }
    
    if (search) {
      where.OR = [
        { tentang: { contains: search } },
        { nomor: { contains: search } }
      ]
    }

    const regulations = await db.regulation.findMany({
      where,
      select: {
        id: true,
        jenis: true,
        nomor: true,
        tahun: true,
        tentang: true,
        status: true,
        unitKerja: true,
        version: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: { id: true, name: true, email: true, role: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({ regulations })
  } catch (error) {
    console.error('Error fetching regulations:', error)
    return NextResponse.json({ error: 'Failed to fetch regulations' }, { status: 500 })
  }
}

// POST /api/regulations - Create regulation
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Get user from session (simplified - in production use proper auth)
    const userId = data.userId || 'demo-user'
    
    // Check if user exists, if not use the first admin user
    let user = await db.user.findFirst({ where: { role: 'SUPER_ADMIN' } })
    if (!user) {
      user = await db.user.findFirst()
    }

    if (!user) {
      return NextResponse.json({ error: 'No user found' }, { status: 400 })
    }

    const regulation = await db.regulation.create({
      data: {
        jenis: data.jenis || 'PERATURAN_BADAN',
        tahun: data.tahun || new Date().getFullYear(),
        tentang: data.tentang,
        status: data.status || 'DRAFT_WILAYAH',
        unitKerja: data.unitKerja,
        version: 1,
        header: data.header || {},
        konsiderans: data.konsiderans || { menimbang: [], mengingat: [], memperhatikan: [] },
        diktum: data.diktum || { memutuskan: 'MEMUTUSKAN:', menetapkan: '' },
        batangTubuh: data.batangTubuh || [],
        penutup: data.penutup || { tempat: '', tanggal: '', namaPejabat: '', jabatan: '' },
        lampiran: data.lampiran,
        createdById: user.id
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    // Create search index
    const searchContent = `${regulation.tentang} ${JSON.stringify(regulation.batangTubuh)} ${JSON.stringify(regulation.konsiderans)}`.toLowerCase()
    await db.searchIndex.create({
      data: {
        regulationId: regulation.id,
        content: searchContent
      }
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_REGULATION',
        entityType: 'Regulation',
        entityId: regulation.id,
        details: { message: `Created regulation: ${regulation.tentang}` },
        regulationId: regulation.id
      }
    })

    return NextResponse.json(regulation)
  } catch (error) {
    console.error('Error creating regulation:', error)
    return NextResponse.json({ error: 'Failed to create regulation' }, { status: 500 })
  }
}
