'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Search, Copy, Trash2, BookOpen, FileText, Tag, Check, X, Save } from 'lucide-react';

const TYPE_LABELS = {
  blog:    { label: 'Blog',    color: 'bg-purple-100 text-purple-700' },
  meta:    { label: 'Meta',    color: 'bg-teal-100 text-teal-700'    },
  keyword: { label: 'Keyword', color: 'bg-yellow-100 text-yellow-700'},
};

const TYPE_ICONS = {
  blog: FileText,
  meta: Tag,
  keyword: Search,
};

const typeBadge = {
  blog:    { bg: 'rgba(108,71,255,0.12)', color: '#6C47FF' },
  meta:    { bg: 'rgba(0,198,174,0.12)',  color: '#00957f' },
  keyword: { bg: 'rgba(245,158,11,0.12)', color: '#b45309' },
};

export default function LibraryPage() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [copied, setCopied] = useState(null);
  const [modal, setModal] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const supabase = createClient();

  useEffect(() => { fetchContent(); }, []);

  useEffect(() => {
    let result = items;
    if (activeFilter !== 'all') result = result.filter((i) => i.type === activeFilter);
    if (search.trim()) result = result.filter((i) => i.title?.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [search, activeFilter, items]);

  async function fetchContent() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('saved_content')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error) setItems(data || []);
    setLoading(false);
  }

  async function handleDelete(id) {
    await supabase.from('saved_content').delete().eq('id', id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleCopy(item) {
    await navigator.clipboard.writeText(item.content || '');
    setCopied(item.id);
    setTimeout(() => setCopied(null), 2000);
  }

  function openModal(item) {
    setModal(item);
    setEditContent(item.content || '');
    setSaveSuccess(false);
  }

  function closeModal() {
    setModal(null);
    setEditContent('');
    setSaveSuccess(false);
  }

  async function handleSaveChanges() {
    if (!modal) return;
    setSaving(true);
    const { error } = await supabase
      .from('saved_content')
      .update({ content: editContent })
      .eq('id', modal.id);
    if (!error) {
      setItems(prev => prev.map(i => i.id === modal.id ? { ...i, content: editContent } : i));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
    setSaving(false);
  }

  const filters = ['all', 'blog', 'meta', 'keyword'];

  return (
    <div className="p-8 max-w-6xl mx-auto">

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={closeModal}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', maxWidth: '660px', width: '100%', maxHeight: '82vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(108,71,255,0.15)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', flexShrink: 0, background: typeBadge[modal.type]?.bg || '#f3f4f6', color: typeBadge[modal.type]?.color || '#6b7280' }}>
                  {TYPE_LABELS[modal.type]?.label || modal.type}
                </span>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1A1A2E', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {modal.title}
                </h3>
              </div>
              <button onClick={closeModal} style={{ background: '#f3f4f6', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: '12px' }}>
                <X size={16} color="#6b7280" />
              </button>
            </div>

            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              style={{ width: '100%', minHeight: '320px', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', fontSize: '13px', lineHeight: '1.7', color: '#1A1A2E', resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#6C47FF'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button onClick={closeModal}
                style={{ padding: '10px 20px', borderRadius: '10px', background: '#f3f4f6', color: '#4A4A6A', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>
                Close
              </button>
              <button onClick={handleSaveChanges} disabled={saving}
                style={{ padding: '10px 24px', borderRadius: '10px', background: saveSuccess ? '#10b981' : '#6C47FF', color: '#fff', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s', opacity: saving ? 0.7 : 1 }}>
                {saveSuccess ? <><Check size={15} /> Saved</> : saving ? 'Saving...' : <><Save size={15} /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Library</h1>
        <p className="text-gray-500">All your saved content in one place.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6C47FF] focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {filters.map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-all"
              style={activeFilter === f ? { backgroundColor: '#6C47FF', color: '#fff' } : { backgroundColor: '#F0EEFF', color: '#6C47FF' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-48" />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: '#F0EEFF' }}>
            <BookOpen className="w-8 h-8" style={{ color: '#6C47FF' }} />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Nothing saved yet</h3>
          <p className="text-sm text-gray-400">Generate content and save it to see it here.</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const badge = TYPE_LABELS[item.type] || { label: item.type, color: 'bg-gray-100 text-gray-600' };
            const Icon = TYPE_ICONS[item.type] || FileText;
            const date = new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const preview = item.content?.slice(0, 120) + (item.content?.length > 120 ? '...' : '');

            return (
              <div key={item.id}
                onClick={() => openModal(item)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-all cursor-pointer"
                style={{ transition: 'box-shadow 0.2s, border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#6C47FF'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgb(243 244 246)'}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: '#6C47FF' }} />
                    <h3 className="text-sm font-semibold text-gray-800 truncate">{item.title || item.keyword || 'Untitled'}</h3>
                  </div>
                  <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed flex-1">{preview}</p>

                <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                  <span className="text-xs text-gray-400">{date}</span>
                  <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    <button onClick={() => handleCopy(item)}
                      className="p-1.5 rounded-lg transition-colors hover:bg-gray-50" title="Copy">
                      {copied === item.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                    <button onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg transition-colors hover:bg-red-50" title="Delete">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
