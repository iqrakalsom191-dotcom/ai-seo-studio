'use client';

import { useState } from 'react';
import { Search, Loader2, Tag, Lightbulb, Target, BarChart2, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase';

const intentColors = {
  Informational: 'bg-blue-100 text-blue-700',
  Commercial: 'bg-yellow-100 text-yellow-700',
  Transactional: 'bg-green-100 text-green-700',
  Navigational: 'bg-purple-100 text-purple-700',
  Unknown: 'bg-gray-100 text-gray-600',
};

const difficultyColors = {
  Easy: 'bg-emerald-100 text-emerald-700',
  Medium: 'bg-orange-100 text-orange-700',
  Hard: 'bg-red-100 text-red-700',
  Unknown: 'bg-gray-100 text-gray-600',
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
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Keyword Analyzer</h1>
        <p className="text-gray-500">Enter a keyword to get AI-powered SEO insights.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Target Keyword</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder="e.g. best SEO plugins for WordPress"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6C47FF] focus:border-transparent"
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading || !keyword.trim()}
            className="px-6 py-3 rounded-xl text-white text-sm font-semibold flex items-center gap-2 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#6C47FF' }}
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
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Search Intent
              </p>
              <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${intentColors[result.intent] || intentColors.Unknown}`}>
                {result.intent}
              </span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5" /> Keyword Difficulty
              </p>
              <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${difficultyColors[result.difficulty] || difficultyColors.Unknown}`}>
                {result.difficulty}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4" style={{ color: '#6C47FF' }} /> Related Keywords
            </p>
            <div className="flex flex-wrap gap-2">
              {result.related.map((kw, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-medium border"
                  style={{ backgroundColor: '#F0EEFF', color: '#6C47FF', borderColor: '#e0d9ff' }}>
                  {kw}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4" style={{ color: '#00C6AE' }} /> LSI Keywords
            </p>
            <div className="flex flex-wrap gap-2">
              {result.lsi.map((kw, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-medium border"
                  style={{ backgroundColor: '#e6faf8', color: '#00957f', borderColor: '#b3ede7' }}>
                  {kw}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" style={{ color: '#6C47FF' }} /> Usage Tips
            </p>
            <ul className="space-y-3">
              {result.tips.map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-600">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center mt-0.5"
                    style={{ backgroundColor: '#F0EEFF', color: '#6C47FF' }}>
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
            style={{ backgroundColor: '#6C47FF' }}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : saved ? 'Saved to Library ✓' : 'Save to Library'}
          </button>
        </div>
      )}
    </div>
  );
}
