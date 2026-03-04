import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/search - Full-text search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const jenis = searchParams.get('jenis')
    const status = searchParams.get('status')
    const tahun = searchParams.get('tahun')

    if (!query.trim()) {
      return NextResponse.json({ results: [] })
    }

    // Search in search index
    const searchResults = await db.searchIndex.findMany({
      where: {
        content: { contains: query.toLowerCase() }
      },
      include: {
        regulation: {
          select: {
            id: true,
            jenis: true,
            nomor: true,
            tahun: true,
            tentang: true,
            status: true,
            unitKerja: true,
            batangTubuh: true,
            createdBy: { select: { id: true, name: true, role: true } }
          }
        }
      }
    })

    // Filter results
    let results = searchResults.map(si => {
      const reg = si.regulation
      
      // Find matching sections for highlight
      let highlight = ''
      let matchedSection = ''
      
      // Search in batang tubuh with support for new nested format
      if (reg.batangTubuh && Array.isArray(reg.batangTubuh)) {
        const findMatch = (items: any[], path: string = ''): boolean => {
          for (const item of items) {
            // Handle both legacy 'text' field and new 'content' field
            const itemText = item.text || item.content || item.title || ''
            if (itemText.toLowerCase().includes(query.toLowerCase())) {
              matchedSection = path + (item.type === 'BAB' ? `BAB ${item.number}${item.title ? `: ${item.title}` : ''}` : 
                              item.type === 'PASAL' ? `Pasal ${item.number}` :
                              item.type === 'AYAT' ? `Ayat ${item.number || ''}` :
                              item.type === 'SUBPOINT' ? `Sub-poin` :
                              item.type === 'HURUF' ? `Huruf ${item.letter}` : 'Poin')
              
              // Create highlighted snippet
              const idx = itemText.toLowerCase().indexOf(query.toLowerCase())
              if (idx !== -1) {
                const start = Math.max(0, idx - 50)
                const end = Math.min(itemText.length, idx + query.length + 50)
                highlight = (start > 0 ? '...' : '') + 
                           itemText.substring(start, idx) +
                           '<mark class="bg-yellow-200 font-semibold">' + 
                           itemText.substring(idx, idx + query.length) + 
                           '</mark>' +
                           itemText.substring(idx + query.length, end) +
                           (end < itemText.length ? '...' : '')
              }
              return true
            }
            if (item.children && findMatch(item.children, path + (item.type === 'BAB' ? `BAB ${item.number} > ` : item.type === 'PASAL' ? `Pasal ${item.number} > ` : ''))) {
              return true
            }
          }
          return false
        }
        findMatch(reg.batangTubuh)
      }
      
      // Also search in lampiran content
      if (!highlight && reg.lampiran && Array.isArray(reg.lampiran)) {
        for (const lamp of reg.lampiran) {
          // Search in lampiran header info
          const headerText = `LAMPIRAN ${lamp.nomor} ${lamp.judul || ''}`
          if (headerText.toLowerCase().includes(query.toLowerCase())) {
            matchedSection = `Lampiran ${lamp.nomor}`
            highlight = headerText
            break
          }
          
          // Search in lampiran content blocks
          if (lamp.content && Array.isArray(lamp.content)) {
            for (const block of lamp.content) {
              let blockText = ''
              if (typeof block.content === 'string') {
                blockText = block.content
              } else if (Array.isArray(block.content)) {
                if (block.type === 'TABLE') {
                  blockText = (block.content as any[][]).flat().map((c: any) => c.content || '').join(' ')
                } else if (block.type === 'LIST') {
                  blockText = (block.content as any[]).map((item: any) => item.content || '').join(' ')
                }
              }
              
              if (blockText.toLowerCase().includes(query.toLowerCase())) {
                matchedSection = `Lampiran ${lamp.nomor}`
                const idx = blockText.toLowerCase().indexOf(query.toLowerCase())
                if (idx !== -1) {
                  const start = Math.max(0, idx - 50)
                  const end = Math.min(blockText.length, idx + query.length + 50)
                  highlight = (start > 0 ? '...' : '') + 
                             blockText.substring(start, idx) +
                             '<mark class="bg-yellow-200 font-semibold">' + 
                             blockText.substring(idx, idx + query.length) + 
                             '</mark>' +
                             blockText.substring(idx + query.length, end) +
                             (end < blockText.length ? '...' : '')
                }
                break
              }
            }
            if (highlight) break
          }
        }
      }

      return {
        id: reg.id,
        jenis: reg.jenis,
        nomor: reg.nomor,
        tahun: reg.tahun,
        tentang: reg.tentang,
        status: reg.status,
        unitKerja: reg.unitKerja,
        createdBy: reg.createdBy,
        highlight,
        matchedSection
      }
    })

    // Apply filters
    if (jenis && jenis !== 'all') {
      results = results.filter(r => r.jenis === jenis)
    }
    if (status && status !== 'all') {
      results = results.filter(r => r.status === status)
    }
    if (tahun) {
      results = results.filter(r => r.tahun === parseInt(tahun))
    }

    // Sort by relevance (prioritize results with highlights)
    results.sort((a, b) => {
      if (a.highlight && !b.highlight) return -1
      if (!a.highlight && b.highlight) return 1
      return 0
    })

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 })
  }
}
