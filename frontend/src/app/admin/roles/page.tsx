'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { Role, Permission } from '@/lib/types';
import { useAdminAuth } from '@/context/admin-auth-context';
import { Shield, Plus, Check, X, Lock, RefreshCw, Trash2, AlertCircle, Save } from 'lucide-react';

export default function AdminRolesMatrixPage() {
  const { hasPermission } = useAdminAuth();

  const [roles, setRoles] = useState<Role[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<Record<string, Permission[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // New Role Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Inline changes state: maps roleId -> Set of permission IDs
  const [rolePermissionsMap, setRolePermissionsMap] = useState<Record<number, number[]>>({});
  const [hasChanges, setHasChanges] = useState<Record<number, boolean>>({});
  const [savingRoleId, setSavingRoleId] = useState<number | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const [rolesRes, permsRes] = await Promise.all([
      fetchApi<Role[]>('/admin/roles', { authType: 'admin' }),
      fetchApi<Record<string, Permission[]>>('/admin/permissions', { authType: 'admin' }),
    ]);

    if (rolesRes.success && rolesRes.data) {
      setRoles(rolesRes.data);
      const initialMap: Record<number, number[]> = {};
      rolesRes.data.forEach((r) => {
        initialMap[r.id] = r.permissions?.map((p) => p.id) || [];
      });
      setRolePermissionsMap(initialMap);
    }

    if (permsRes.success && permsRes.data) {
      setPermissionGroups(permsRes.data);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePermission = (roleId: number, permId: number, isSystem: boolean) => {
    if (isSystem) return; // Super admin permissions cannot be toggled

    setRolePermissionsMap((prev) => {
      const currentList = prev[roleId] || [];
      const updatedList = currentList.includes(permId)
        ? currentList.filter((id) => id !== permId)
        : [...currentList, permId];

      setHasChanges((h) => ({ ...h, [roleId]: true }));

      return {
        ...prev,
        [roleId]: updatedList,
      };
    });
  };

  const saveRolePermissions = async (role: Role) => {
    setSavingRoleId(role.id);
    const newPermIds = rolePermissionsMap[role.id] || [];

    const res = await fetchApi(`/admin/roles/${role.id}`, {
      method: 'PUT',
      authType: 'admin',
      body: JSON.stringify({
        name: role.name,
        description: role.description,
        permission_ids: newPermIds,
      }),
    });

    setSavingRoleId(null);

    if (res.success) {
      setHasChanges((h) => ({ ...h, [role.id]: false }));
      loadData();
    } else {
      alert(res.message || 'Failed to update permissions.');
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await fetchApi('/admin/roles', {
      method: 'POST',
      authType: 'admin',
      body: JSON.stringify({
        name: newRoleName,
        description: newRoleDesc,
        permission_ids: selectedPermissions,
      }),
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsModalOpen(false);
      setNewRoleName('');
      setNewRoleDesc('');
      setSelectedPermissions([]);
      loadData();
    } else {
      setErrorMessage(res.message || 'Failed to create role.');
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!confirm('Are you sure you want to delete this custom role?')) return;
    const res = await fetchApi(`/admin/roles/${roleId}`, {
      method: 'DELETE',
      authType: 'admin',
    });
    if (res.success) {
      loadData();
    } else {
      alert(res.message || 'Failed to delete role.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Role-Based Access Control (RBAC) Matrix
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Granular permission matrix across administrative roles. Super Admin possesses all privileges and is system-protected.
          </p>
        </div>

        {hasPermission('roles.manage') && (
          <button
            onClick={() => {
              setNewRoleName('');
              setNewRoleDesc('');
              setSelectedPermissions([]);
              setErrorMessage(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            Create Custom Role
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
          Loading RBAC matrix...
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  <th className="py-4 px-4 font-bold text-slate-900 dark:text-white min-w-[220px]">
                    Granular Permissions
                  </th>
                  {roles.map((role) => (
                    <th key={role.id} className="py-4 px-3 text-center min-w-[140px]">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1 font-extrabold text-slate-900 dark:text-white text-xs">
                          {role.name}
                          {role.is_system && (
                            <span title="System Locked Role">
                              <Lock className="w-3 h-3 text-amber-500" />
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {role.users_count || 0} user(s)
                        </span>
                        {/* Save Changes button for this role */}
                        {hasChanges[role.id] && (
                          <button
                            onClick={() => saveRolePermissions(role)}
                            disabled={savingRoleId === role.id}
                            className="mt-1 flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white rounded-md text-[10px] font-bold shadow-xs hover:bg-emerald-700 animate-pulse"
                          >
                            <Save className="w-3 h-3" />
                            {savingRoleId === role.id ? 'Saving...' : 'Save Matrix'}
                          </button>
                        )}
                        {/* Custom role delete button */}
                        {!role.is_system && hasPermission('roles.manage') && (
                          <button
                            onClick={() => handleDeleteRole(role.id)}
                            className="text-[10px] text-rose-500 hover:text-rose-700 mt-0.5"
                          >
                            Delete Role
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {Object.entries(permissionGroups).map(([groupName, perms]) => (
                  <React.Fragment key={groupName}>
                    {/* Group Header Row */}
                    <tr className="bg-slate-100/70 dark:bg-slate-800/40">
                      <td
                        colSpan={roles.length + 1}
                        className="py-2.5 px-4 font-black text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider"
                      >
                        {groupName} Domain
                      </td>
                    </tr>

                    {/* Permissions Rows in this group */}
                    {perms.map((perm) => (
                      <tr
                        key={perm.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 dark:text-white block">{perm.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">{perm.slug}</span>
                        </td>

                        {/* Checkbox columns for each role */}
                        {roles.map((role) => {
                          const isAssigned =
                            role.is_system ||
                            (rolePermissionsMap[role.id] || []).includes(perm.id);

                          return (
                            <td key={role.id} className="py-3 px-3 text-center">
                              {role.is_system ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </span>
                              ) : (
                                <input
                                  type="checkbox"
                                  disabled={!hasPermission('roles.manage')}
                                  checked={isAssigned}
                                  onChange={() => handleTogglePermission(role.id, perm.id, role.is_system)}
                                  className="w-4 h-4 rounded-sm text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                                />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= CREATE CUSTOM ROLE MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Create Custom Role</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Role Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marketing Lead"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Can manage promotions and product catalog"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Select Initial Permissions:
                </label>
                <div className="max-h-56 overflow-y-auto space-y-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  {Object.entries(permissionGroups).map(([group, perms]) => (
                    <div key={group} className="space-y-1.5">
                      <span className="font-bold text-[11px] text-blue-600 uppercase block">{group}</span>
                      <div className="grid grid-cols-2 gap-1.5 pl-2">
                        {perms.map((p) => {
                          const checked = selectedPermissions.includes(p.id);
                          return (
                            <label key={p.id} className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  setSelectedPermissions((prev) =>
                                    checked ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                                  );
                                }}
                                className="rounded-sm"
                              />
                              <span className="text-[11px] text-slate-700 dark:text-slate-300">{p.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold"
                >
                  {isSubmitting ? 'Creating...' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

