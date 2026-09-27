'use client';

import { User, Crown, Shield, Eye } from 'lucide-react';
import { OrganizationMember, Role } from '@/types';
import { formatRelativeTime } from '@/lib/utils';

interface MemberListProps {
  members: OrganizationMember[];
}

const roleConfig: Record<Role, { label: string; color: string; icon: any }> = {
  OWNER: {
    label: 'Owner',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: Crown,
  },
  ADMIN: {
    label: 'Admin',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Shield,
  },
  MEMBER: {
    label: 'Member',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: User,
  },
  VIEWER: {
    label: 'Viewer',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: Eye,
  },
};

export function MemberList({ members }: MemberListProps) {
  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        No members yet
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {members.map((member) => {
        const role = roleConfig[member.role];
        const RoleIcon = role.icon;

        return (
          <div
            key={member.id}
            className="flex items-center justify-between py-4"
          >
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                {member.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-slate-900">
                  {member.user.name}
                </p>
                <p className="text-sm text-slate-500">{member.user.email}</p>
              </div>
            </div>

            {/* Role + Joined */}
            <div className="flex items-center gap-4">
              <span className="hidden md:block text-xs text-slate-500">
                Joined {formatRelativeTime(member.joinedAt)}
              </span>
              <span
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${role.color}`}
              >
                <RoleIcon className="w-3 h-3" />
                {role.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}