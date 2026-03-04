// Editor Utilities for SISNAS PERATURAN BASARNAS
// Flexible numbering formats and nested structure support

// Numbering Format Types
export type NumberingFormat = 
  | 'NUMBER'           // 1, 2, 3
  | 'NUMBER_PAREN'     // (1), (2), (3)
  | 'LETTER'           // a, b, c
  | 'LETTER_PAREN'     // (a), (b), (c)
  | 'ROMAN'            // i, ii, iii
  | 'ROMAN_PAREN'      // (i), (ii), (iii)

// Point Type
export type PointType = 'AYAT' | 'SUBPOINT'

// Tree Node Structure
export interface TreeNode {
  id: string
  type: PointType
  format: NumberingFormat
  content: string
  children: TreeNode[]
}

// BAB Structure
export interface BABNode {
  id: string
  type: 'BAB'
  number: string  // Roman numeral
  title: string
  children: PasalNode[]
}

// Pasal Structure
export interface PasalNode {
  id: string
  type: 'PASAL'
  number: number
  defaultFormat: NumberingFormat
  children: TreeNode[]
}

// Full Batang Tubuh
export type BatangTubuh = BABNode[]

// Format Options for Dropdown
export const NUMBERING_FORMATS: { value: NumberingFormat; label: string; example: string }[] = [
  { value: 'NUMBER', label: 'Angka', example: '1, 2, 3' },
  { value: 'NUMBER_PAREN', label: 'Angka (Kurung)', example: '(1), (2), (3)' },
  { value: 'LETTER', label: 'Huruf', example: 'a, b, c' },
  { value: 'LETTER_PAREN', label: 'Huruf (Kurung)', example: '(a), (b), (c)' },
  { value: 'ROMAN', label: 'Romawi', example: 'i, ii, iii' },
  { value: 'ROMAN_PAREN', label: 'Romawi (Kurung)', example: '(i), (ii), (iii)' },
]

// Default formats for each level
export const DEFAULT_FORMATS: NumberingFormat[] = [
  'NUMBER_PAREN',  // Level 0 (Ayat): (1), (2), (3)
  'LETTER',        // Level 1: a, b, c
  'NUMBER',        // Level 2: 1, 2, 3
  'LETTER_PAREN',  // Level 3: (a), (b), (c)
]

// Convert number to letter (1 = a, 2 = b, etc.)
export function numberToLetter(num: number): string {
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  if (num <= 26) return letters[num - 1]
  // For numbers > 26, use aa, ab, ac... pattern
  const first = Math.floor((num - 1) / 26)
  const second = ((num - 1) % 26) + 1
  return letters[first - 1] + letters[second - 1]
}

// Convert number to roman numeral
export function numberToRoman(num: number): string {
  const romanNumerals = [
    { value: 1000, symbol: 'm' },
    { value: 900, symbol: 'cm' },
    { value: 500, symbol: 'd' },
    { value: 400, symbol: 'cd' },
    { value: 100, symbol: 'c' },
    { value: 90, symbol: 'xc' },
    { value: 50, symbol: 'l' },
    { value: 40, symbol: 'xl' },
    { value: 10, symbol: 'x' },
    { value: 9, symbol: 'ix' },
    { value: 5, symbol: 'v' },
    { value: 4, symbol: 'iv' },
    { value: 1, symbol: 'i' },
  ]
  
  let result = ''
  let remaining = num
  
  for (const { value, symbol } of romanNumerals) {
    while (remaining >= value) {
      result += symbol
      remaining -= value
    }
  }
  
  return result
}

// Format number according to selected format
export function formatNumber(num: number, format: NumberingFormat): string {
  switch (format) {
    case 'NUMBER':
      return String(num)
    case 'NUMBER_PAREN':
      return `(${num})`
    case 'LETTER':
      return numberToLetter(num)
    case 'LETTER_PAREN':
      return `(${numberToLetter(num)})`
    case 'ROMAN':
      return numberToRoman(num)
    case 'ROMAN_PAREN':
      return `(${numberToRoman(num)})`
    default:
      return String(num)
  }
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Create new tree node
export function createTreeNode(
  type: PointType = 'AYAT',
  format: NumberingFormat = 'NUMBER_PAREN',
  content: string = ''
): TreeNode {
  return {
    id: generateId(),
    type,
    format,
    content,
    children: []
  }
}

// Create new BAB
export function createBAB(existingBABs: BABNode[]): BABNode {
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 
                         'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX']
  const nextNumber = romanNumerals[existingBABs.length] || String(existingBABs.length + 1)
  
  return {
    id: generateId(),
    type: 'BAB',
    number: nextNumber,
    title: '',
    children: []
  }
}

// Create new Pasal
export function createPasal(existingPasals: PasalNode[]): PasalNode {
  return {
    id: generateId(),
    type: 'PASAL',
    number: existingPasals.length + 1,
    defaultFormat: 'NUMBER_PAREN',
    children: []
  }
}

// Recursively reindex tree nodes
export function reindexNodes(nodes: TreeNode[]): TreeNode[] {
  return nodes.map((node, index) => ({
    ...node,
    children: reindexNodes(node.children)
  }))
}

// Deep clone batang tubuh
export function cloneBatangTubuh(batangTubuh: BatangTubuh): BatangTubuh {
  return JSON.parse(JSON.stringify(batangTubuh))
}

// Find and update node in tree
export function updateNodeInTree(
  nodes: TreeNode[],
  nodeId: string,
  updater: (node: TreeNode) => TreeNode
): TreeNode[] {
  return nodes.map(node => {
    if (node.id === nodeId) {
      return updater(node)
    }
    if (node.children.length > 0) {
      return {
        ...node,
        children: updateNodeInTree(node.children, nodeId, updater)
      }
    }
    return node
  })
}

// Find and delete node in tree
export function deleteNodeFromTree(
  nodes: TreeNode[],
  nodeId: string
): TreeNode[] {
  return nodes
    .filter(node => node.id !== nodeId)
    .map(node => ({
      ...node,
      children: deleteNodeFromTree(node.children, nodeId)
    }))
}

// Add child to node
export function addChildToNode(
  nodes: TreeNode[],
  parentId: string,
  child: TreeNode
): TreeNode[] {
  return nodes.map(node => {
    if (node.id === parentId) {
      return {
        ...node,
        children: [...node.children, child]
      }
    }
    if (node.children.length > 0) {
      return {
        ...node,
        children: addChildToNode(node.children, parentId, child)
      }
    }
    return node
  })
}

// Count total points in tree
export function countPoints(nodes: TreeNode[]): number {
  return nodes.reduce((acc, node) => {
    return acc + 1 + countPoints(node.children)
  }, 0)
}

// Get depth of tree
export function getTreeDepth(nodes: TreeNode[]): number {
  if (nodes.length === 0) return 0
  return Math.max(...nodes.map(node => 
    node.children.length > 0 ? 1 + getTreeDepth(node.children) : 1
  ))
}

// Render tree to plain text (for search indexing)
export function renderTreeToText(nodes: TreeNode[], levelFormats: NumberingFormat[] = DEFAULT_FORMATS): string {
  let text = ''
  
  function renderNode(node: TreeNode, index: number, level: number) {
    const format = levelFormats[level] || levelFormats[levelFormats.length - 1]
    const label = formatNumber(index + 1, format)
    text += `${label} ${node.content} `
    
    node.children.forEach((child, i) => {
      renderNode(child, i, level + 1)
    })
  }
  
  nodes.forEach((node, i) => renderNode(node, i, 0))
  
  return text.trim()
}

// Convert legacy batang tubuh format to new format
export function migrateLegacyFormat(legacy: any[]): BatangTubuh {
  return legacy.map(bab => {
    if (bab.type === 'BAB') {
      return {
        ...bab,
        children: (bab.children || []).map((pasal: any) => {
          if (pasal.type === 'PASAL') {
            return {
              ...pasal,
              defaultFormat: 'NUMBER_PAREN' as NumberingFormat,
              children: migrateLegacyAyat(pasal.children || [])
            }
          }
          return pasal
        })
      }
    }
    return bab
  })
}

// Migrate legacy ayat format
function migrateLegacyAyat(legacyAyat: any[]): TreeNode[] {
  return legacyAyat.map(ayat => ({
    id: ayat.id || generateId(),
    type: 'AYAT' as PointType,
    format: 'NUMBER_PAREN' as NumberingFormat,
    content: ayat.text || '',
    children: []
  }))
}

// ============================================
// LAMPIRAN (APPENDIX) STRUCTURE
// ============================================

// Lampiran Content Block Types
export type LampiranBlockType = 
  | 'PARAGRAPH'
  | 'HEADING'
  | 'TABLE'
  | 'LIST'
  | 'SIGNATURE'

// Lampiran Content Block
export interface LampiranBlock {
  id: string
  type: LampiranBlockType
  content: string | LampiranTableCell[][] | LampiranListItem[]
  style?: {
    align?: 'left' | 'center' | 'right' | 'justify'
    bold?: boolean
    italic?: boolean
    underline?: boolean
  }
}

// Table Cell
export interface LampiranTableCell {
  content: string
  colspan?: number
  rowspan?: number
  isHeader?: boolean
}

// List Item
export interface LampiranListItem {
  id: string
  content: string
  number?: string | number  // For numbered lists
  children?: LampiranListItem[]
}

// Lampiran Node Structure
export interface LampiranNode {
  id: string
  nomor: string        // Roman numeral: I, II, III, etc.
  judul: string        // Optional title for this lampiran
  content: LampiranBlock[]
  urutan: number
}

// Full Lampiran array type
export type LampiranList = LampiranNode[]

// Roman numerals for Lampiran (uppercase)
const ROMAN_NUMERALS = [
  'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX',
  'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV'
]

// Convert number to uppercase Roman numeral
export function numberToRomanUpper(num: number): string {
  return ROMAN_NUMERALS[num - 1] || numberToRoman(num).toUpperCase()
}

// Create new Lampiran
export function createLampiran(existingLampiran: LampiranList): LampiranNode {
  const nomor = numberToRomanUpper(existingLampiran.length + 1)
  
  return {
    id: generateId(),
    nomor,
    judul: '',
    content: [
      {
        id: generateId(),
        type: 'PARAGRAPH',
        content: '',
        style: { align: 'justify' }
      }
    ],
    urutan: existingLampiran.length + 1
  }
}

// Reindex Lampiran after deletion
export function reindexLampiran(lampiran: LampiranList): LampiranList {
  return lampiran.map((lamp, index) => ({
    ...lamp,
    nomor: numberToRomanUpper(index + 1),
    urutan: index + 1
  }))
}

// Create paragraph block
export function createParagraphBlock(content: string = ''): LampiranBlock {
  return {
    id: generateId(),
    type: 'PARAGRAPH',
    content,
    style: { align: 'justify' }
  }
}

// Create heading block
export function createHeadingBlock(content: string = ''): LampiranBlock {
  return {
    id: generateId(),
    type: 'HEADING',
    content,
    style: { align: 'center', bold: true }
  }
}

// Create table block
export function createTableBlock(rows: number = 3, cols: number = 3): LampiranBlock {
  const cells: LampiranTableCell[][] = []
  for (let r = 0; r < rows; r++) {
    const row: LampiranTableCell[] = []
    for (let c = 0; c < cols; c++) {
      row.push({
        content: '',
        isHeader: r === 0
      })
    }
    cells.push(row)
  }
  
  return {
    id: generateId(),
    type: 'TABLE',
    content: cells
  }
}

// Create list block
export function createListBlock(): LampiranBlock {
  return {
    id: generateId(),
    type: 'LIST',
    content: [
      { id: generateId(), content: '' }
    ]
  }
}

// Create signature block
export function createSignatureBlock(): LampiranBlock {
  return {
    id: generateId(),
    type: 'SIGNATURE',
    content: '',
    style: { align: 'right' }
  }
}

// Update block in lampiran
export function updateBlockInLampiran(
  lampiran: LampiranNode,
  blockId: string,
  updater: (block: LampiranBlock) => LampiranBlock
): LampiranNode {
  return {
    ...lampiran,
    content: lampiran.content.map(block => 
      block.id === blockId ? updater(block) : block
    )
  }
}

// Delete block from lampiran
export function deleteBlockFromLampiran(
  lampiran: LampiranNode,
  blockId: string
): LampiranNode {
  return {
    ...lampiran,
    content: lampiran.content.filter(block => block.id !== blockId)
  }
}

// Add block to lampiran
export function addBlockToLampiran(
  lampiran: LampiranNode,
  block: LampiranBlock,
  afterBlockId?: string
): LampiranNode {
  if (!afterBlockId) {
    return {
      ...lampiran,
      content: [...lampiran.content, block]
    }
  }
  
  const index = lampiran.content.findIndex(b => b.id === afterBlockId)
  if (index === -1) {
    return {
      ...lampiran,
      content: [...lampiran.content, block]
    }
  }
  
  const newContent = [...lampiran.content]
  newContent.splice(index + 1, 0, block)
  
  return {
    ...lampiran,
    content: newContent
  }
}

// Render lampiran content to plain text (for search indexing)
export function renderLampiranToText(lampiran: LampiranList): string {
  let text = ''
  
  function renderBlock(block: LampiranBlock): string {
    if (block.type === 'PARAGRAPH' || block.type === 'HEADING') {
      return String(block.content) + ' '
    }
    if (block.type === 'TABLE' && Array.isArray(block.content)) {
      const cells = block.content as LampiranTableCell[][]
      return cells.flat().map(cell => cell.content).join(' ') + ' '
    }
    if (block.type === 'LIST' && Array.isArray(block.content)) {
      const items = block.content as LampiranListItem[]
      return items.map(item => item.content).join(' ') + ' '
    }
    if (block.type === 'SIGNATURE') {
      return String(block.content) + ' '
    }
    return ''
  }
  
  for (const lamp of lampiran) {
    text += `LAMPIRAN ${lamp.nomor} ${lamp.judul} `
    for (const block of lamp.content) {
      text += renderBlock(block)
    }
  }
  
  return text.trim()
}

// Generate Lampiran header text
export function generateLampiranHeader(
  nomorLampiran: string,
  jenisRegulasi: string,
  nomorRegulasi: string | null,
  tahunRegulasi: number,
  judulRegulasi: string
): string[] {
  const lines = [
    `LAMPIRAN ${nomorLampiran}`,
    jenisRegulasi.toUpperCase().replace(/_/g, ' '),
    nomorRegulasi ? `NOMOR ${nomorRegulasi} TAHUN ${tahunRegulasi}` : `TAHUN ${tahunRegulasi}`,
    'TENTANG',
    judulRegulasi.toUpperCase()
  ]
  return lines
}
