"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Users, Plus, Trash2, Mail, Building2, Loader2, AlertCircle, CheckCircle2, ArrowRightLeft } from "lucide-react";
import * as authApi from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { useAuth } from "@/lib/store/auth-context";
import type { AccountResponse, AccountRole, MemberResponse } from "@/lib/api/types";

const ROLES: AccountRole[] = ["OWNER", "ADMIN", "DEVELOPER", "BILLING_VIEWER"];
const MANAGE_ROLES = new Set<AccountRole>(["OWNER", "ADMIN"]);

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.firstFieldError || err.detail || fallback;
  return fallback;
}

export default function TeamPage() {
  const { user, refreshSession } = useAuth();

  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [members, setMembers] = useState<MemberResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [newOrgName, setNewOrgName] = useState("");
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AccountRole>("DEVELOPER");
  const [isInviting, setIsInviting] = useState(false);

  const [invitationToken, setInvitationToken] = useState("");
  const [isAccepting, setIsAccepting] = useState(false);

  const [switchingAccountId, setSwitchingAccountId] = useState<string | null>(null);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const canManage = !!user?.role && MANAGE_ROLES.has(user.role);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const accountList = await authApi.listAccounts();
      setAccounts(accountList);
      if (user?.accountId) {
        const memberList = await authApi.listMembers(user.accountId);
        setMembers(memberList);
      }
    } catch (err) {
      setError(errorMessage(err, "Failed to load team data."));
    } finally {
      setIsLoading(false);
    }
  }, [user?.accountId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    setIsCreatingOrg(true);
    setError(null);
    try {
      await authApi.createAccount({ name: newOrgName.trim() });
      setNewOrgName("");
      setNotice("Organization created.");
      await loadData();
    } catch (err) {
      setError(errorMessage(err, "Failed to create organization."));
    } finally {
      setIsCreatingOrg(false);
    }
  };

  const handleSwitchAccount = async (accountId: string) => {
    setSwitchingAccountId(accountId);
    setError(null);
    try {
      await authApi.switchAccount({ account_id: accountId });
      await refreshSession();
      setNotice("Switched active organization.");
      await loadData();
    } catch (err) {
      setError(errorMessage(err, "Failed to switch organization."));
    } finally {
      setSwitchingAccountId(null);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !user?.accountId) return;
    setIsInviting(true);
    setError(null);
    try {
      await authApi.inviteMember(user.accountId, { email: inviteEmail.trim(), role: inviteRole });
      setNotice(`Invitation sent to ${inviteEmail.trim()}.`);
      setInviteEmail("");
    } catch (err) {
      setError(errorMessage(err, "Failed to send invitation."));
    } finally {
      setIsInviting(false);
    }
  };

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitationToken.trim()) return;
    setIsAccepting(true);
    setError(null);
    try {
      await authApi.acceptInvitation({ token: invitationToken.trim() });
      setInvitationToken("");
      setNotice("Invitation accepted.");
      await loadData();
    } catch (err) {
      setError(errorMessage(err, "Failed to accept invitation."));
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!user?.accountId) return;
    setRemovingUserId(userId);
    setError(null);
    try {
      await authApi.removeMember(user.accountId, userId);
      setNotice("Member removed.");
      await loadData();
    } catch (err) {
      setError(errorMessage(err, "Failed to remove member."));
    } finally {
      setRemovingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Users className="w-5 h-5" /> Team & Organizations
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage the organizations you belong to and who has access to {user?.company || "your account"}.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="p-3 rounded-md bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Organizations */}
        <div className="p-5 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Your Organizations
          </h2>

          <div className="space-y-2">
            {isLoading && accounts.length === 0 && (
              <p className="text-xs text-slate-400">Loading...</p>
            )}
            {accounts.map((acct) => {
              const isActive = acct.id === user?.accountId;
              return (
                <div
                  key={acct.id}
                  className={`flex items-center justify-between p-3 rounded-md border text-xs ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-600/10 border-blue-200 dark:border-blue-500/30"
                      : "bg-slate-50 dark:bg-[#11131A] border-slate-200 dark:border-[#232736]"
                  }`}
                >
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{acct.name}</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{acct.account_number}</p>
                  </div>
                  {isActive ? (
                    <span className="text-[10px] font-mono uppercase text-blue-600 dark:text-blue-400 font-semibold">Active</span>
                  ) : (
                    <button
                      onClick={() => handleSwitchAccount(acct.id)}
                      disabled={switchingAccountId === acct.id}
                      className="h-7 px-2.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-[#1E2230] dark:hover:bg-[#252B3D] border border-slate-200 dark:border-[#232736] text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {switchingAccountId === acct.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <ArrowRightLeft className="w-3 h-3" />
                      )}
                      <span>Switch</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <form onSubmit={handleCreateOrg} className="pt-3 border-t border-slate-200 dark:border-[#232736] flex gap-2">
            <input
              type="text"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              placeholder="New organization name"
              className="flex-1 h-9 px-3 rounded-md bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isCreatingOrg || !newOrgName.trim()}
              className="h-9 px-3.5 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create</span>
            </button>
          </form>

          <form onSubmit={handleAcceptInvitation} className="pt-3 border-t border-slate-200 dark:border-[#232736] flex gap-2">
            <input
              type="text"
              value={invitationToken}
              onChange={(e) => setInvitationToken(e.target.value)}
              placeholder="Paste invitation token"
              className="flex-1 h-9 px-3 rounded-md bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isAccepting || !invitationToken.trim()}
              className="h-9 px-3.5 rounded-md bg-slate-100 dark:bg-[#1E2230] hover:bg-slate-200 dark:hover:bg-[#252B3D] border border-slate-200 dark:border-[#232736] disabled:opacity-50 text-slate-700 dark:text-slate-300 text-xs font-semibold shrink-0 transition-colors cursor-pointer"
            >
              Accept
            </button>
          </form>
        </div>

        {/* Members */}
        <div className="p-5 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Mail className="w-4 h-4" /> Team Members
          </h2>

          <div className="space-y-2">
            {isLoading && members.length === 0 && <p className="text-xs text-slate-400">Loading...</p>}
            {!isLoading && members.length === 0 && (
              <p className="text-xs text-slate-400">No members found for the active organization.</p>
            )}
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 rounded-md bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] text-xs"
              >
                <div>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{m.user_id.slice(0, 8)}</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {m.role} • joined {new Date(m.joined_at).toLocaleDateString()}
                  </p>
                </div>
                {canManage && m.user_id !== user?.id && (
                  <button
                    onClick={() => handleRemoveMember(m.user_id)}
                    disabled={removingUserId === m.user_id}
                    className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 p-1.5 rounded transition-colors cursor-pointer disabled:opacity-50"
                    aria-label="Remove member"
                  >
                    {removingUserId === m.user_id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>

          {canManage && (
            <form onSubmit={handleInvite} className="pt-3 border-t border-slate-200 dark:border-[#232736] space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="teammate@company.com"
                  className="flex-1 h-9 px-3 rounded-md bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as AccountRole)}
                  className="h-9 px-2 rounded-md bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={isInviting || !inviteEmail.trim()}
                className="w-full h-9 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {isInviting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Send Invitation</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
