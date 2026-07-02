"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type UserRole = "cdmu_staff" | "external";

interface RolePermissions {
  canEditNotes: boolean;
  canEditProjects: boolean;
  canEditPartners: boolean;
  canViewFinancials: boolean;
  canExportPDF: boolean;
  canAccessAdmin: boolean;
  canEditKPIs: boolean;
  canEditTimeline: boolean;
  label: string;
  description: string;
}

const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  cdmu_staff: {
    canEditNotes: true,
    canEditProjects: true,
    canEditPartners: true,
    canViewFinancials: true,
    canExportPDF: true,
    canAccessAdmin: true,
    canEditKPIs: true,
    canEditTimeline: true,
    label: "CDMU Staff",
    description: "Full access — edit projects, KPIs, notes, partners, and admin",
  },
  external: {
    canEditNotes: false,
    canEditProjects: false,
    canEditPartners: false,
    canViewFinancials: true,
    canExportPDF: true,
    canAccessAdmin: false,
    canEditKPIs: false,
    canEditTimeline: false,
    label: "External User",
    description: "View-only access — browse data, export reports",
  },
};

interface RoleContextValue {
  role: UserRole;
  setRole: (role: UserRole) => void;
  permissions: RolePermissions;
}

const RoleContext = createContext<RoleContextValue>({
  role: "external",
  setRole: () => {},
  permissions: ROLE_PERMISSIONS.external,
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("cdmu_staff");

  return (
    <RoleContext.Provider value={{ role, setRole, permissions: ROLE_PERMISSIONS[role] }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
