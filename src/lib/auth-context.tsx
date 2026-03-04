'use client'

import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react'
import { createContext, useContext, ReactNode, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: string
  unitKerja?: string | null
  jabatan?: string | null
  nip?: string | null
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  hasRole: (roles: string | string[]) => boolean
  canEdit: (regulationUnitKerja?: string) => boolean
  canApprove: () => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

function AuthProviderInner({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  
  // Derive user from session directly instead of using useEffect with setState
  const user: User | null = session?.user ? {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    unitKerja: session.user.unitKerja,
    jabatan: session.user.jabatan,
    nip: session.user.nip
  } : null

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        return { success: false, error: 'Email atau password salah' }
      }

      return { success: true }
    } catch {
      return { success: false, error: 'Terjadi kesalahan saat login' }
    }
  }

  const logout = async () => {
    await signOut({ redirect: false })
  }

  const hasRole = (roles: string | string[]) => {
    if (!user) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(user.role)
  }

  const canEdit = (regulationUnitKerja?: string) => {
    if (!user) return false
    
    // Super Admin can edit everything
    if (user.role === 'SUPER_ADMIN') return true
    
    // Penyusun Pusat can edit all drafts
    if (user.role === 'PENYUSUN_PUSAT') return true
    
    // Penyusun Wilayah can only edit their own unit's drafts
    if (user.role === 'PENYUSUN_WILAYAH') {
      return regulationUnitKerja === user.unitKerja
    }
    
    return false
  }

  const canApprove = () => {
    if (!user) return false
    return user.role === 'PIMPINAN' || user.role === 'SUPER_ADMIN'
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: status === 'loading',
        isAuthenticated: !!session,
        login,
        logout,
        hasRole,
        canEdit,
        canApprove
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProviderInner>{children}</AuthProviderInner>
    </SessionProvider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Role display names
export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  PENYUSUN_WILAYAH: 'Penyusun Wilayah',
  PENYUSUN_PUSAT: 'Penyusun Pusat',
  REVIEWER_HUKUM: 'Reviewer Hukum',
  PIMPINAN: 'Pimpinan',
  VIEWER: 'Viewer'
}

// Status display names
export const STATUS_LABELS: Record<string, string> = {
  DRAFT_WILAYAH: 'Draft Wilayah',
  REVIEW_SUBSTANSI: 'Review Substansi',
  REVIEW_HUKUM: 'Review Hukum',
  REVISI: 'Revisi',
  MENUNGGU_PERSETUJUAN: 'Menunggu Persetujuan',
  FINAL: 'Final',
  DICABUT: 'Dicabut'
}

// Status colors
export const STATUS_COLORS: Record<string, string> = {
  DRAFT_WILAYAH: 'bg-gray-100 text-gray-800 border-gray-200',
  REVIEW_SUBSTANSI: 'bg-blue-50 text-blue-800 border-blue-200',
  REVIEW_HUKUM: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  REVISI: 'bg-orange-50 text-orange-800 border-orange-200',
  MENUNGGU_PERSETUJUAN: 'bg-purple-50 text-purple-800 border-purple-200',
  FINAL: 'bg-green-50 text-green-800 border-green-200',
  DICABUT: 'bg-red-50 text-red-800 border-red-200'
}

// Jenis display names
export const JENIS_LABELS: Record<string, string> = {
  PERATURAN_BADAN: 'Peraturan Badan',
  PEDOMAN: 'Pedoman',
  KEPUTUSAN: 'Keputusan',
  SURAT_EDARAN: 'Surat Edaran'
}

// Relation type labels
export const RELATION_LABELS: Record<string, string> = {
  MENGUBAH: 'Mengubah',
  MENCABUT: 'Mencabut',
  MENJADI_DASAR: 'Menjadi Dasar',
  PERUBAHAN_ATAS: 'Perubahan Atas'
}
