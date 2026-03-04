'use client'

import Image from 'next/image'
import { useAuth, ROLE_LABELS, STATUS_LABELS, STATUS_COLORS, JENIS_LABELS } from '@/lib/auth-context'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  FileText, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Check, 
  X, 
  Clock, 
  Users, 
  ChevronRight,
  LayoutDashboard,
  BookOpen,
  Settings,
  LogOut,
  History,
  GitBranch,
  Shield,
  CheckCircle,
  XCircle,
  ArrowRight,
  PlusCircle,
  MinusCircle,
  Save,
  Send,
  Eye as ViewIcon,
  ChevronUp,
  ChevronDown,
  IndentIncrease,
  IndentDecrease,
  GripVertical,
  Hash,
  Type,
  ListOrdered
} from 'lucide-react'
import { toast } from 'sonner'
import {
  NumberingFormat,
  TreeNode,
  BABNode,
  PasalNode,
  BatangTubuh,
  NUMBERING_FORMATS,
  DEFAULT_FORMATS,
  formatNumber,
  generateId,
  createTreeNode,
  createBAB,
  createPasal,
  updateNodeInTree,
  deleteNodeFromTree,
  addChildToNode,
  countPoints,
  getTreeDepth,
  migrateLegacyFormat
} from '@/lib/editor-utils'
import {
  LampiranNode,
  LampiranList,
  LampiranBlock,
  LampiranBlockType,
  LampiranTableCell,
  LampiranListItem,
  createLampiran,
  reindexLampiran,
  createParagraphBlock,
  createHeadingBlock,
  createTableBlock,
  createListBlock,
  createSignatureBlock,
  updateBlockInLampiran,
  deleteBlockFromLampiran,
  addBlockToLampiran,
  generateLampiranHeader,
  renderLampiranToText,
  numberToRomanUpper
} from '@/lib/editor-utils'

// Types
interface Regulation {
  id: string
  jenis: string
  nomor: string | null
  tahun: number
  tentang: string
  status: string
  unitKerja: string | null
  version: number
  header: any
  konsiderans: any
  diktum: any
  batangTubuh: any[]
  penutup: any
  lampiran: any
  createdAt: string
  updatedAt: string
  finalizedAt: string | null
  createdBy: {
    id: string
    name: string
    email: string
    role: string
  }
  versions?: any[]
  comments?: any[]
  relations?: any[]
}

// API Functions
const api = {
  async getRegulations(params?: { status?: string; search?: string; jenis?: string }) {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    if (params?.search) query.set('search', params.search)
    if (params?.jenis) query.set('jenis', params.jenis)
    const res = await fetch(`/api/regulations?${query}`)
    return res.json()
  },

  async getRegulation(id: string) {
    const res = await fetch(`/api/regulations/${id}`)
    return res.json()
  },

  async createRegulation(data: any) {
    const res = await fetch('/api/regulations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  },

  async updateRegulation(id: string, data: any) {
    const res = await fetch(`/api/regulations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  },

  async deleteRegulation(id: string) {
    const res = await fetch(`/api/regulations/${id}`, { method: 'DELETE' })
    return res.json()
  },

  async updateStatus(id: string, status: string, notes?: string) {
    const res = await fetch(`/api/regulations/${id}/workflow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes })
    })
    return res.json()
  },

  async getDashboardStats() {
    const res = await fetch('/api/dashboard/stats')
    return res.json()
  },

  async searchRegulations(query: string) {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    return res.json()
  },

  async getUsers() {
    const res = await fetch('/api/users')
    return res.json()
  },

  async getAuditLogs() {
    const res = await fetch('/api/audit-logs')
    return res.json()
  },

  async addComment(regulationId: string, content: string, section?: string) {
    const res = await fetch(`/api/regulations/${regulationId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, section })
    })
    return res.json()
  },

  async getVersions(regulationId: string) {
    const res = await fetch(`/api/regulations/${regulationId}/versions`)
    return res.json()
  }
}

// Login Page
function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    const result = await login(email, password)
    if (!result.success) {
      setError(result.error || 'Login gagal')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A3A5C] via-[#0066CC] to-[#1A3A5C] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {/* Logo Garuda - Lambang Negara RI */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-lg mb-4 overflow-hidden">
            <Image
              src="https://pub-577a5bbe060a49b7af03e7d6731c196b.r2.dev/garuda.png"
              alt="Lambang Negara Republik Indonesia"
              width={70}
              height={70}
              className="w-[50px] sm:w-[60px] h-auto"
              priority
              unoptimized
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">SISNAS PERATURAN</h1>
          <p className="text-blue-100 text-sm sm:text-base">Badan Nasional Pencarian dan Pertolongan</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center">Masuk ke Sistem</CardTitle>
            <CardDescription className="text-center">Masukkan email dan password Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@basarnas.go.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <Button type="submit" className="w-full h-11 bg-[#0066CC] hover:bg-[#0052A3]" disabled={isLoading}>
                {isLoading ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>
            <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
              <p>Demo: <span className="font-medium">admin@basarnas.go.id</span></p>
              <p>Password: <span className="font-medium">password123</span></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Sidebar
function Sidebar({ currentPage, setCurrentPage }: { currentPage: string; setCurrentPage: (page: string) => void }) {
  const { user, logout } = useAuth()

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'PENYUSUN_PUSAT', 'PENYUSUN_WILAYAH', 'REVIEWER_HUKUM', 'PIMPINAN', 'VIEWER'] },
    { id: 'regulations', label: 'Database Regulasi', icon: BookOpen, roles: ['SUPER_ADMIN', 'PENYUSUN_PUSAT', 'PENYUSUN_WILAYAH', 'REVIEWER_HUKUM', 'PIMPINAN', 'VIEWER'] },
    { id: 'search', label: 'Pencarian', icon: Search, roles: ['SUPER_ADMIN', 'PENYUSUN_PUSAT', 'PENYUSUN_WILAYAH', 'REVIEWER_HUKUM', 'PIMPINAN', 'VIEWER'] },
    { id: 'approvals', label: 'Persetujuan', icon: CheckCircle, roles: ['SUPER_ADMIN', 'PIMPINAN'] },
    { id: 'admin', label: 'Administrasi', icon: Settings, roles: ['SUPER_ADMIN'] },
  ]

  const filteredMenu = menuItems.filter(item => user && item.roles.includes(user.role))

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#1A3A5C] text-white flex flex-col z-50">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden">
            <Image
              src="https://pub-577a5bbe060a49b7af03e7d6731c196b.r2.dev/garuda.png"
              alt="Lambang Negara Republik Indonesia"
              width={40}
              height={40}
              className="w-8 h-8 object-contain"
              unoptimized
            />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">SISNAS</h1>
            <p className="text-xs text-blue-200">PERATURAN BASARNAS</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {filteredMenu.map(item => (
            <li key={item.id}>
              <button
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  currentPage === item.id ? 'bg-[#0066CC] text-white' : 'text-blue-100 hover:bg-white/10'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors">
              <Avatar className="w-10 h-10 bg-[#0066CC]">
                <AvatarFallback className="bg-[#0066CC] text-white">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="font-medium text-sm truncate">{user?.name}</p>
                <p className="text-xs text-blue-200">{user?.role ? ROLE_LABELS[user.role] : ''}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-200" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-sm text-muted-foreground">{user?.email}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}

// Dashboard Page
function DashboardPage({ setCurrentPage, setSelectedRegulation }: { 
  setCurrentPage: (page: string) => void
  setSelectedRegulation: (reg: Regulation | null) => void 
}) {
  const { user, hasRole } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [recentRegulations, setRecentRegulations] = useState<Regulation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, regsData] = await Promise.all([
          api.getDashboardStats(),
          api.getRegulations()
        ])
        setStats(statsData.stats || statsData)
        setRecentRegulations(regsData.regulations?.slice(0, 5) || regsData.slice?.(0, 5) || [])
      } catch (error) {
        console.error('Failed to load:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const quickActions = [
    { id: 'new', label: 'Buat Draft Baru', icon: Plus, color: 'bg-[#0066CC]', roles: ['SUPER_ADMIN', 'PENYUSUN_PUSAT', 'PENYUSUN_WILAYAH'], action: () => setCurrentPage('editor') },
    { id: 'search', label: 'Cari Regulasi', icon: Search, color: 'bg-[#FF6B00]', roles: ['SUPER_ADMIN', 'PENYUSUN_PUSAT', 'PENYUSUN_WILAYAH', 'REVIEWER_HUKUM', 'PIMPINAN', 'VIEWER'], action: () => setCurrentPage('search') },
    { id: 'approvals', label: 'Persetujuan', icon: Clock, color: 'bg-purple-600', roles: ['SUPER_ADMIN', 'PIMPINAN'], action: () => setCurrentPage('approvals') },
    { id: 'admin', label: 'Kelola User', icon: Users, color: 'bg-[#00A651]', roles: ['SUPER_ADMIN'], action: () => setCurrentPage('admin') },
  ]

  const filteredActions = quickActions.filter(action => user && action.roles.includes(user.role))

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-4 w-20 bg-muted rounded mb-2" /><div className="h-8 w-16 bg-muted rounded" /></CardContent></Card>)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3A5C]">Selamat Datang, {user?.name}!</h1>
          <p className="text-muted-foreground">{user?.jabatan} • {user?.unitKerja}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-[#0066CC]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Regulasi</p>
                <p className="text-3xl font-bold text-[#1A3A5C]">{stats?.totalRegulations || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-[#0066CC]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#FF6B00]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Draft Aktif</p>
                <p className="text-3xl font-bold text-[#1A3A5C]">{stats?.draftCount || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Edit className="w-6 h-6 text-[#FF6B00]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-3xl font-bold text-[#1A3A5C]">{stats?.pendingApproval || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#00A651]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Final Tahun Ini</p>
                <p className="text-3xl font-bold text-[#1A3A5C]">{stats?.finalThisYear || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[#00A651]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredActions.map(action => (
              <button key={action.id} onClick={action.action} className="flex flex-col items-center gap-3 p-4 rounded-lg border hover:border-primary/50 hover:bg-muted/50 transition-colors">
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Regulasi Terbaru</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setCurrentPage('regulations')}>
            Lihat Semua <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentRegulations.map((reg) => (
              <div key={reg.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => { setSelectedRegulation(reg); setCurrentPage('view') }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#0066CC]" />
                  </div>
                  <div>
                    <p className="font-medium">{reg.tentang}</p>
                    <p className="text-sm text-muted-foreground">{JENIS_LABELS[reg.jenis]} {reg.nomor ? `No ${reg.nomor}` : ''} Tahun {reg.tahun}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={STATUS_COLORS[reg.status]}>{STATUS_LABELS[reg.status]}</Badge>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Regulations List
function RegulationsPage({ setCurrentPage, setSelectedRegulation }: { 
  setCurrentPage: (page: string) => void
  setSelectedRegulation: (reg: Regulation | null) => void 
}) {
  const { user, hasRole, canEdit } = useAuth()
  const [regulations, setRegulations] = useState<Regulation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [jenisFilter, setJenisFilter] = useState<string>('all')

  useEffect(() => {
    const loadRegulations = async () => {
      try {
        const data = await api.getRegulations({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          jenis: jenisFilter !== 'all' ? jenisFilter : undefined,
          search: search || undefined
        })
        setRegulations(data.regulations || data)
      } catch (error) {
        console.error('Failed to load:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadRegulations()
  }, [search, statusFilter, jenisFilter])

  const handleView = (reg: Regulation) => { setSelectedRegulation(reg); setCurrentPage('view') }
  const handleEdit = (reg: Regulation) => {
    if (reg.status === 'FINAL') { toast.error('Regulasi FINAL tidak dapat diedit'); return }
    setSelectedRegulation(reg); setCurrentPage('editor')
  }
  const handleDelete = async (reg: Regulation) => {
    if (!confirm('Yakin ingin menghapus regulasi ini?')) return
    try {
      await api.deleteRegulation(reg.id)
      toast.success('Regulasi berhasil dihapus')
      setRegulations(regs => regs.filter(r => r.id !== reg.id))
    } catch (error) {
      toast.error('Gagal menghapus regulasi')
    }
  }

  const filteredRegulations = useMemo(() => {
    return regulations.filter(reg => {
      const matchSearch = search === '' || reg.tentang.toLowerCase().includes(search.toLowerCase()) || (reg.nomor && reg.nomor.includes(search))
      const matchStatus = statusFilter === 'all' || reg.status === statusFilter
      const matchJenis = jenisFilter === 'all' || reg.jenis === jenisFilter
      return matchSearch && matchStatus && matchJenis
    })
  }, [regulations, search, statusFilter, jenisFilter])

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3A5C]">Database Regulasi</h1>
          <p className="text-muted-foreground">Kelola seluruh regulasi Basarnas</p>
        </div>
        {hasRole(['SUPER_ADMIN', 'PENYUSUN_PUSAT', 'PENYUSUN_WILAYAH']) && (
          <Button onClick={() => { setSelectedRegulation(null); setCurrentPage('editor') }} className="bg-[#0066CC] hover:bg-[#0052A3]">
            <Plus className="w-4 h-4 mr-2" /> Buat Regulasi Baru
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cari regulasi..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {Object.entries(STATUS_LABELS).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={jenisFilter} onValueChange={setJenisFilter}>
              <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Jenis" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                {Object.entries(JENIS_LABELS).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul / Tentang</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Unit Kerja</TableHead>
                <TableHead>Dibuat Oleh</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Memuat data...</TableCell></TableRow>
              ) : filteredRegulations.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Tidak ada regulasi ditemukan</TableCell></TableRow>
              ) : (
                filteredRegulations.map((reg) => (
                  <TableRow key={reg.id} className="hover:bg-muted/50">
                    <TableCell>
                      <p className="font-medium line-clamp-1">{reg.tentang}</p>
                      <p className="text-sm text-muted-foreground">{reg.nomor ? `No ${reg.nomor}/` : ''}{reg.tahun}</p>
                    </TableCell>
                    <TableCell><Badge variant="outline">{JENIS_LABELS[reg.jenis]}</Badge></TableCell>
                    <TableCell><Badge className={STATUS_COLORS[reg.status]}>{STATUS_LABELS[reg.status]}</Badge></TableCell>
                    <TableCell>{reg.unitKerja || '-'}</TableCell>
                    <TableCell>{reg.createdBy?.name || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleView(reg)}><Eye className="w-4 h-4" /></Button>
                        {canEdit(reg.unitKerja) && reg.status !== 'FINAL' && (
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(reg)}><Edit className="w-4 h-4" /></Button>
                        )}
                        {hasRole('SUPER_ADMIN') && reg.status !== 'FINAL' && (
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(reg)}><Trash2 className="w-4 h-4" /></Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// Search Page
function SearchPage({ setCurrentPage, setSelectedRegulation }: { 
  setCurrentPage: (page: string) => void
  setSelectedRegulation: (reg: Regulation | null) => void 
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setIsSearching(true)
    setHasSearched(true)
    try {
      const data = await api.searchRegulations(query)
      setResults(data.results || data)
    } catch (error) {
      toast.error('Pencarian gagal')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A3A5C]">Pencarian Full-Text</h1>
        <p className="text-muted-foreground">Cari regulasi berdasarkan kata kunci</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Masukkan kata kunci pencarian..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="pl-10 h-12" />
            </div>
            <Button onClick={handleSearch} disabled={isSearching} className="h-12 px-8 bg-[#0066CC] hover:bg-[#0052A3]">
              {isSearching ? 'Mencari...' : 'Cari'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasSearched && (
        <div className="space-y-4">
          <p className="text-muted-foreground">{isSearching ? 'Mencari...' : `${results.length} hasil ditemukan`}</p>
          {results.map((result, index) => (
            <Card key={index} className="hover:border-primary/50 cursor-pointer transition-colors" onClick={() => { setSelectedRegulation(result); setCurrentPage('view') }}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{JENIS_LABELS[result.jenis]}</Badge>
                      <span className="text-sm text-muted-foreground">{result.nomor ? `No ${result.nomor}/` : ''}{result.tahun}</span>
                    </div>
                    <h3 className="font-semibold text-lg">{result.tentang}</h3>
                  </div>
                  <Badge className={STATUS_COLORS[result.status]}>{STATUS_LABELS[result.status]}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Approvals Page
function ApprovalsPage({ setCurrentPage, setSelectedRegulation }: { 
  setCurrentPage: (page: string) => void
  setSelectedRegulation: (reg: Regulation | null) => void 
}) {
  const [pendingRegulations, setPendingRegulations] = useState<Regulation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPending = async () => {
      try {
        const data = await api.getRegulations({ status: 'MENUNGGU_PERSETUJUAN' })
        setPendingRegulations(data.regulations || data)
      } catch (error) {
        console.error('Failed to load:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadPending()
  }, [])

  const handleApprove = async (reg: Regulation) => {
    try {
      await api.updateStatus(reg.id, 'FINAL', 'Disetujui')
      toast.success('Regulasi telah disetujui')
      setPendingRegulations(regs => regs.filter(r => r.id !== reg.id))
    } catch (error) {
      toast.error('Gagal menyetujui regulasi')
    }
  }

  const handleReject = async (reg: Regulation) => {
    try {
      await api.updateStatus(reg.id, 'REVISI', 'Ditolak, perlu revisi')
      toast.success('Regulasi dikembalikan untuk revisi')
      setPendingRegulations(regs => regs.filter(r => r.id !== reg.id))
    } catch (error) {
      toast.error('Gagal menolak regulasi')
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A3A5C]">Persetujuan Regulasi</h1>
        <p className="text-muted-foreground">Daftar regulasi yang menunggu persetujuan</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2].map(i => <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-4 w-3/4 bg-muted rounded mb-2" /><div className="h-3 w-1/2 bg-muted rounded" /></CardContent></Card>)}</div>
      ) : pendingRegulations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-[#00A651]" />
            <p className="text-lg font-medium">Tidak ada regulasi yang menunggu persetujuan</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingRegulations.map((reg) => (
            <Card key={reg.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{JENIS_LABELS[reg.jenis]}</Badge>
                      <span className="text-sm text-muted-foreground">Versi {reg.version} • {new Date(reg.updatedAt).toLocaleDateString('id-ID')}</span>
                    </div>
                    <h3 className="font-semibold text-lg">{reg.tentang}</h3>
                    <p className="text-sm text-muted-foreground">Diajukan oleh: {reg.createdBy?.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setSelectedRegulation(reg); setCurrentPage('view') }}><Eye className="w-4 h-4 mr-1" /> Lihat</Button>
                    <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleReject(reg)}><XCircle className="w-4 h-4 mr-1" /> Tolak</Button>
                    <Button size="sm" className="bg-[#00A651] hover:bg-[#008C44]" onClick={() => handleApprove(reg)}><CheckCircle className="w-4 h-4 mr-1" /> Setujui</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Admin Page
function AdminPage() {
  const [users, setUsers] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, logsData] = await Promise.all([api.getUsers(), api.getAuditLogs()])
        setUsers(usersData.users || usersData)
        setAuditLogs(logsData.logs || logsData)
      } catch (error) {
        console.error('Failed to load:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A3A5C]">Administrasi Sistem</h1>
        <p className="text-muted-foreground">Kelola pengguna dan lihat log aktivitas</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users">Pengguna</TabsTrigger>
          <TabsTrigger value="audit">Log Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Unit Kerja</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8">Memuat...</TableCell></TableRow>
                  ) : users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8"><AvatarFallback>{u.name?.charAt(0)}</AvatarFallback></Avatar>
                          <div>
                            <p className="font-medium">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.jabatan}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell><Badge variant="outline">{ROLE_LABELS[u.role]}</Badge></TableCell>
                      <TableCell>{u.unitKerja || '-'}</TableCell>
                      <TableCell><Badge className={u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{u.isActive ? 'Aktif' : 'Nonaktif'}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Aksi</TableHead>
                    <TableHead>Entitas</TableHead>
                    <TableHead>Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8">Memuat...</TableCell></TableRow>
                  ) : auditLogs.slice(0, 20).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">{new Date(log.createdAt).toLocaleString('id-ID')}</TableCell>
                      <TableCell>{log.user?.name || '-'}</TableCell>
                      <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                      <TableCell>{log.entityType}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{log.details?.message || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Roman numeral converter
const toRomanNumeral = (num: number): string => {
  const romanNumerals = [
    { value: 10, numeral: 'X' },
    { value: 9, numeral: 'IX' },
    { value: 5, numeral: 'V' },
    { value: 4, numeral: 'IV' },
    { value: 1, numeral: 'I' }
  ]
  let result = ''
  let remaining = num
  for (const { value, numeral } of romanNumerals) {
    while (remaining >= value) {
      result += numeral
      remaining -= value
    }
  }
  return result
}

// Indonesian ordinal numbers for Bagian
const toIndonesianOrdinal = (num: number): string => {
  const ordinals = [
    '', 'Kesatu', 'Kedua', 'Ketiga', 'Keempat', 'Kelima', 'Keenam', 'Ketujuh', 'Kedelapan', 'Kesembilan', 'Kesepuluh',
    'Kesebelas', 'Keduabelas', 'Ketigabelas', 'Keempatbelas', 'Kelimabelas', 'Keenambelas', 'Ketujuhbelas', 'Kedelapanbelas', 'Kesembilanbelas', 'Keduapuluh'
  ]
  if (num < ordinals.length) return ordinals[num]
  return `Ke-${num}`
}

// View Regulation Page
function ViewRegulationPage({ regulation, onBack }: { regulation: Regulation; onBack: () => void }) {
  const { user, canEdit, canApprove, hasRole } = useAuth()
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const regData = await api.getRegulation(regulation.id)
        setComments(regData.comments || [])
      } catch (error) {
        console.error('Failed to load:', error)
      }
    }
    loadData()
  }, [regulation.id])

  const handleStatusChange = async (newStatus: string, notes?: string) => {
    try {
      await api.updateStatus(regulation.id, newStatus, notes)
      toast.success('Status berhasil diubah')
      onBack()
    } catch (error) {
      toast.error('Gagal mengubah status')
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    try {
      await api.addComment(regulation.id, newComment)
      toast.success('Komentar ditambahkan')
      setNewComment('')
      const regData = await api.getRegulation(regulation.id)
      setComments(regData.comments || [])
    } catch (error) {
      toast.error('Gagal menambahkan komentar')
    }
  }

  // Base document style - Times New Roman 12pt, 1.5 line spacing
  const docStyle = {
    fontFamily: "'Times New Roman', Times, serif",
    fontSize: '12pt',
    lineHeight: 1.5,
  }

  // Render tree nodes with proper formatting - Official Indonesian regulation format
  // Level 0: (1), (2), (3) - Ayat - hanging indent 1.25cm
  // Level 1: a., b., c. - Huruf - hanging indent
  // Level 2: 1), 2), 3) - Angka
  // Level 3: (a), (b), (c) - Sub-angka
  // Unlimited nesting support
  const renderTreeNodes = (nodes: TreeNode[], level: number = 0): React.ReactNode => {
    return nodes.map((node, index) => {
      const label = formatNumber(index + 1, node.format)
      // Hanging indent: first line has negative indent, container has positive margin
      const hangingIndent = 1.25 // cm
      const indentStyle = {
        marginLeft: level === 0 ? '0' : `${level * hangingIndent}cm`,
        paddingLeft: level === 0 ? `${hangingIndent}cm` : '0',
        textIndent: level === 0 ? `-${hangingIndent}cm` : `-${hangingIndent}cm`,
      }
      
      return (
        <div key={node.id} className="avoid-break" style={indentStyle}>
          <p className="text-justify" style={{ ...docStyle, marginBottom: '0.1cm' }}>
            <span>{label}</span>{' '}
            {node.content}
          </p>
          {node.children && node.children.length > 0 && (
            <div>
              {renderTreeNodes(node.children, level + 1)}
            </div>
          )}
        </div>
      )
    })
  }

  // Render BAB with Bagian and Paragraf support
  const renderBatangTubuh = (items: any[], babNumber?: number): React.ReactNode => {
    return items.map((item, index) => {
      // BAB - Roman numerals, center, bold, caps
      if (item.type === 'BAB') {
        const romanNum = toRomanNumeral(item.number || index + 1)
        return (
          <div key={item.id || index} className="avoid-break" style={{ marginBottom: '1cm' }}>
            {/* BAB Header - Center, Bold, Caps */}
            <div className="text-center" style={{ marginBottom: '0.5cm', marginTop: '1cm' }}>
              <p className="font-bold" style={{ ...docStyle, fontSize: '12pt' }}>
                BAB {romanNum}
              </p>
              {item.title && (
                <p className="font-bold uppercase" style={{ ...docStyle, fontSize: '12pt', marginTop: '0.25cm' }}>
                  {item.title}
                </p>
              )}
            </div>
            {/* Children: Bagian, Paragraf, Pasal */}
            {item.children && renderBatangTubuh(item.children, item.number)}
          </div>
        )
      }
      
      // BAGIAN - Indonesian ordinal, center, bold
      if (item.type === 'BAGIAN') {
        const ordinal = toIndonesianOrdinal(item.number || index + 1)
        return (
          <div key={item.id || index} className="text-center avoid-break" style={{ marginBottom: '0.5cm', marginTop: '0.75cm' }}>
            <p className="font-bold" style={docStyle}>
              Bagian {ordinal}
            </p>
            {item.title && (
              <p className="font-bold" style={docStyle}>
                {item.title}
              </p>
            )}
            {item.children && renderBatangTubuh(item.children)}
          </div>
        )
      }
      
      // PARAGRAF - Number, center, bold
      if (item.type === 'PARAGRAF') {
        return (
          <div key={item.id || index} className="text-center avoid-break" style={{ marginBottom: '0.5cm', marginTop: '0.75cm' }}>
            <p className="font-bold" style={docStyle}>
              Paragraf {item.number || index + 1}
            </p>
            {item.title && (
              <p className="font-bold" style={docStyle}>
                {item.title}
              </p>
            )}
            {item.children && renderBatangTubuh(item.children)}
          </div>
        )
      }
      
      // PASAL - Bold, left aligned with spacing
      if (item.type === 'PASAL') {
        return (
          <div key={item.id || index} className="avoid-break" style={{ marginBottom: '0.75cm' }}>
            {/* Pasal Number - Bold */}
            <p className="font-bold" style={{ ...docStyle, marginBottom: '0.25cm' }}>
              Pasal {item.number}
            </p>
            {/* Ayat content with hanging indent */}
            {item.children && Array.isArray(item.children) && item.children.length > 0 ? (
              <div>
                {renderTreeNodes(item.children)}
              </div>
            ) : (
              <div style={{ ...docStyle, color: '#6B7280', fontStyle: 'italic' }}>
                Pasal ini belum memiliki ayat.
              </div>
            )}
          </div>
        )
      }
      
      // Legacy AYAT format support
      if (item.type === 'AYAT') {
        return (
          <div key={item.id || index} style={{ paddingLeft: '1.25cm', textIndent: '-1.25cm', marginBottom: '0.1cm' }}>
            <p className="text-justify" style={docStyle}>
              <span>({item.number})</span> {item.text || item.content}
            </p>
            {item.children && renderBatangTubuh(item.children)}
          </div>
        )
      }
      
      // Legacy SUBPOINT format support
      if (item.type === 'SUBPOINT') {
        const label = formatNumber(index + 1, item.format || 'LETTER')
        return (
          <div key={item.id || index} style={{ paddingLeft: '2.5cm', textIndent: '-1.25cm', marginBottom: '0.1cm' }}>
            <p className="text-justify" style={docStyle}>
              <span>{label}.</span> {item.content}
            </p>
            {item.children && item.children.length > 0 && renderTreeNodes(item.children, 1)}
          </div>
        )
      }
      
      return null
    })
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6 no-print">
        <Button variant="ghost" onClick={onBack}><ChevronRight className="w-4 h-4 mr-1 rotate-180" /> Kembali</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardContent className="p-0">
              {/* Official Document Container - A4 size with official margins */}
              <div 
                className="bg-white mx-auto relative document-print-container"
                style={{
                  ...docStyle,
                  width: '21cm',
                  minHeight: '29.7cm',
                  padding: '4cm 3cm 3cm 4cm', // Top, Right, Bottom, Left
                  boxSizing: 'border-box',
                }}
              >
                {/* ============ STRUKTUR AWAL PERATURAN ============ */}
                
                {/* 1. PERATURAN BADAN NASIONAL... - Center, Bold, Caps */}
                <p className="text-center font-bold uppercase" style={{ ...docStyle, fontSize: '14pt', marginBottom: '0.25cm' }}>
                  PERATURAN BADAN NASIONAL PENCARIAN DAN PERTOLONGAN
                </p>
                
                {/* 2. NOMOR X TAHUN XXXX - Center, Caps */}
                <p className="text-center uppercase" style={{ ...docStyle, marginBottom: '0.25cm' }}>
                  {regulation.nomor ? `NOMOR ${regulation.nomor}` : ''} TAHUN {regulation.tahun}
                </p>
                
                {/* 3. TENTANG - Center, Caps */}
                <p className="text-center uppercase" style={{ ...docStyle, marginBottom: '0.5cm' }}>
                  TENTANG
                </p>
                
                {/* 4. JUDUL PERATURAN - Center, Bold, Caps */}
                <p className="text-center font-bold uppercase" style={{ ...docStyle, marginBottom: '1cm' }}>
                  {regulation.tentang.toUpperCase()}
                </p>

                {/* 5. DENGAN RAHMAT TUHAN YANG MAHA ESA - Center, Caps */}
                <p className="text-center uppercase" style={{ ...docStyle, marginBottom: '1cm' }}>
                  DENGAN RAHMAT TUHAN YANG MAHA ESA
                </p>
                
                {/* KEPALA BADAN - Center, Bold */}
                <p className="text-center font-bold" style={{ ...docStyle, marginBottom: '0.25cm' }}>
                  KEPALA BADAN NASIONAL PENCARIAN DAN PERTOLONGAN
                </p>
                <p className="text-center font-bold" style={{ ...docStyle, marginBottom: '1cm' }}>
                  REPUBLIK INDONESIA,
                </p>

                {/* ============ MENIMBANG - Rata kiri, tabel dengan titik dua ============ */}
                {regulation.konsiderans?.menimbang?.length > 0 && (
                  <div style={{ marginBottom: '0.5cm' }}>
                    <table style={{ ...docStyle, width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '2.5cm', verticalAlign: 'top', fontWeight: 'bold' }}>Menimbang</td>
                          <td style={{ width: '0.5cm', verticalAlign: 'top' }}>:</td>
                          <td style={{ verticalAlign: 'top' }}>
                            {regulation.konsiderans.menimbang.map((m: any, i: number) => (
                              <div key={i} style={{ marginBottom: '0.1cm' }}>
                                <table style={{ width: '100%' }}>
                                  <tbody>
                                    <tr>
                                      <td style={{ width: '1.25cm', verticalAlign: 'top' }}>{m.letter}.</td>
                                      <td style={{ verticalAlign: 'top', textAlign: 'justify' }}>{m.text}{i < regulation.konsiderans.menimbang.length - 1 ? ';' : '.'}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            ))}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* ============ MENGINGAT - Rata kiri, tabel dengan titik dua ============ */}
                {regulation.konsiderans?.mengingat?.length > 0 && (
                  <div style={{ marginBottom: '0.5cm' }}>
                    <table style={{ ...docStyle, width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '2.5cm', verticalAlign: 'top', fontWeight: 'bold' }}>Mengingat</td>
                          <td style={{ width: '0.5cm', verticalAlign: 'top' }}>:</td>
                          <td style={{ verticalAlign: 'top' }}>
                            {regulation.konsiderans.mengingat.map((m: any, i: number) => (
                              <div key={i} style={{ marginBottom: '0.1cm' }}>
                                <table style={{ width: '100%' }}>
                                  <tbody>
                                    <tr>
                                      <td style={{ width: '1cm', verticalAlign: 'top' }}>{m.number}.</td>
                                      <td style={{ verticalAlign: 'top', textAlign: 'justify' }}>{m.text}{i < regulation.konsiderans.mengingat.length - 1 ? ';' : '.'}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            ))}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* ============ MEMUTUSKAN - Center, Bold ============ */}
                <p className="text-center font-bold" style={{ ...docStyle, marginTop: '1cm', marginBottom: '1cm' }}>
                  MEMUTUSKAN:
                </p>

                {/* ============ MENETAPKAN ============ */}
                <div style={{ marginBottom: '1cm' }}>
                  <table style={{ ...docStyle, width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '2.5cm', verticalAlign: 'top', fontWeight: 'bold' }}>Menetapkan</td>
                        <td style={{ width: '0.5cm', verticalAlign: 'top' }}>:</td>
                        <td style={{ verticalAlign: 'top' }}>
                          <p className="font-bold">{regulation.diktum?.menetapkan}</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* ============ BATANG TUBUH - Justify, Spasi 1.5 ============ */}
                <div style={{ marginBottom: '1cm' }}>
                  {renderBatangTubuh(regulation.batangTubuh || [])}
                </div>

                {/* ============ HALAMAN TANDA TANGAN - Rata Kanan ============ */}
                {regulation.penutup && (
                  <div style={{ marginTop: '2cm', textAlign: 'right' }}>
                    <p style={docStyle}>Ditetapkan di {regulation.penutup.tempat}</p>
                    <p style={{ ...docStyle, marginBottom: '1cm' }}>
                      pada tanggal {regulation.penutup.tanggal ? new Date(regulation.penutup.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '.......................'}
                    </p>
                    <p className="font-bold" style={docStyle}>{regulation.penutup.jabatan?.toUpperCase()}</p>
                    <p className="font-bold" style={{ ...docStyle, marginBottom: '2cm' }}>REPUBLIK INDONESIA,</p>
                    {/* Space for signature - 3-4 baris */}
                    <div style={{ height: '3cm' }}></div>
                    <p className="font-bold underline" style={docStyle}>
                      {regulation.penutup.namaPejabat?.toUpperCase()}
                    </p>
                  </div>
                )}

                {/* ============ LAMPIRAN - Header Rata Kanan ============ */}
                {regulation.lampiran && Array.isArray(regulation.lampiran) && regulation.lampiran.length > 0 && (
                  <div style={{ marginTop: '2cm' }}>
                    {regulation.lampiran.map((lamp: LampiranNode, lampIndex: number) => (
                      <div 
                        key={lamp.id || lampIndex} 
                        className="pdf-page"
                        style={{ 
                          pageBreakBefore: lampIndex > 0 ? 'always' : 'auto',
                          paddingTop: lampIndex > 0 ? '0' : '1cm'
                        }}
                      >
                        {/* Lampiran Header - Right Aligned, Caps, Single Spacing */}
                        <div style={{ textAlign: 'right', marginBottom: '1.5cm', lineHeight: 1.2 }}>
                          <p className="font-bold" style={docStyle}>LAMPIRAN {lamp.nomor}</p>
                          <p className="uppercase" style={docStyle}>PERATURAN BADAN NASIONAL PENCARIAN DAN PERTOLONGAN</p>
                          <p className="uppercase" style={docStyle}>REPUBLIK INDONESIA</p>
                          <p className="uppercase" style={docStyle}>
                            {regulation.nomor ? `NOMOR ${regulation.nomor} TAHUN ${regulation.tahun}` : `TAHUN ${regulation.tahun}`}
                          </p>
                          <p className="uppercase" style={docStyle}>TENTANG</p>
                          <p className="uppercase" style={docStyle}>{regulation.tentang.toUpperCase()}</p>
                        </div>
                        
                        {/* Lampiran Title - Center, Bold */}
                        {lamp.judul && (
                          <h3 className="text-center font-bold" style={{ ...docStyle, marginBottom: '1cm' }}>
                            {lamp.judul}
                          </h3>
                        )}
                        
                        {/* Lampiran Content */}
                        <div>
                          {lamp.content && Array.isArray(lamp.content) && lamp.content.map((block: LampiranBlock, blockIndex: number) => {
                            if (block.type === 'PARAGRAPH' || block.type === 'HEADING') {
                              return (
                                <p 
                                  key={block.id || blockIndex} 
                                  style={{ 
                                    ...docStyle, 
                                    textAlign: block.style?.align === 'center' ? 'center' : 
                                               block.style?.align === 'right' ? 'right' : 
                                               block.style?.align === 'justify' ? 'justify' : 'left',
                                    fontWeight: block.type === 'HEADING' ? 'bold' : 'normal',
                                    marginBottom: '0.5cm'
                                  }}
                                >
                                  {String(block.content)}
                                </p>
                              )
                            }
                            
                            if (block.type === 'TABLE') {
                              const cells = block.content as LampiranTableCell[][]
                              return (
                                <div key={block.id || blockIndex} style={{ margin: '0.5cm 0', overflowX: 'auto' }}>
                                  <table style={{ ...docStyle, fontSize: '11pt', width: '100%', borderCollapse: 'collapse' }}>
                                    <tbody>
                                      {cells.map((row, ri) => (
                                        <tr key={ri}>
                                          {row.map((cell, ci) => (
                                            <td 
                                              key={ci} 
                                              style={{ 
                                                border: '1px solid black', 
                                                padding: '0.2cm', 
                                                fontWeight: cell.isHeader ? 'bold' : 'normal',
                                                textAlign: cell.isHeader ? 'center' : 'left',
                                                verticalAlign: 'top'
                                              }}
                                              colSpan={cell.colspan} 
                                              rowSpan={cell.rowspan}
                                            >
                                              {cell.content}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )
                            }
                            
                            if (block.type === 'LIST') {
                              const items = block.content as LampiranListItem[]
                              return (
                                <div key={block.id || blockIndex}>
                                  {items.map((item, idx) => (
                                    <div key={item.id || idx} style={{ ...docStyle, paddingLeft: '1.25cm', textIndent: '-1.25cm', marginBottom: '0.1cm' }}>
                                      <span>{idx + 1}. </span>
                                      <span>{item.content}</span>
                                    </div>
                                  ))}
                                </div>
                              )
                            }
                            
                            if (block.type === 'SIGNATURE') {
                              return (
                                <div key={block.id || blockIndex} style={{ textAlign: 'right', marginTop: '1cm' }}>
                                  <p className="font-bold" style={docStyle}>{String(block.content)}</p>
                                </div>
                              )
                            }
                            
                            return null
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Page number placeholder - will be handled by CSS for print */}
                <div className="page-number-print" style={{ position: 'absolute', bottom: '1.5cm', left: '50%', transform: 'translateX(-50%)' }}>
                  {/* Page number added via CSS for print */}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-sm">Status & Informasi</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Badge className={`${STATUS_COLORS[regulation.status]} text-sm px-4 py-1`}>{STATUS_LABELS[regulation.status]}</Badge>
              <div className="text-sm space-y-2">
                <p><span className="text-muted-foreground">Jenis:</span> {JENIS_LABELS[regulation.jenis]}</p>
                <p><span className="text-muted-foreground">Versi:</span> {regulation.version}</p>
                <p><span className="text-muted-foreground">Dibuat:</span> {new Date(regulation.createdAt).toLocaleDateString('id-ID')}</p>
                <p><span className="text-muted-foreground">Oleh:</span> {regulation.createdBy?.name}</p>
                {regulation.lampiran && Array.isArray(regulation.lampiran) && regulation.lampiran.length > 0 && (
                  <>
                    <Separator />
                    <p><span className="text-muted-foreground">Lampiran:</span> {regulation.lampiran.length} dokumen</p>
                  </>
                )}
              </div>

              {regulation.status !== 'FINAL' && <Separator />}
              
              {regulation.status === 'DRAFT_WILAYAH' && canEdit(regulation.unitKerja) && (
                <Button className="w-full bg-[#0066CC]" onClick={() => handleStatusChange('REVIEW_SUBSTANSI')}><Send className="w-4 h-4 mr-2" /> Ajukan Review</Button>
              )}

              {regulation.status === 'REVIEW_SUBSTANSI' && hasRole(['SUPER_ADMIN', 'PENYUSUN_PUSAT']) && (
                <Button className="w-full bg-[#0066CC]" onClick={() => handleStatusChange('REVIEW_HUKUM')}><ArrowRight className="w-4 h-4 mr-2" /> Lanjut Review Hukum</Button>
              )}

              {regulation.status === 'REVIEW_HUKUM' && hasRole(['SUPER_ADMIN', 'REVIEWER_HUKUM']) && (
                <div className="space-y-2">
                  <Button className="w-full bg-[#00A651]" onClick={() => handleStatusChange('MENUNGGU_PERSETUJUAN')}><Check className="w-4 h-4 mr-2" /> Ajukan Persetujuan</Button>
                  <Button variant="outline" className="w-full" onClick={() => handleStatusChange('REVISI')}><Edit className="w-4 h-4 mr-2" /> Minta Revisi</Button>
                </div>
              )}

              {regulation.status === 'REVISI' && canEdit(regulation.unitKerja) && (
                <Button className="w-full bg-[#0066CC]" onClick={() => handleStatusChange('REVIEW_HUKUM')}><Send className="w-4 h-4 mr-2" /> Kirim Ulang</Button>
              )}

              {regulation.status === 'MENUNGGU_PERSETUJUAN' && canApprove() && (
                <div className="space-y-2">
                  <Button className="w-full bg-[#00A651]" onClick={() => handleStatusChange('FINAL')}><Check className="w-4 h-4 mr-2" /> Setujui</Button>
                  <Button variant="outline" className="w-full" onClick={() => handleStatusChange('REVISI')}><X className="w-4 h-4 mr-2" /> Tolak</Button>
                </div>
              )}

              {regulation.status === 'FINAL' && hasRole(['SUPER_ADMIN', 'PIMPINAN']) && (
                <Button variant="outline" className="w-full text-destructive border-destructive" onClick={() => handleStatusChange('DICABUT')}><X className="w-4 h-4 mr-2" /> Cabut</Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Catatan & Komentar</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Belum ada komentar</p>
                ) : (
                  comments.map((c, i) => (
                    <div key={c.id || i} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="w-6 h-6"><AvatarFallback>{c.user?.name?.charAt(0)}</AvatarFallback></Avatar>
                        <span className="text-sm font-medium">{c.user?.name}</span>
                      </div>
                      <p className="text-sm">{c.content}</p>
                    </div>
                  ))
                )}
              </div>
              
              {regulation.status !== 'FINAL' && (
                <div className="space-y-2">
                  <Textarea placeholder="Tulis catatan..." value={newComment} onChange={(e) => setNewComment(e.target.value)} rows={2} />
                  <Button size="sm" className="w-full" onClick={handleAddComment}>Tambah Catatan</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Format Selector Component
function FormatSelector({ value, onChange, size = 'sm' }: { 
  value: NumberingFormat; 
  onChange: (format: NumberingFormat) => void;
  size?: 'sm' | 'default' 
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`w-32 ${size === 'sm' ? 'h-8 text-xs' : ''}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {NUMBERING_FORMATS.map(fmt => (
          <SelectItem key={fmt.value} value={fmt.value} className="text-xs">
            <span className="font-mono">{fmt.example}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Point Editor Component (Recursive for nested points)
function PointEditor({ 
  point, 
  index, 
  level, 
  siblings,
  onUpdate, 
  onDelete, 
  onAddChild,
  onMoveUp,
  onMoveDown,
  onChangeFormat
}: { 
  point: TreeNode
  index: number
  level: number
  siblings: TreeNode[]
  onUpdate: (id: string, content: string) => void
  onDelete: (id: string) => void
  onAddChild: (id: string, format: NumberingFormat) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onChangeFormat: (id: string, format: NumberingFormat) => void
}) {
  const [newChildFormat, setNewChildFormat] = useState<NumberingFormat>(
    DEFAULT_FORMATS[level + 1] || 'NUMBER'
  )
  
  const indentClass = `ml-${Math.min(level * 6, 24)}`
  const label = formatNumber(index + 1, point.format)
  
  const canMoveUp = index > 0
  const canMoveDown = index < siblings.length - 1
  
  return (
    <div className={`${indentClass} group`}>
      <div className="flex items-start gap-2 py-1.5 px-2 rounded-lg hover:bg-muted/50 transition-colors">
        {/* Drag handle */}
        <div className="cursor-grab text-muted-foreground/50 hover:text-muted-foreground mt-2">
          <GripVertical className="w-4 h-4" />
        </div>
        
        {/* Number label */}
        <div className="flex items-center gap-1 min-w-[60px]">
          <Badge variant="outline" className="font-mono text-xs px-2">
            {label}
          </Badge>
        </div>
        
        {/* Content textarea */}
        <Textarea
          value={point.content}
          onChange={(e) => onUpdate(point.id, e.target.value)}
          placeholder={`Isi ${level === 0 ? 'ayat' : 'sub-poin'}...`}
          className="flex-1 min-h-[60px] resize-none"
          rows={2}
        />
        
        {/* Format selector */}
        <div className="flex flex-col gap-1">
          <FormatSelector 
            value={point.format} 
            onChange={(fmt) => onChangeFormat(point.id, fmt)}
            size="sm"
          />
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-col gap-1">
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => onMoveUp(point.id)}
              disabled={!canMoveUp}
            >
              <ChevronUp className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => onMoveDown(point.id)}
              disabled={!canMoveDown}
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            onClick={() => onDelete(point.id)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      {/* Children */}
      {point.children.length > 0 && (
        <div className="border-l-2 border-muted ml-8 pl-2 mt-1">
          {point.children.map((child, i) => (
            <PointEditor
              key={child.id}
              point={child}
              index={i}
              level={level + 1}
              siblings={point.children}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onChangeFormat={onChangeFormat}
            />
          ))}
        </div>
      )}
      
      {/* Add sub-point button */}
      <div className={`${indentClass} ml-8 mt-1 mb-2`}>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => onAddChild(point.id, newChildFormat)}
          >
            <PlusCircle className="w-3 h-3 mr-1" />
            Sub-Poin
          </Button>
          <FormatSelector 
            value={newChildFormat}
            onChange={setNewChildFormat}
            size="sm"
          />
        </div>
      </div>
    </div>
  )
}

// Pasal Editor Component
function PasalEditor({ 
  pasal, 
  babId,
  onUpdate, 
  onDelete,
  onAddPoint
}: { 
  pasal: PasalNode
  babId: string
  onUpdate: (babId: string, pasalId: string, children: TreeNode[]) => void
  onDelete: (babId: string, pasalId: string) => void
  onAddPoint: (babId: string, pasalId: string, format: NumberingFormat) => void
}) {
  const [newPointFormat, setNewPointFormat] = useState<NumberingFormat>('NUMBER_PAREN')
  
  // Handlers for nested points
  const handleUpdatePoint = useCallback((pointId: string, content: string) => {
    const updateChildren = (nodes: TreeNode[]): TreeNode[] => 
      nodes.map(node => {
        if (node.id === pointId) {
          return { ...node, content }
        }
        if (node.children.length > 0) {
          return { ...node, children: updateChildren(node.children) }
        }
        return node
      })
    
    onUpdate(babId, pasal.id, updateChildren(pasal.children))
  }, [babId, pasal.id, pasal.children, onUpdate])
  
  const handleDeletePoint = useCallback((pointId: string) => {
    const deleteFromNodes = (nodes: TreeNode[]): TreeNode[] => 
      nodes
        .filter(node => node.id !== pointId)
        .map(node => ({
          ...node,
          children: deleteFromNodes(node.children)
        }))
    
    onUpdate(babId, pasal.id, deleteFromNodes(pasal.children))
  }, [babId, pasal.id, pasal.children, onUpdate])
  
  const handleAddChild = useCallback((parentId: string, format: NumberingFormat) => {
    const addToNodes = (nodes: TreeNode[]): TreeNode[] => 
      nodes.map(node => {
        if (node.id === parentId) {
          return { 
            ...node, 
            children: [...node.children, createTreeNode('SUBPOINT', format)]
          }
        }
        if (node.children.length > 0) {
          return { ...node, children: addToNodes(node.children) }
        }
        return node
      })
    
    onUpdate(babId, pasal.id, addToNodes(pasal.children))
  }, [babId, pasal.id, pasal.children, onUpdate])
  
  const handleMoveUp = useCallback((pointId: string) => {
    const moveInNodes = (nodes: TreeNode[]): TreeNode[] => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === pointId && i > 0) {
          const newNodes = [...nodes]
          ;[newNodes[i - 1], newNodes[i]] = [newNodes[i], newNodes[i - 1]]
          return newNodes
        }
        if (nodes[i].children.length > 0) {
          const newChildren = moveInNodes(nodes[i].children)
          if (newChildren !== nodes[i].children) {
            const newNodes = [...nodes]
            newNodes[i] = { ...nodes[i], children: newChildren }
            return newNodes
          }
        }
      }
      return nodes
    }
    
    onUpdate(babId, pasal.id, moveInNodes(pasal.children))
  }, [babId, pasal.id, pasal.children, onUpdate])
  
  const handleMoveDown = useCallback((pointId: string) => {
    const moveInNodes = (nodes: TreeNode[]): TreeNode[] => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === pointId && i < nodes.length - 1) {
          const newNodes = [...nodes]
          ;[newNodes[i], newNodes[i + 1]] = [newNodes[i + 1], newNodes[i]]
          return newNodes
        }
        if (nodes[i].children.length > 0) {
          const newChildren = moveInNodes(nodes[i].children)
          if (newChildren !== nodes[i].children) {
            const newNodes = [...nodes]
            newNodes[i] = { ...nodes[i], children: newChildren }
            return newNodes
          }
        }
      }
      return nodes
    }
    
    onUpdate(babId, pasal.id, moveInNodes(pasal.children))
  }, [babId, pasal.id, pasal.children, onUpdate])
  
  const handleChangeFormat = useCallback((pointId: string, format: NumberingFormat) => {
    const updateFormat = (nodes: TreeNode[]): TreeNode[] =>
      nodes.map(node => {
        if (node.id === pointId) {
          return { ...node, format }
        }
        if (node.children.length > 0) {
          return { ...node, children: updateFormat(node.children) }
        }
        return node
      })
    
    onUpdate(babId, pasal.id, updateFormat(pasal.children))
  }, [babId, pasal.id, pasal.children, onUpdate])
  
  return (
    <div className="border-l-2 border-[#0066CC]/30 pl-4 py-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Badge className="bg-[#0066CC] text-white font-bold">
            Pasal {pasal.number}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {pasal.children.length} ayat • {countPoints(pasal.children)} total poin
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive h-7"
          onClick={() => onDelete(babId, pasal.id)}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
      
      {/* Points list */}
      {pasal.children.length > 0 ? (
        <div className="space-y-1">
          {pasal.children.map((point, i) => (
            <PointEditor
              key={point.id}
              point={point}
              index={i}
              level={0}
              siblings={pasal.children}
              onUpdate={handleUpdatePoint}
              onDelete={handleDeletePoint}
              onAddChild={handleAddChild}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onChangeFormat={handleChangeFormat}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground text-sm">
          Belum ada ayat
        </div>
      )}
      
      {/* Add ayat button */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t">
        <Button
          size="sm"
          className="bg-[#0066CC] hover:bg-[#0052A3]"
          onClick={() => onAddPoint(babId, pasal.id, newPointFormat)}
        >
          <PlusCircle className="w-4 h-4 mr-1" />
          Tambah Ayat
        </Button>
        <span className="text-xs text-muted-foreground">Format:</span>
        <FormatSelector value={newPointFormat} onChange={setNewPointFormat} size="sm" />
      </div>
    </div>
  )
}

// BAB Editor Component
function BABEditor({ 
  bab, 
  onUpdateTitle, 
  onDelete,
  onAddPasal,
  onUpdatePasal,
  onDeletePasal,
  onAddPoint
}: { 
  bab: BABNode
  onUpdateTitle: (id: string, title: string) => void
  onDelete: (id: string) => void
  onAddPasal: (id: string) => void
  onUpdatePasal: (babId: string, pasalId: string, children: TreeNode[]) => void
  onDeletePasal: (babId: string, pasalId: string) => void
  onAddPoint: (babId: string, pasalId: string, format: NumberingFormat) => void
}) {
  return (
    <Card className="border-l-4 border-l-[#FF6B00]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className="bg-[#FF6B00] text-white text-lg px-3 py-1">
              BAB {bab.number}
            </Badge>
            <Input
              value={bab.title}
              onChange={(e) => onUpdateTitle(bab.id, e.target.value)}
              placeholder="Judul BAB (opsional)"
              className="w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => onAddPasal(bab.id)}>
              <PlusCircle className="w-4 h-4 mr-1" />
              Pasal
            </Button>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onDelete(bab.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {bab.children.length > 0 ? (
          <div className="space-y-4">
            {bab.children.map((pasal) => (
              <PasalEditor
                key={pasal.id}
                pasal={pasal}
                babId={bab.id}
                onUpdate={onUpdatePasal}
                onDelete={onDeletePasal}
                onAddPoint={onAddPoint}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>Belum ada Pasal</p>
            <p className="text-sm">Klik "Pasal" untuk menambahkan</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Lampiran Editor Component
function LampiranEditor({
  lampiran,
  jenis,
  nomor,
  tahun,
  tentang,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown
}: {
  lampiran: LampiranNode
  jenis: string
  nomor: string | null
  tahun: number
  tentang: string
  onUpdate: (updater: (lamp: LampiranNode) => LampiranNode) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  canMoveUp: boolean
  canMoveDown: boolean
}) {
  const [newBlockType, setNewBlockType] = useState<LampiranBlockType>('PARAGRAPH')
  
  // Generate header text
  const headerLines = generateLampiranHeader(
    lampiran.nomor,
    jenis,
    nomor,
    tahun,
    tentang
  )
  
  const handleAddBlock = () => {
    let newBlock: LampiranBlock
    switch (newBlockType) {
      case 'HEADING':
        newBlock = createHeadingBlock()
        break
      case 'TABLE':
        newBlock = createTableBlock()
        break
      case 'LIST':
        newBlock = createListBlock()
        break
      case 'SIGNATURE':
        newBlock = createSignatureBlock()
        break
      default:
        newBlock = createParagraphBlock()
    }
    onUpdate(l => addBlockToLampiran(l, newBlock))
  }
  
  const handleUpdateBlock = (blockId: string, content: string) => {
    onUpdate(l => updateBlockInLampiran(l, blockId, block => ({
      ...block,
      content
    })))
  }
  
  const handleDeleteBlock = (blockId: string) => {
    onUpdate(l => deleteBlockFromLampiran(l, blockId))
  }
  
  const handleUpdateBlockStyle = (blockId: string, style: Partial<LampiranBlock['style']>) => {
    onUpdate(l => updateBlockInLampiran(l, blockId, block => ({
      ...block,
      style: { ...block.style, ...style }
    })))
  }
  
  // Render content block
  const renderBlock = (block: LampiranBlock, index: number) => {
    const alignClass = block.style?.align === 'center' ? 'text-center' : 
                       block.style?.align === 'right' ? 'text-right' :
                       block.style?.align === 'justify' ? 'text-justify' : 'text-left'
    
    if (block.type === 'PARAGRAPH' || block.type === 'HEADING') {
      return (
        <div key={block.id} className="mb-4 group">
          <div className="flex items-start gap-2">
            <Badge variant="outline" className="mt-2 shrink-0">
              {block.type === 'HEADING' ? 'Judul' : 'Paragraf'}
            </Badge>
            <Textarea
              value={String(block.content)}
              onChange={(e) => handleUpdateBlock(block.id, e.target.value)}
              placeholder={block.type === 'HEADING' ? 'Judul...' : 'Isi paragraf...'}
              className={`flex-1 ${block.type === 'HEADING' ? 'font-bold text-lg' : ''}`}
              rows={block.type === 'HEADING' ? 2 : 4}
            />
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive mt-1"
              onClick={() => handleDeleteBlock(block.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )
    }
    
    if (block.type === 'TABLE') {
      const cells = block.content as LampiranTableCell[][]
      return (
        <div key={block.id} className="mb-4 border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline">Tabel</Badge>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={() => handleDeleteBlock(block.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <tbody>
                {cells.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} className={`border border-gray-300 p-2 ${cell.isHeader ? 'bg-gray-100 font-bold' : ''}`}>
                        <Input
                          value={cell.content}
                          onChange={(e) => {
                            const newCells = cells.map((r, rIdx) =>
                              rIdx === ri
                                ? r.map((c, cIdx) => cIdx === ci ? { ...c, content: e.target.value } : c)
                                : r
                            )
                            handleUpdateBlock(block.id, newCells as any)
                          }}
                          className="border-0 p-1"
                          placeholder={cell.isHeader ? 'Header' : 'Data'}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    }
    
    if (block.type === 'LIST') {
      const items = block.content as LampiranListItem[]
      return (
        <div key={block.id} className="mb-4 border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline">Daftar</Badge>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={() => handleDeleteBlock(block.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-2">
                <span className="w-6 text-center font-medium">{idx + 1}.</span>
                <Input
                  value={item.content}
                  onChange={(e) => {
                    const newItems = items.map(i => i.id === item.id ? { ...i, content: e.target.value } : i)
                    handleUpdateBlock(block.id, newItems as any)
                  }}
                  className="flex-1"
                  placeholder="Item..."
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => {
                    const newItems = items.filter(i => i.id !== item.id)
                    handleUpdateBlock(block.id, newItems as any)
                  }}
                >
                  <MinusCircle className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const newItem: LampiranListItem = { id: generateId(), content: '' }
                handleUpdateBlock(block.id, [...items, newItem] as any)
              }}
            >
              <PlusCircle className="w-4 h-4 mr-1" /> Tambah Item
            </Button>
          </div>
        </div>
      )
    }
    
    if (block.type === 'SIGNATURE') {
      return (
        <div key={block.id} className="mb-4 group">
          <div className="flex items-start gap-2">
            <Badge variant="outline" className="mt-2">Tanda Tangan</Badge>
            <Textarea
              value={String(block.content)}
              onChange={(e) => handleUpdateBlock(block.id, e.target.value)}
              placeholder="Nama pejabat..."
              className="flex-1"
              rows={2}
            />
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive mt-1"
              onClick={() => handleDeleteBlock(block.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )
    }
    
    return null
  }
  
  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className="bg-purple-500 text-white text-lg px-3 py-1">
              LAMPIRAN {lampiran.nomor}
            </Badge>
            <Input
              value={lampiran.judul}
              onChange={(e) => onUpdate(l => ({ ...l, judul: e.target.value }))}
              placeholder="Judul lampiran (opsional)"
              className="w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={onMoveUp} disabled={!canMoveUp}>
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onMoveDown} disabled={!canMoveDown}>
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Header Preview - Right Aligned */}
        <div className="bg-gray-50 border rounded-lg p-4 text-right font-mono text-sm">
          {headerLines.map((line, i) => (
            <p key={i} className={`${i === 0 ? 'font-bold text-base' : ''} ${i === 3 ? 'italic' : ''}`}>
              {line}
            </p>
          ))}
        </div>
        
        {/* Content Blocks */}
        {lampiran.content.length > 0 ? (
          <div className="space-y-2">
            {lampiran.content.map((block, i) => renderBlock(block, i))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>Belum ada konten</p>
          </div>
        )}
        
        {/* Add Block Controls */}
        <div className="flex items-center gap-2 pt-4 border-t">
          <Select value={newBlockType} onValueChange={(v) => setNewBlockType(v as LampiranBlockType)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PARAGRAPH">Paragraf</SelectItem>
              <SelectItem value="HEADING">Judul</SelectItem>
              <SelectItem value="TABLE">Tabel</SelectItem>
              <SelectItem value="LIST">Daftar</SelectItem>
              <SelectItem value="SIGNATURE">Tanda Tangan</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddBlock} size="sm" className="bg-purple-500 hover:bg-purple-600">
            <PlusCircle className="w-4 h-4 mr-1" /> Tambah Blok
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Editor Page
function EditorPage({ regulation, onBack }: { regulation: Regulation | null; onBack: () => void }) {
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [jenis, setJenis] = useState(regulation?.jenis || 'PERATURAN_BADAN')
  const [tahun, setTahun] = useState(regulation?.tahun || new Date().getFullYear())
  const [tentang, setTentang] = useState(regulation?.tentang || '')
  const [unitKerja, setUnitKerja] = useState(regulation?.unitKerja || user?.unitKerja || '')
  const [menimbang, setMenimbang] = useState<{ id: string; letter: string; text: string }[]>(regulation?.konsiderans?.menimbang || [{ id: '1', letter: 'a', text: '' }])
  const [mengingat, setMengingat] = useState<{ id: string; number: number; text: string }[]>(regulation?.konsiderans?.mengingat || [{ id: '1', number: 1, text: '' }])
  const [menetapkan, setMenetapkan] = useState(regulation?.diktum?.menetapkan || '')
  const [batangTubuh, setBatangTubuh] = useState<BatangTubuh>(() => {
    // Migrate legacy format if needed
    if (regulation?.batangTubuh && Array.isArray(regulation.batangTubuh)) {
      return migrateLegacyFormat(regulation.batangTubuh)
    }
    return []
  })
  const [lampiran, setLampiran] = useState<LampiranList>(() => {
    if (regulation?.lampiran && Array.isArray(regulation.lampiran)) {
      return reindexLampiran(regulation.lampiran)
    }
    return []
  })
  const [tempat, setTempat] = useState(regulation?.penutup?.tempat || 'Jakarta')
  const [tanggal, setTanggal] = useState(regulation?.penutup?.tanggal || '')
  const [namaPejabat, setNamaPejabat] = useState(regulation?.penutup?.namaPejabat || '')
  const [jabatan, setJabatan] = useState(regulation?.penutup?.jabatan || 'KEPALA BADAN NASIONAL PENCARIAN DAN PERTOLONGAN REPUBLIK INDONESIA')

  const updateMenimbangLetters = (items: typeof menimbang) => {
    const letters = 'abcdefghijklmnopqrstuvwxyz'
    return items.map((item, index) => ({ ...item, letter: letters[index] || String(index) }))
  }

  const updateMengingatNumbers = (items: typeof mengingat) => items.map((item, index) => ({ ...item, number: index + 1 }))

  const addMenimbang = () => setMenimbang(prev => updateMenimbangLetters([...prev, { id: Date.now().toString(), letter: '', text: '' }]))
  const removeMenimbang = (id: string) => setMenimbang(prev => updateMenimbangLetters(prev.filter(item => item.id !== id)))
  const updateMenimbangText = (id: string, text: string) => setMenimbang(prev => prev.map(item => item.id === id ? { ...item, text } : item))

  const addMengingat = () => setMengingat(prev => updateMengingatNumbers([...prev, { id: Date.now().toString(), number: 0, text: '' }]))
  const removeMengingat = (id: string) => setMengingat(prev => updateMengingatNumbers(prev.filter(item => item.id !== id)))
  const updateMengingatText = (id: string, text: string) => setMengingat(prev => prev.map(item => item.id === id ? { ...item, text } : item))

  // BAB handlers
  const addBAB = useCallback(() => {
    setBatangTubuh(prev => [...prev, createBAB(prev)])
  }, [])
  
  const updateBABTitle = useCallback((babId: string, title: string) => {
    setBatangTubuh(prev => prev.map(bab => 
      bab.id === babId ? { ...bab, title } : bab
    ))
  }, [])
  
  const deleteBAB = useCallback((babId: string) => {
    setBatangTubuh(prev => prev.filter(bab => bab.id !== babId))
  }, [])
  
  const addPasal = useCallback((babId: string) => {
    setBatangTubuh(prev => prev.map(bab => {
      if (bab.id === babId) {
        return { 
          ...bab, 
          children: [...bab.children, createPasal(bab.children)] 
        }
      }
      return bab
    }))
  }, [])
  
  const deletePasal = useCallback((babId: string, pasalId: string) => {
    setBatangTubuh(prev => prev.map(bab => {
      if (bab.id === babId) {
        return { 
          ...bab, 
          children: bab.children.filter(p => p.id !== pasalId) 
        }
      }
      return bab
    }))
  }, [])
  
  const updatePasalChildren = useCallback((babId: string, pasalId: string, children: TreeNode[]) => {
    setBatangTubuh(prev => prev.map(bab => {
      if (bab.id === babId) {
        return { 
          ...bab, 
          children: bab.children.map(p => 
            p.id === pasalId ? { ...p, children } : p
          )
        }
      }
      return bab
    }))
  }, [])
  
  const addPoint = useCallback((babId: string, pasalId: string, format: NumberingFormat) => {
    setBatangTubuh(prev => prev.map(bab => {
      if (bab.id === babId) {
        return { 
          ...bab, 
          children: bab.children.map(p => 
            p.id === pasalId 
              ? { ...p, children: [...p.children, createTreeNode('AYAT', format)] }
              : p
          )
        }
      }
      return bab
    }))
  }, [])

  // Lampiran handlers
  const handleAddLampiran = useCallback(() => {
    setLampiran(prev => [...prev, createLampiran(prev)])
  }, [])
  
  const handleDeleteLampiran = useCallback((lampiranId: string) => {
    setLampiran(prev => reindexLampiran(prev.filter(l => l.id !== lampiranId)))
  }, [])
  
  const handleUpdateLampiran = useCallback((lampiranId: string, updater: (lamp: LampiranNode) => LampiranNode) => {
    setLampiran(prev => prev.map(l => l.id === lampiranId ? updater(l) : l))
  }, [])
  
  const handleMoveLampiran = useCallback((lampiranId: string, direction: 'up' | 'down') => {
    setLampiran(prev => {
      const index = prev.findIndex(l => l.id === lampiranId)
      if (index === -1) return prev
      if (direction === 'up' && index === 0) return prev
      if (direction === 'down' && index === prev.length - 1) return prev
      
      const newLampiran = [...prev]
      const newIndex = direction === 'up' ? index - 1 : index + 1
      ;[newLampiran[index], newLampiran[newIndex]] = [newLampiran[newIndex], newLampiran[index]]
      return reindexLampiran(newLampiran)
    })
  }, [])

  const handleSave = async () => {
    if (!tentang.trim()) { toast.error('Judul regulasi harus diisi'); return }
    setIsSaving(true)
    const data = {
      jenis, tahun, tentang, unitKerja,
      status: regulation?.status || 'DRAFT_WILAYAH',
      header: { jenis, tahun, tentang },
      konsiderans: { menimbang: menimbang.filter(m => m.text.trim()), mengingat: mengingat.filter(m => m.text.trim()), memperhatikan: [] },
      diktum: { memutuskan: 'MEMUTUSKAN:', menetapkan: menetapkan || `PERATURAN BADAN NASIONAL PENCARIAN DAN PERTOLONGAN TENTANG ${tentang.toUpperCase()}` },
      batangTubuh,
      lampiran,
      penutup: { tempat, tanggal, namaPejabat, jabatan }
    }
    try {
      if (regulation?.id) {
        await api.updateRegulation(regulation.id, data)
        toast.success('Regulasi berhasil diperbarui')
      } else {
        await api.createRegulation(data)
        toast.success('Regulasi berhasil dibuat')
      }
      onBack()
    } catch (error) {
      toast.error('Gagal menyimpan regulasi')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}><ChevronRight className="w-4 h-4 mr-1 rotate-180" /> Kembali</Button>
          <div>
            <h1 className="text-2xl font-bold text-[#1A3A5C]">{regulation ? 'Edit Regulasi' : 'Buat Regulasi Baru'}</h1>
            <p className="text-muted-foreground">{regulation ? `Versi ${regulation.version}` : 'Gunakan editor terstruktur'}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => handleSave()} disabled={isSaving}><Save className="w-4 h-4 mr-2" /> Simpan Draft</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText className="w-5 h-5" /> Header Regulasi</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Jenis Regulasi</Label>
                  <Select value={jenis} onValueChange={setJenis}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(JENIS_LABELS).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tahun</Label>
                  <Input type="number" value={tahun} onChange={(e) => setTahun(parseInt(e.target.value))} min={2000} max={2100} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tentang / Judul</Label>
                <Input value={tentang} onChange={(e) => setTentang(e.target.value)} placeholder="Judul regulasi..." />
              </div>
              <div className="space-y-2">
                <Label>Unit Kerja</Label>
                <Input value={unitKerja} onChange={(e) => setUnitKerja(e.target.value)} placeholder="Kantor SAR / Kantor Pusat..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Konsiderans</CardTitle>
              <CardDescription>Bagian Menimbang dan Mengingat</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Menimbang:</Label>
                  <Button size="sm" variant="outline" onClick={addMenimbang}><PlusCircle className="w-4 h-4 mr-1" /> Tambah Poin</Button>
                </div>
                {menimbang.map((item) => (
                  <div key={item.id} className="flex items-start gap-2">
                    <div className="w-8 h-10 flex items-center justify-center bg-muted rounded font-medium">{item.letter}.</div>
                    <Textarea value={item.text} onChange={(e) => updateMenimbangText(item.id, e.target.value)} placeholder="Bahwa..." className="flex-1" rows={2} />
                    {menimbang.length > 1 && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeMenimbang(item.id)}><MinusCircle className="w-4 h-4" /></Button>}
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Mengingat:</Label>
                  <Button size="sm" variant="outline" onClick={addMengingat}><PlusCircle className="w-4 h-4 mr-1" /> Tambah Poin</Button>
                </div>
                {mengingat.map((item) => (
                  <div key={item.id} className="flex items-start gap-2">
                    <div className="w-8 h-10 flex items-center justify-center bg-muted rounded font-medium">{item.number}.</div>
                    <Textarea value={item.text} onChange={(e) => updateMengingatText(item.id, e.target.value)} placeholder="Undang-Undang/Peraturan..." className="flex-1" rows={2} />
                    {mengingat.length > 1 && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeMengingat(item.id)}><MinusCircle className="w-4 h-4" /></Button>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Diktum</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg"><p className="font-bold text-center">MEMUTUSKAN:</p></div>
              <div className="space-y-2">
                <Label>Menetapkan:</Label>
                <Textarea value={menetapkan} onChange={(e) => setMenetapkan(e.target.value)} placeholder="PERATURAN BADAN NASIONAL..." rows={2} />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {/* Batang Tubuh Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#1A3A5C]">Batang Tubuh</h2>
                <p className="text-sm text-muted-foreground">BAB, Pasal, dan Ayat dengan format fleksibel</p>
              </div>
              <Button className="bg-[#FF6B00] hover:bg-[#E55A00]" onClick={addBAB}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Tambah BAB
              </Button>
            </div>
            
            {/* Format Info */}
            <Card className="bg-muted/50">
              <CardContent className="py-3">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <span className="font-medium">Format tersedia:</span>
                  {NUMBERING_FORMATS.map(fmt => (
                    <Badge key={fmt.value} variant="outline" className="font-mono">
                      {fmt.example}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* BAB List */}
            {batangTubuh.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">Belum ada BAB</p>
                    <p className="text-sm">Klik "Tambah BAB" untuk memulai</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {batangTubuh.map((bab) => (
                  <BABEditor
                    key={bab.id}
                    bab={bab}
                    onUpdateTitle={updateBABTitle}
                    onDelete={deleteBAB}
                    onAddPasal={addPasal}
                    onUpdatePasal={updatePasalChildren}
                    onDeletePasal={deletePasal}
                    onAddPoint={addPoint}
                  />
                ))}
              </div>
            )}
          </div>

          <Card>
            <CardHeader><CardTitle className="text-lg">Penutup</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tempat</Label>
                  <Input value={tempat} onChange={(e) => setTempat(e.target.value)} placeholder="Jakarta" />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal</Label>
                  <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nama Pejabat</Label>
                <Input value={namaPejabat} onChange={(e) => setNamaPejabat(e.target.value)} placeholder="Nama lengkap pejabat" />
              </div>
              <div className="space-y-2">
                <Label>Jabatan</Label>
                <Input value={jabatan} onChange={(e) => setJabatan(e.target.value)} placeholder="Jabatan pejabat" />
              </div>
            </CardContent>
          </Card>

          {/* Lampiran Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#1A3A5C]">Lampiran</h2>
                <p className="text-sm text-muted-foreground">Dokumen pelengkap peraturan</p>
              </div>
              <Button className="bg-purple-500 hover:bg-purple-600" onClick={handleAddLampiran}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Tambah Lampiran
              </Button>
            </div>
            
            {lampiran.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">Belum ada Lampiran</p>
                    <p className="text-sm">Klik "Tambah Lampiran" untuk menambahkan dokumen pelengkap</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {lampiran.map((lamp, index) => (
                  <LampiranEditor
                    key={lamp.id}
                    lampiran={lamp}
                    jenis={jenis}
                    nomor={regulation?.nomor || null}
                    tahun={tahun}
                    tentang={tentang}
                    onUpdate={(updater) => handleUpdateLampiran(lamp.id, updater)}
                    onDelete={() => handleDeleteLampiran(lamp.id)}
                    onMoveUp={() => handleMoveLampiran(lamp.id, 'up')}
                    onMoveDown={() => handleMoveLampiran(lamp.id, 'down')}
                    canMoveUp={index > 0}
                    canMoveDown={index < lampiran.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Preview Struktur</CardTitle></CardHeader>
              <CardContent>
                <div className="text-xs space-y-2">
                  <p><strong>Jenis:</strong> {JENIS_LABELS[jenis]}</p>
                  <p><strong>Tahun:</strong> {tahun}</p>
                  <p><strong>Tentang:</strong> {tentang || '-'}</p>
                  <Separator />
                  <p><strong>Menimbang:</strong> {menimbang.filter(m => m.text).length} poin</p>
                  <p><strong>Mengingat:</strong> {mengingat.filter(m => m.text).length} poin</p>
                  <Separator />
                  <p className="font-medium text-[#FF6B00]">Batang Tubuh:</p>
                  <p><strong>BAB:</strong> {batangTubuh.length}</p>
                  <p><strong>Total Pasal:</strong> {batangTubuh.reduce((acc, bab) => acc + bab.children.length, 0)}</p>
                  <p><strong>Total Poin:</strong> {batangTubuh.reduce((acc, bab) => 
                    acc + bab.children.reduce((pAcc, pasal) => pAcc + countPoints(pasal.children), 0)
                  , 0)}</p>
                  <Separator />
                  <p className="font-medium text-purple-500">Lampiran:</p>
                  <p><strong>Jumlah:</strong> {lampiran.length} lampiran</p>
                  <p><strong>Total Blok:</strong> {lampiran.reduce((acc, l) => acc + l.content.length, 0)} blok</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main App
export default function Home() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [selectedRegulation, setSelectedRegulation] = useState<Regulation | null>(null)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage setCurrentPage={setCurrentPage} setSelectedRegulation={setSelectedRegulation} />
      case 'regulations': return <RegulationsPage setCurrentPage={setCurrentPage} setSelectedRegulation={setSelectedRegulation} />
      case 'editor': return <EditorPage regulation={selectedRegulation} onBack={() => { setSelectedRegulation(null); setCurrentPage('regulations') }} />
      case 'view': return selectedRegulation ? <ViewRegulationPage regulation={selectedRegulation} onBack={() => { setSelectedRegulation(null); setCurrentPage('regulations') }} /> : <RegulationsPage setCurrentPage={setCurrentPage} setSelectedRegulation={setSelectedRegulation} />
      case 'search': return <SearchPage setCurrentPage={setCurrentPage} setSelectedRegulation={setSelectedRegulation} />
      case 'approvals': return <ApprovalsPage setCurrentPage={setCurrentPage} setSelectedRegulation={setSelectedRegulation} />
      case 'admin': return <AdminPage />
      default: return <DashboardPage setCurrentPage={setCurrentPage} setSelectedRegulation={setSelectedRegulation} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="ml-64 min-h-screen">{renderPage()}</main>
    </div>
  )
}
