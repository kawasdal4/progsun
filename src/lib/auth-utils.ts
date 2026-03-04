import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireRole(roles: UserRole[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new Error('Forbidden');
  }
  return user;
}

export function hasPermission(role: UserRole, action: string): boolean {
  const permissions: Record<UserRole, string[]> = {
    SUPER_ADMIN: [
      'create_regulation',
      'edit_regulation',
      'delete_regulation',
      'view_regulation',
      'approve_regulation',
      'reject_regulation',
      'manage_users',
      'view_audit_logs',
      'change_status',
      'finalized_regulation',
      'revoke_regulation',
    ],
    PENYUSUN_WILAYAH: [
      'create_regulation',
      'edit_regulation',
      'view_regulation',
      'submit_for_review',
    ],
    PENYUSUN_PUSAT: [
      'create_regulation',
      'edit_regulation',
      'view_regulation',
      'submit_for_review',
      'review_substansi',
    ],
    REVIEWER_HUKUM: [
      'view_regulation',
      'review_hukum',
      'add_comments',
      'approve_review',
      'reject_review',
      'request_revision',
    ],
    PIMPINAN: [
      'view_regulation',
      'approve_regulation',
      'reject_regulation',
      'revoke_regulation',
    ],
    VIEWER: [
      'view_regulation',
    ],
  };

  return permissions[role]?.includes(action) || false;
}

export function canEditRegulation(
  userRole: UserRole,
  regulationStatus: string,
  regulationUnitKerja: string | null,
  userUnitKerja: string | null
): boolean {
  // SUPER_ADMIN can always edit
  if (userRole === 'SUPER_ADMIN') return true;

  // FINAL and DICABUT status cannot be edited
  if (regulationStatus === 'FINAL' || regulationStatus === 'DICABUT') return false;

  // PENYUSUN_WILAYAH can only edit their own unit's drafts
  if (userRole === 'PENYUSUN_WILAYAH') {
    return (
      regulationStatus === 'DRAFT_WILAYAH' &&
      regulationUnitKerja === userUnitKerja
    );
  }

  // PENYUSUN_PUSAT can edit drafts and revisions
  if (userRole === 'PENYUSUN_PUSAT') {
    return ['DRAFT_WILAYAH', 'DRAFT_PUSAT', 'REVISI'].includes(regulationStatus);
  }

  return false;
}

export function canChangeStatus(
  userRole: UserRole,
  currentStatus: string,
  targetStatus: string
): boolean {
  const allowedTransitions: Record<UserRole, Record<string, string[]>> = {
    SUPER_ADMIN: {
      DRAFT_WILAYAH: ['REVIEW_SUBSTANSI'],
      REVIEW_SUBSTANSI: ['REVIEW_HUKUM', 'REVISI'],
      REVIEW_HUKUM: ['REVISI', 'MENUNGGU_PERSETUJUAN'],
      REVISI: ['REVIEW_HUKUM'],
      MENUNGGU_PERSETUJUAN: ['FINAL', 'REVISI'],
      FINAL: ['DICABUT'],
      DICABUT: [],
    },
    PENYUSUN_WILAYAH: {
      DRAFT_WILAYAH: ['REVIEW_SUBSTANSI'],
      REVIEW_SUBSTANSI: [],
      REVIEW_HUKUM: [],
      REVISI: [],
      MENUNGGU_PERSETUJUAN: [],
      FINAL: [],
      DICABUT: [],
    },
    PENYUSUN_PUSAT: {
      DRAFT_WILAYAH: ['REVIEW_SUBSTANSI'],
      REVIEW_SUBSTANSI: ['REVIEW_HUKUM'],
      REVIEW_HUKUM: [],
      REVISI: ['REVIEW_HUKUM'],
      MENUNGGU_PERSETUJUAN: [],
      FINAL: [],
      DICABUT: [],
    },
    REVIEWER_HUKUM: {
      DRAFT_WILAYAH: [],
      REVIEW_SUBSTANSI: [],
      REVIEW_HUKUM: ['REVISI', 'MENUNGGU_PERSETUJUAN'],
      REVISI: [],
      MENUNGGU_PERSETUJUAN: [],
      FINAL: [],
      DICABUT: [],
    },
    PIMPINAN: {
      DRAFT_WILAYAH: [],
      REVIEW_SUBSTANSI: [],
      REVIEW_HUKUM: [],
      REVISI: [],
      MENUNGGU_PERSETUJUAN: ['FINAL', 'REVISI'],
      FINAL: ['DICABUT'],
      DICABUT: [],
    },
    VIEWER: {
      DRAFT_WILAYAH: [],
      REVIEW_SUBSTANSI: [],
      REVIEW_HUKUM: [],
      REVISI: [],
      MENUNGGU_PERSETUJUAN: [],
      FINAL: [],
      DICABUT: [],
    },
  };

  return allowedTransitions[userRole]?.[currentStatus]?.includes(targetStatus) || false;
}
