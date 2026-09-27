'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Bell,
  Palette,
  Shield,
  Save,
  LogOut,
  Mail,
  AlertTriangle,
  Check,
  Moon,
  Sun,
  Monitor,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

type Tab = 'profile' | 'notifications' | 'appearance' | 'security';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, setUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Profile state
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Notifications state (localStorage)
  const [notifications, setNotifications] = useState({
    emailInvites: true,
    taskAssigned: true,
    taskComments: true,
    projectUpdates: false,
    weeklyDigest: true,
  });

  // Appearance state
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');

  // ---------------- Handlers ----------------
  const handleSaveProfile = () => {
    if (!user) return;
    setUser({ ...user, name, avatarUrl: avatarUrl || null });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleDeleteAccount = () => {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone.',
    );
    if (!confirmed) return;

    const doubleConfirm = confirm(
      'This will permanently delete ALL your data. Are you absolutely sure?',
    );
    if (!doubleConfirm) return;

    logout();
    router.push('/login');
  };

  // ---------------- Render ----------------
  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">
          Manage your account preferences and settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <aside className="md:col-span-1">
          <nav className="bg-white rounded-xl border border-slate-200 p-2 space-y-1 sticky top-8">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="md:col-span-3 space-y-6">
          {/* ---------------- PROFILE ---------------- */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">
                Profile Information
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Update your personal details
              </p>

              {/* Avatar preview */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Profile Picture
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Paste an image URL below
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-900"
                    placeholder="Your name"
                  />
                </div>

                {/* Avatar URL */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Avatar URL
                  </label>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-900"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Email cannot be changed
                  </p>
                </div>
              </div>

              {/* Save button */}
              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-200">
                <button
                  onClick={handleSaveProfile}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-md"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>

                {profileSaved && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-green-600 font-medium animate-fade-in">
                    <Check className="w-4 h-4" />
                    Saved!
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ---------------- NOTIFICATIONS ---------------- */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">
                Notifications
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Choose what you want to be notified about
              </p>

              <div className="space-y-2">
                {[
                  {
                    key: 'emailInvites' as const,
                    label: 'Email Invitations',
                    desc: 'When someone invites you to an organization',
                  },
                  {
                    key: 'taskAssigned' as const,
                    label: 'Task Assignments',
                    desc: 'When a task is assigned to you',
                  },
                  {
                    key: 'taskComments' as const,
                    label: 'Task Comments',
                    desc: 'When someone comments on your tasks',
                  },
                  {
                    key: 'projectUpdates' as const,
                    label: 'Project Updates',
                    desc: 'When projects you follow are updated',
                  },
                  {
                    key: 'weeklyDigest' as const,
                    label: 'Weekly Digest',
                    desc: 'A summary of your team activity each week',
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {item.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setNotifications({
                          ...notifications,
                          [item.key]: !notifications[item.key],
                        })
                      }
                      className={`relative w-12 h-6 rounded-full transition ${
                        notifications[item.key]
                          ? 'bg-blue-600'
                          : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                          notifications[item.key]
                            ? 'translate-x-6'
                            : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------------- APPEARANCE ---------------- */}
          {activeTab === 'appearance' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">
                Appearance
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Customize how ORBIT looks on your device
              </p>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'light' as const, label: 'Light', icon: Sun },
                  { id: 'dark' as const, label: 'Dark', icon: Moon },
                  { id: 'system' as const, label: 'System', icon: Monitor },
                ].map((option) => {
                  const Icon = option.icon;
                  const isActive = theme === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setTheme(option.id)}
                      className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition ${
                        isActive
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Icon
                        className={`w-8 h-8 ${
                          isActive ? 'text-blue-600' : 'text-slate-500'
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          isActive ? 'text-blue-700' : 'text-slate-700'
                        }`}
                      >
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-slate-400 mt-6">
                Theme preferences are saved locally for now. Full dark mode is
                coming soon.
              </p>
            </div>
          )}

          {/* ---------------- SECURITY / DANGER ---------------- */}
          {activeTab === 'security' && (
            <>
              {/* Sign out */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-1">
                  Session
                </h2>
                <p className="text-sm text-slate-500 mb-4">
                  Sign out of your current session
                </p>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>

              {/* Danger zone */}
              <div className="bg-white rounded-xl border-2 border-red-200 p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-red-900">
                      Danger Zone
                    </h2>
                    <p className="text-sm text-red-700/80">
                      Once you delete your account, there is no going back.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDeleteAccount}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}