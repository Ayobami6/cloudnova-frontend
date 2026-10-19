"use client";

import React, { useCallback, useEffect, useState } from "react";
import * as authApi from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { useAuth } from "@/lib/store/auth-context";
import type { AccountResponse, AccountRole, MemberResponse } from "@/lib/api/types";
import {
  MaterialIcon,
  PastelTypePill,
  StatusIndicator,
} from "@/components/ui/material-icon";
import { PastelKpiCard } from "@/components/ui/bento-primitives";

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
      await authApi.inviteMember(user.accountId, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
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
    <div className="space-y-5">
      {/* Top 3 Pastel KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PastelKpiCard
          label="Organizations"
          value={accounts.length || 1}
          subtitle="Multi-tenant isolation"
          variant="lavender"
          actionLabel="Refresh"
          onAction={loadData}
        />
        <PastelKpiCard
          label="Team Members"
          value={members.length || 1}
          subtitle="RBAC enforced"
          variant="blue"
          actionLabel="Check"
          onAction={loadData}
        />
        <PastelKpiCard
          label="Active Role"
          value={user?.role || "OWNER"}
          subtitle={user?.company || "Primary Tenant"}
          variant="yellow"
          actionLabel="Active"
          onAction={loadData}
        />
      </div>

      {error && (
        <div className="nixtio-card p-4 text-xs text-[#D94E4E] flex items-center gap-2">
          <MaterialIcon name="error" size={18} />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="nixtio-card p-4 text-xs text-[#4EA871] flex items-center gap-2">
          <MaterialIcon name="check_circle" size={18} />
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Organizations Card */}
        <div className="nixtio-card p-6 space-y-4">
          <h2 className="text-base font-semibold text-[#1E1E1E] dark:text-white flex items-center gap-2">
            <MaterialIcon name="apartment" size={18} />
            <span>Your Organizations</span>
          </h2>

          <div className="space-y-2.5">
            {isLoading && accounts.length === 0 && (
              <p className="text-xs text-[#8C8B87]">Loading organizations...</p>
            )}
            {accounts.map((acct) => {
              const isActive = acct.id === user?.accountId;
              return (
                <div
                  key={acct.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl text-xs ${
                    isActive
                      ? "bg-[#E6D8EA]/60 dark:bg-[#E6D8EA]/15"
                      : "bg-[#F6F6F4] dark:bg-[#161920]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <PastelTypePill
                      icon="domain"
                      label={acct.account_number}
                      variant={isActive ? "lavender" : "blue"}
                      size="sm"
                    />
                    <span className="font-semibold text-[#1E1E1E] dark:text-white">
                      {acct.name}
                    </span>
                  </div>
                  {isActive ? (
                    <StatusIndicator status="completed" label="Active" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSwitchAccount(acct.id)}
                      disabled={switchingAccountId === acct.id}
                      className="h-8 px-3.5 rounded-full bg-white dark:bg-[#232834] text-xs font-medium text-[#1E1E1E] dark:text-white shadow-2xs hover:bg-[#222222] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Switch
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <form
            onSubmit={handleCreateOrg}
            className="pt-3 border-t border-[#E7E4DF] dark:border-[#282D3A] flex gap-2"
          >
            <input
              type="text"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              placeholder="New organization name"
              className="flex-1 h-10 px-4 rounded-full bg-[#F6F6F4] dark:bg-[#161920] text-xs text-[#1E1E1E] dark:text-white placeholder-[#8C8B87] focus:outline-none"
            />
            <button
              type="submit"
              disabled={isCreatingOrg || !newOrgName.trim()}
              className="h-10 px-5 rounded-full bg-[#222222] text-white dark:bg-white dark:text-[#1E1E1E] text-xs font-medium disabled:opacity-50 cursor-pointer"
            >
              Create
            </button>
          </form>

          <form
            onSubmit={handleAcceptInvitation}
            className="pt-3 border-t border-[#E7E4DF] dark:border-[#282D3A] flex gap-2"
          >
            <input
              type="text"
              value={invitationToken}
              onChange={(e) => setInvitationToken(e.target.value)}
              placeholder="Paste invitation token"
              className="flex-1 h-10 px-4 rounded-full bg-[#F6F6F4] dark:bg-[#161920] text-xs text-[#1E1E1E] dark:text-white placeholder-[#8C8B87] focus:outline-none"
            />
            <button
              type="submit"
              disabled={isAccepting || !invitationToken.trim()}
              className="h-10 px-5 rounded-full bg-[#CFE0EC] text-[#1E1E1E] text-xs font-medium disabled:opacity-50 cursor-pointer"
            >
              Accept
            </button>
          </form>
        </div>

        {/* Members Card */}
        <div className="nixtio-card p-6 space-y-4">
          <h2 className="text-base font-semibold text-[#1E1E1E] dark:text-white flex items-center gap-2">
            <MaterialIcon name="group" size={18} />
            <span>Team Members</span>
          </h2>

          <div className="space-y-2.5">
            {!isLoading && members.length === 0 && (
              <p className="text-xs text-[#8C8B87]">
                No members found for the active organization.
              </p>
            )}
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F6F6F4] dark:bg-[#161920] text-xs"
              >
                <div className="flex items-center gap-3">
                  <PastelTypePill
                    icon="person"
                    label={m.role}
                    variant={m.role === "OWNER" ? "yellow" : "blue"}
                    size="sm"
                  />
                  <div>
                    <span className="font-mono font-semibold text-[#1E1E1E] dark:text-white">
                      {m.user_id.slice(0, 8)}
                    </span>
                    <p className="text-[11px] text-[#8C8B87]">
                      Joined {new Date(m.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {canManage && m.user_id !== user?.id && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(m.user_id)}
                    disabled={removingUserId === m.user_id}
                    className="w-8 h-8 rounded-full bg-[#FADBD8]/60 text-[#D94E4E] flex items-center justify-center cursor-pointer disabled:opacity-50"
                    aria-label="Remove member"
                  >
                    <MaterialIcon name="delete" size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {canManage && (
            <form
              onSubmit={handleInvite}
              className="pt-3 border-t border-[#E7E4DF] dark:border-[#282D3A] space-y-2.5"
            >
              <div className="flex gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="teammate@company.com"
                  className="flex-1 h-10 px-4 rounded-full bg-[#F6F6F4] dark:bg-[#161920] text-xs text-[#1E1E1E] dark:text-white placeholder-[#8C8B87] focus:outline-none"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as AccountRole)}
                  className="h-10 px-4 rounded-full bg-[#F6F6F4] dark:bg-[#161920] text-xs font-medium text-[#1E1E1E] dark:text-white focus:outline-none"
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
                className="w-full h-10 rounded-full bg-[#222222] text-white dark:bg-white dark:text-[#1E1E1E] text-xs font-medium flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <MaterialIcon name="send" size={15} />
                <span>Send Invitation</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
