'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Search, Copy, Trash2, BookOpen, FileText, Tag, Check, X, Save, Download, CheckSquare, Square, FileDown, Globe, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import JSZip from 'jszip';

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

function parseMarkdownLines(content) {
  return (content || '').split('\n').map((raw) => {
    const line = raw.trim();
    if (!line) return { type: 'blank', text: '' };
    if (line.startsWith('###')) return { type: 'h3', text: line.replace(/^#{3}\s*/, '') };
    if (line.startsWith('##')) return { type: 'h2', text: line.replace(/^#{2}\s*/, '') };
    if (line.startsWith('---')) return { type: 'hr', text: '' };
    if (line.startsWith('* ')) return { type: 'bullet', text: line.replace(/^\*\s*/, '') };
    if (line.startsWith('**') && line.endsWith('**') && line.length > 3) {
      return { type: 'bold', text: line.replace(/^\*\*|\*\*$/g, '') };
    }
    return { type: 'paragraph', text: line };
  });
}

function MarkdownPreview({ content }) {
  const lines = parseMarkdownLines(content);
  return (
    <div>
      {lines.map((line, idx) => {
        switch (line.type) {
          case 'h3':
            return <h3 key={idx} style={{ color: '#6C47FF', fontSize: '18px', fontWeight: 700, margin: '16px 0 8px' }}>{line.text}</h3>;
          case 'h2':
            return <h2 key={idx} style={{ color: '#6C47FF', fontSize: '22px', fontWeight: 700, margin: '16px 0 8px' }}>{line.text}</h2>;
          case 'bold':
            return <p key={idx} style={{ color: '#0F0F0F', fontWeight: 700, margin: '4px 0' }}>{line.text}</p>;
          case 'bullet':
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', margin: '4px 0', color: '#333', lineHeight: 1.7 }}>
                <span style={{ color: '#00C6AE', marginTop: '2px' }}>●</span>
                <span>{line.text}</span>
              </div>
            );
          case 'hr':
            return <hr key={idx} style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '12px 0' }} />;
          case 'blank':
            return <div key={idx} style={{ height: '8px' }} />;
          default:
            return <p key={idx} style={{ color: '#333', lineHeight: 1.7, margin: '4px 0' }}>{line.text}</p>;
        }
      })}
    </div>
  );
}

export default function LibraryPage() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [copied, setCopied] = useState(null);
  const [modal, setModal] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [publishingId, setPublishingId] = useState(null);
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
    else toast.error('Failed to load library');
    setLoading(false);
  }

  async function handleDelete(id) {
    try {
      const { error } = await supabase.from('saved_content').delete().eq('id', id);
      if (error) throw error;
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success('Deleted');
    } catch (e) {
      toast.error('Delete failed');
    }
  }

  async function handleCopy(item) {
    await navigator.clipboard.writeText(item.content || '');
    setCopied(item.id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(null), 2000);
  }

  function openModal(item) {
    setModal(item);
    setEditContent(item.content || '');
    setSaveSuccess(false);
    setIsEditing(false);
  }

  function closeModal() {
    setModal(null);
    setEditContent('');
    setSaveSuccess(false);
    setIsEditing(false);
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
      setIsEditing(false);
      toast.success('Saved!');
      setTimeout(() => setSaveSuccess(false), 2000);
    } else {
      toast.error('Save failed');
    }
    setSaving(false);
  }

  function toggleSelectMode() {
    setSelectMode((prev) => !prev);
    setSelectedIds(new Set());
  }

  function toggleSelectItem(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSelectAll() {
    setSelectedIds((prev) =>
      prev.size === filtered.length ? new Set() : new Set(filtered.map((i) => i.id))
    );
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function safeFilename(name) {
    return (name || 'Untitled').replace(/[\\/:*?"<>|]/g, '-').trim() || 'Untitled';
  }

  function exportPDFWithText(item, doc) {
    const title = item.title || item.keyword || 'Untitled';
    const margin = 20;
    const maxWidth = doc.internal.pageSize.getWidth() - margin * 2; // 170mm on A4
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFont('helvetica');
    let y = 20;

    const ensureSpace = (needed) => {
      if (y + needed > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    doc.setTextColor('#6C47FF');
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(title, maxWidth);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 8 + 6;

    parseMarkdownLines(item.content).forEach((line) => {
      if (line.type === 'blank') { y += 4; return; }
      if (line.type === 'hr') {
        ensureSpace(6);
        doc.setDrawColor('#e0e0e0');
        doc.line(margin, y, margin + maxWidth, y);
        y += 8;
        return;
      }
      let text = line.text;
      let fontSize = 11;
      let color = '#333333';
      let fontStyle = 'normal';
      let indent = margin;
      if (line.type === 'h3') { fontSize = 14; color = '#6C47FF'; fontStyle = 'bold'; }
      else if (line.type === 'h2') { fontSize = 16; color = '#6C47FF'; fontStyle = 'bold'; }
      else if (line.type === 'bold') { fontSize = 11; color = '#0F0F0F'; fontStyle = 'bold'; }
      else if (line.type === 'bullet') { text = `•  ${text}`; indent = margin + 4; }

      doc.setFontSize(fontSize);
      doc.setTextColor(color);
      doc.setFont('helvetica', fontStyle);
      const wrapWidth = maxWidth - (indent - margin);
      const wrapped = doc.splitTextToSize(text, wrapWidth);
      ensureSpace(wrapped.length * (fontSize * 0.5) + 4);
      doc.text(wrapped, indent, y);
      y += wrapped.length * (fontSize * 0.5) + 4;
    });

    doc.save(`${safeFilename(title)}.pdf`);
    toast.success('Downloaded!');
  }

  function handleExportPDF(item) {
    const title = item.title || item.keyword || 'Untitled';
    try {
      const doc = new jsPDF();

      if (typeof doc.html !== 'function') {
        exportPDFWithText(item, doc);
        return;
      }

      const container = document.createElement('div');
      container.style.width = '650px';
      container.style.padding = '0';
      container.style.fontFamily = 'Helvetica, Arial, sans-serif';
      container.innerHTML = `
        <h1 style="color:#6C47FF;font-size:24px;font-weight:700;margin:0 0 16px;">${title}</h1>
        ${markdownLinesToHtml(item.content)}
      `;
      document.body.appendChild(container);

      doc.html(container, {
        x: 10,
        y: 10,
        width: 180,
        windowWidth: 650,
        callback: (pdf) => {
          document.body.removeChild(container);
          pdf.save(`${safeFilename(title)}.pdf`);
          toast.success('Downloaded!');
        },
      });
    } catch (e) {
      try {
        exportPDFWithText(item, new jsPDF());
      } catch (e2) {
        toast.error('Export failed');
      }
    }
  }

  function markdownLinesToHtml(content) {
    return parseMarkdownLines(content).map((line) => {
      switch (line.type) {
        case 'h3':
          return `<h3 style="color:#6C47FF;font-size:18px;font-weight:700;margin:16px 0 8px;">${line.text}</h3>`;
        case 'h2':
          return `<h2 style="color:#6C47FF;font-size:22px;font-weight:700;margin:16px 0 8px;">${line.text}</h2>`;
        case 'bold':
          return `<p style="color:#0F0F0F;font-weight:700;margin:4px 0;">${line.text}</p>`;
        case 'bullet':
          return `<p style="margin:4px 0;color:#333;line-height:1.7;"><span style="color:#00C6AE;">&#9679;</span>&nbsp; ${line.text}</p>`;
        case 'hr':
          return `<hr style="border:none;border-top:1px solid #e0e0e0;margin:12px 0;" />`;
        case 'blank':
          return `<div style="height:8px;"></div>`;
        default:
          return `<p style="color:#333;line-height:1.7;margin:4px 0;">${line.text}</p>`;
      }
    }).join('\n');
  }

  function handleExportWord(item) {
    try {
      const title = item.title || item.keyword || 'Untitled';
      const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8"><title>${title}</title></head>
        <body>
          <h1 style="color:#6C47FF;">${title}</h1>
          ${markdownLinesToHtml(item.content)}
        </body>
        </html>`;
      const blob = new Blob(['﻿', html], { type: 'application/msword' });
      downloadBlob(blob, `${safeFilename(title)}.doc`);
      toast.success('Downloaded!');
    } catch (e) {
      toast.error('Export failed');
    }
  }

  async function handleExportSelected() {
    try {
      const selectedItems = items.filter((i) => selectedIds.has(i.id));
      const zip = new JSZip();
      const usedNames = new Set();
      selectedItems.forEach((item) => {
        const date = new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const text = `Title: ${item.title || item.keyword || 'Untitled'}\nType: ${TYPE_LABELS[item.type]?.label || item.type}\nDate: ${date}\n\n${item.content || ''}`;
        let name = `${safeFilename(item.title || item.keyword || 'Untitled')}.txt`;
        let i = 1;
        while (usedNames.has(name)) {
          name = `${safeFilename(item.title || item.keyword || 'Untitled')}-${i}.txt`;
          i++;
        }
        usedNames.add(name);
        zip.file(name, text);
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(blob, `content-export-${new Date().toISOString().slice(0, 10)}.zip`);
      toast.success('Downloaded!');
    } catch (e) {
      toast.error('Export failed');
    }
  }

  async function handlePublishToWordPress(item) {
    setPublishingId(item.id);
    try {
      const res = await fetch('/api/wordpress/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: item.title || item.keyword || 'Untitled',
          content: item.content || '',
          status: 'draft',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Publish failed');
      }
      toast.success(
        (t) => (
          <div className="text-sm">
            <p className="font-semibold mb-1">Published to WordPress!</p>
            <div className="flex gap-3">
              {data.postUrl && (
                <a href={data.postUrl} target="_blank" rel="noopener noreferrer" className="text-[#6C47FF] underline">
                  View Post
                </a>
              )}
              {data.editUrl && (
                <a href={data.editUrl} target="_blank" rel="noopener noreferrer" className="text-[#6C47FF] underline">
                  Edit in WP Admin
                </a>
              )}
            </div>
          </div>
        ),
        { duration: 8000 }
      );
    } catch (e) {
      toast.error(e.message || 'Failed to publish to WordPress');
    } finally {
      setPublishingId(null);
    }
  }

  const filters = ['all', 'blog', 'meta', 'keyword'];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <style jsx>{`
        .export-pdf-btn, .export-word-btn {
          flex: 1; display: flex; align-items: center; justify-content: center;
          gap: 6px; padding: 6px 12px; border-radius: 6px; font-size: 13px;
          font-weight: 500; background: transparent; cursor: pointer;
          transition: all 150ms ease;
        }
        .export-pdf-btn { border: 1px solid #e74c3c; color: #e74c3c; }
        .export-pdf-btn:hover { background: #e74c3c; color: #fff; }
        .export-word-btn { border: 1px solid #2980b9; color: #2980b9; }
        .export-word-btn:hover { background: #2980b9; color: #fff; }
      `}</style>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={closeModal}>
          <div style={{ background: '#fff', borderRadius: '20px', maxWidth: '660px', width: '100%', height: '90vh', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 64px rgba(108,71,255,0.15)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 10, padding: '16px 24px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', flexShrink: 0, background: typeBadge[modal.type]?.bg || 'var(--subtle-bg)', color: typeBadge[modal.type]?.color || '#6b7280' }}>
                  {TYPE_LABELS[modal.type]?.label || modal.type}
                </span>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {modal.title}
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <button onClick={() => setIsEditing(prev => !prev)}
                  style={{ background: isEditing ? '#6C47FF' : 'var(--subtle-bg)', color: isEditing ? '#fff' : 'var(--text-secondary)', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', marginLeft: '12px' }}>
                  {isEditing ? 'Preview' : 'Edit'}
                </button>
                <button onClick={closeModal} style={{ background: 'var(--subtle-bg)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '8px' }}>
                  <X size={16} color="#6b7280" />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  style={{ width: '100%', height: '100%', minHeight: '320px', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', fontSize: '13px', lineHeight: '1.7', color: 'var(--text-primary)', resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#6C47FF'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                />
              ) : (
                <div style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '8px', boxSizing: 'border-box' }}>
                  <MarkdownPreview content={editContent} />
                </div>
              )}
            </div>

            <div style={{ position: 'sticky', bottom: 0, background: '#fff', zIndex: 10, padding: '16px 24px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '10px', flexShrink: 0 }}>
              <button onClick={closeModal}
                style={{ padding: '10px 20px', borderRadius: '10px', background: 'var(--subtle-bg)', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>
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

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Content Library</h1>
          <p className="text-gray-500">All your saved content in one place.</p>
        </div>
        <button onClick={toggleSelectMode}
          className="flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
          style={selectMode ? { backgroundColor: '#6C47FF', color: '#fff' } : { backgroundColor: 'var(--accent-soft-bg)', color: '#6C47FF' }}>
          {selectMode ? <X size={15} /> : <CheckSquare size={15} />}
          {selectMode ? 'Cancel' : 'Select'}
        </button>
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
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-all"
              style={activeFilter === f ? { backgroundColor: '#6C47FF', color: '#fff' } : { backgroundColor: 'var(--accent-soft-bg)', color: '#6C47FF' }}>
              {f}
            </button>
          ))}
          {selectMode && (
            <button onClick={handleSelectAll}
              className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
              style={{ backgroundColor: 'var(--accent-soft-bg)', color: '#6C47FF' }}>
              <CheckSquare size={15} />
              {selectedIds.size === filtered.length && filtered.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
          )}
          {selectMode && selectedIds.size > 0 && (
            <button onClick={handleExportSelected}
              className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
              style={{ backgroundColor: '#6C47FF', color: '#fff' }}>
              <Download size={15} />
              Download Selected (.zip)
            </button>
          )}
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
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--accent-soft-bg)' }}>
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
                onClick={() => selectMode ? toggleSelectItem(item.id) : openModal(item)}
                className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-all cursor-pointer"
                style={{ transition: 'box-shadow 0.2s, border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#6C47FF'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgb(243 244 246)'}>
                {selectMode && (
                  <div className="absolute top-4 right-4" onClick={e => { e.stopPropagation(); toggleSelectItem(item.id); }}>
                    {selectedIds.has(item.id)
                      ? <CheckSquare size={20} style={{ color: '#6C47FF' }} />
                      : <Square size={20} className="text-gray-300" />}
                  </div>
                )}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: '#6C47FF' }} />
                    <h3 className="text-sm font-semibold text-gray-800 truncate">{item.title || item.keyword || 'Untitled'}</h3>
                  </div>
                  {!selectMode && (
                    <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.color}`}>
                      {badge.label}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 leading-relaxed flex-1">{preview}</p>

                <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                  <span className="text-xs text-gray-400">{date}</span>
                  {!selectMode && (
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
                  )}
                </div>

                {!selectMode && (
                  <div className="flex gap-2 pt-1" onClick={e => e.stopPropagation()}>
                    <button onClick={() => handleExportPDF(item)} className="export-pdf-btn">
                      <FileDown className="w-3.5 h-3.5" />
                      Export PDF
                    </button>
                    <button onClick={() => handleExportWord(item)} className="export-word-btn">
                      <FileText className="w-3.5 h-3.5" />
                      Export Word
                    </button>
                  </div>
                )}

                {!selectMode && item.type === 'blog' && (
                  <div className="pt-1" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handlePublishToWordPress(item)}
                      disabled={publishingId === item.id}
                      className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-[#6C47FF] text-[#6C47FF] hover:bg-[#6C47FF] hover:text-white font-semibold py-2 text-xs transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {publishingId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                      {publishingId === item.id ? 'Publishing…' : 'Publish to WordPress'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
