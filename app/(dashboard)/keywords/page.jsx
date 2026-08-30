'use client';

import { useState } from 'react';
import { Search, Loader2, Tag, Lightbulb, Target, BarChart2, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';

const intentColors = {
  Informational: 'bg-blue-500/15 text-blue-400',
  Commercial: 'bg-yellow-500/15 text-yellow-400',
  Transactional: 'bg-green-500/15 text-green-400',
  Navigational: 'bg-orange-500/15 text-orange-400',
  Unknown: 'bg-[#1a1a1a] text-[#999]',
};

const difficultyColors = {
  Easy: 'bg-emerald-500/15 text-emerald-400',
  Medium: 'bg-orange-500/15 text-orange-400',
  Hard: 'bg-red-500/15 text-red-400',
  Unknown: 'bg-[#1a1a1a] text-[#999]',
};

export default function KeywordsPage() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleAnalyze() {
    if (!keyword.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setSaved(false);

    try {
      const res = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setResult(data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveToLibrary() {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const content = `Intent: ${result.intent}\nDifficulty: ${result.difficulty}\n\nRelated Keywords:\n${result.related.join(', ')}\n\nLSI Keywords:\n${result.lsi.join(', ')}\n\nUsage Tips:\n${result.tips.join('\n')}`;
      await supabase.from('saved_content').insert({
        user_id: user.id,
        title: keyword,
        content: content,
        type: 'keyword',
        keyword: keyword,
      });
      setSaved(true);
      toast.success('Saved to library');
    } catch (e) {
      console.error(e);
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto" style={{ background: '#09090B' }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#FAFAFA' }}>Keyword Analyzer</h1>
        <p className="text-[#999]">Enter a keyword to get AI-powered SEO insights.</p>
      </div>

      <div className="bg-[#111] rounded-2xl border border-[#1f1f1f] shadow-sm p-6 mb-6">
        <label className="block text-sm font-semibold text-[#999] mb-2">Target Keyword</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999] w-4 h-4" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder="e.g. best SEO plugins for WordPress"
              className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] text-white placeholder-gray-600 border border-[#1f1f1f] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading || !keyword.trim()}
            className="px-6 py-3 rounded-xl text-white text-sm font-semibold flex items-center gap-2 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#FF6B35' }}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
            ) : (
              <><Target className="w-4 h-4" /> Analyze</>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm mb-6" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#111] rounded-2xl border border-[#1f1f1f] shadow-sm p-5">
              <p className="text-xs font-bold text-[#FF6B35] uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Search Intent
              </p>
              <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${intentColors[result.intent] || intentColors.Unknown}`}>
                {result.intent}
              </span>
            </div>
            <div className="bg-[#111] rounded-2xl border border-[#1f1f1f] shadow-sm p-5">
              <p className="text-xs font-bold text-[#FF6B35] uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5" /> Keyword Difficulty
              </p>
              <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${difficultyColors[result.difficulty] || difficultyColors.Unknown}`}>
                {result.difficulty}
              </span>
            </div>
          </div>

          <div className="bg-[#111] rounded-2xl border border-[#1f1f1f] shadow-sm p-6">
            <p className="text-sm font-bold text-[#FF6B35] mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4" style={{ color: '#FF6B35' }} /> Related Keywords
            </p>
            <div className="flex flex-wrap gap-2">
              {result.related.map((kw, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-medium border"
                  style={{ backgroundColor: 'rgba(255, 107, 53, 0.15)', color: '#FFD4C2', borderColor: 'rgba(255, 107, 53, 0.3)' }}>
                  {kw}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#111] rounded-2xl border border-[#1f1f1f] shadow-sm p-6">
            <p className="text-sm font-bold text-[#FF6B35] mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4" style={{ color: '#FFD4C2' }} /> LSI Keywords
            </p>
            <div className="flex flex-wrap gap-2">
              {result.lsi.map((kw, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-medium border"
                  style={{ backgroundColor: 'rgba(255, 212, 194, 0.15)', color: '#FFD4C2', borderColor: 'rgba(255, 212, 194, 0.3)' }}>
                  {kw}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#111] rounded-2xl border border-[#1f1f1f] shadow-sm p-6">
            <p className="text-sm font-bold text-[#FF6B35] mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" style={{ color: '#FF6B35' }} /> Usage Tips
            </p>
            <ul className="space-y-3">
              {result.tips.map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm text-[#999]">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center mt-0.5"
                    style={{ backgroundColor: 'rgba(255, 107, 53, 0.15)', color: '#FFD4C2' }}>
                    {i + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={saveToLibrary}
            disabled={saving || saved}
            className="w-full py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
            style={{ backgroundColor: '#FF6B35' }}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : saved ? 'Saved to Library ✓' : 'Save to Library'}
          </button>
        </div>
      )}
    </div>
  );
}
