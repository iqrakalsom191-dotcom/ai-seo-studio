'use client';

import { useState, useEffect } from 'react';
import { User, Lock, Trash2, Save, CheckCircle, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';

function Toast({ message, type }) {
  if (!message) return null;
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${type === 'success' ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30' : 'bg-[#ef4444]/10 text-[#f87171] border border-[#ef4444]/30'}`}>
      {type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [inlineToast, setInlineToast] = useState({ message: '', type: '' });

  const showToast = (message, type) => {
    setInlineToast({ message, type });
    setTimeout(() => setInlineToast({ message: '', type: '' }), 3500);
  };

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setEmail(user.email || '');
        setName(user.user_metadata?.full_name || '');
      }
    };
    load();
  }, []);

  const updateProfile = async () => {
    setProfileLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name },
      });
      if (error) throw error;
      showToast('Profile updated successfully.', 'success');
      toast.success('Profile updated successfully.');
    } catch (e) {
      showToast(e.message || 'Profile update failed.', 'error');
      toast.error(e.message || 'Profile update failed.');
    } finally {
      setProfileLoading(false);
    }
  };

  const updatePassword = async () => {
    if (!newPassword || !confirmPassword) return showToast('Please fill all password fields.', 'error');
    if (newPassword !== confirmPassword) return showToast('Passwords do not match.', 'error');
    if (newPassword.length < 6) return showToast('Password must be at least 6 characters.', 'error');
    setPasswordLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated successfully.', 'success');
      toast.success('Password updated successfully.');
    } catch (e) {
      showToast(e.message || 'Password update failed.', 'error');
      toast.error(e.message || 'Password update failed.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const deleteAccount = async () => {
    const confirmed = window.confirm('Are you sure? This action cannot be undone. Your account and all data will be permanently deleted.');
    if (!confirmed) return;
    setDeleteLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc('delete_user');
      if (error) throw error;
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch (e) {
      showToast('Account deletion failed. Contact support.', 'error');
      toast.error('Account deletion failed. Contact support.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto" style={{ background: '#09090B' }}>
      <Toast message={inlineToast.message} type={inlineToast.type} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#FAFAFA' }}>Settings</h1>
        <p className="text-[#999]">Manage your account preferences.</p>
      </div>

      {/* Profile */}
      <div className="bg-[#111] rounded-2xl border border-[#1f1f1f] shadow-sm p-6 mb-5">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-5 h-5" style={{ color: '#FF6B35' }} />
          <h2 className="text-base font-semibold text-white">Profile</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#999] mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full border border-[#1f1f1f] bg-[#1a1a1a] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#999] mb-1">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full border border-[#1f1f1f] rounded-xl px-4 py-3 text-sm bg-[#1a1a1a] text-[#666] cursor-not-allowed"
            />
            <p className="text-xs text-[#666] mt-1">Email cannot be changed.</p>
          </div>
          <button
            onClick={updateProfile}
            disabled={profileLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-50"
            style={{ backgroundColor: '#FF6B35' }}
          >
            <Save className="w-4 h-4" />
            {profileLoading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="bg-[#111] rounded-2xl border border-[#1f1f1f] shadow-sm p-6 mb-5">
        <div className="flex items-center gap-2 mb-5">
          <Lock className="w-5 h-5" style={{ color: '#FF6B35' }} />
          <h2 className="text-base font-semibold text-white">Change Password</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#999] mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-[#1f1f1f] bg-[#1a1a1a] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#999] mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-[#1f1f1f] bg-[#1a1a1a] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#999] mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-[#1f1f1f] bg-[#1a1a1a] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
            />
          </div>
          <button
            onClick={updatePassword}
            disabled={passwordLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-50"
            style={{ backgroundColor: '#FF6B35' }}
          >
            <Lock className="w-4 h-4" />
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-[#111] rounded-2xl border border-[#ef4444]/20 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-2">
          <Trash2 className="w-5 h-5 text-[#f87171]" />
          <h2 className="text-base font-semibold text-[#f87171]">Danger Zone</h2>
        </div>
        <p className="text-sm text-[#999] mb-5">Permanently delete your account and all associated data. This cannot be undone.</p>
        <button
          onClick={deleteAccount}
          disabled={deleteLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold bg-[#ef4444] hover:bg-[#dc2626] transition disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          {deleteLoading ? 'Deleting...' : 'Delete My Account'}
        </button>
      </div>
    </div>
  );
}
