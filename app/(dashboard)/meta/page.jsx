'use client'
import { useEffect, useState, Suspense } from 'react'
import { Tag, Copy, Save, BookmarkPlus, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import useProjectContext from '@/hooks/useProjectContext'
import ProjectBanner from '@/components/ui/ProjectBanner'

export default function MetaPage() {
  return (
    <Suspense fallback={null}>
      <MetaPageInner />
    </Suspense>
  )
}

function MetaPageInner() {
  const { projectId, project, saveToProject } = useProjectContext()
  const [topic, setTopic] = useState('')
  const [keyword, setKeyword] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [savedToProject, setSavedToProject] = useState(false)

  useEffect(() => {
    if (project?.keyword && !topic && !keyword) {
      setTopic(project.keyword)
      setKeyword(project.keyword)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project])

  const saveResultToProject = async () => {
    try {
      await saveToProject({ meta_title: result.title, meta_description: result.description })
      setSavedToProject(true)
      toast.success('Saved to project')
    } catch (e) {
      toast.error(e.message || 'Failed to save')
    }
  }

  const generate = async () => {
    if (!topic || !keyword) return setError('Please fill all fields')
    setLoading(true)
    setError('')
    setResult(null)
    setSaved(false)

    try {
      const res = await fetch('/api/meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, keyword }),
      })
      const data = await res.json()
      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || 'Generation failed')
        toast.error(data.error || 'Generation failed')
      }
    } catch (e) {
      setError('Something went wrong')
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const copy = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const saveToLibrary = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('saved_content').insert({
        user_id: user.id,
        title: result.title,
        content: result.title + '\n\n' + result.description,
        type: 'meta',
        keyword: keyword,
      })
      setSaved(true)
      toast.success('Saved to library')
    } catch (e) {
      console.error(e)
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6" style={{ background: '#09090B' }}>
      <div className="flex items-center gap-3 mb-2">
        <Tag style={{ color: '#FF6B35' }} size={28} />
        <h1 className="text-2xl font-bold text-white">Meta Tag Generator</h1>
      </div>
      <p className="text-[#999] mb-8">Generate SEO-optimized title and meta description for any page.</p>

      <ProjectBanner project={project} projectId={projectId} />

      <div className="rounded-2xl border p-6 space-y-4" style={{ background: '#111111', borderColor: '#1f1f1f' }}>
        <div>
          <label className="block text-sm font-medium text-[#999] mb-1">Page Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Best WordPress SEO Plugins"
            className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none text-white placeholder-gray-600"
            style={{ background: '#1a1a1a', border: '1px solid #1f1f1f' }}
            onFocus={(e) => (e.target.style.borderColor = '#FF6B35')}
            onBlur={(e) => (e.target.style.borderColor = '#1f1f1f')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#999] mb-1">Target Keyword</label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. WordPress SEO plugins"
            className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none text-white placeholder-gray-600"
            style={{ background: '#1a1a1a', border: '1px solid #1f1f1f' }}
            onFocus={(e) => (e.target.style.borderColor = '#FF6B35')}
            onBlur={(e) => (e.target.style.borderColor = '#1f1f1f')}
          />
        </div>

        {error && <div className="text-sm px-4 py-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>{error}</div>}

        <button
          onClick={generate}
          disabled={loading}
          className="w-full text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 hover:opacity-90"
          style={{ backgroundColor: '#FF6B35' }}
        >
          {loading ? 'Generating...' : '✦ Generate Meta Tags'}
        </button>
      </div>

      {result && (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border p-6" style={{ background: '#111111', borderColor: '#1f1f1f' }}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-[#999]">SEO Title</span>
              <span className={`text-xs font-medium ${result.title.length > 60 ? 'text-red-500' : 'text-green-500'}`}>
                {result.title.length}/60
              </span>
            </div>
            <p className="text-white text-sm mb-3">{result.title}</p>
            <button onClick={() => copy(result.title)} className="flex items-center gap-2 text-xs text-[#FF6B35] hover:opacity-80">
              <Copy size={14} /> Copy Title
            </button>
          </div>

          <div className="rounded-2xl border p-6" style={{ background: '#111111', borderColor: '#1f1f1f' }}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-[#999]">Meta Description</span>
              <span className={`text-xs font-medium ${result.description.length > 155 ? 'text-red-500' : 'text-green-500'}`}>
                {result.description.length}/155
              </span>
            </div>
            <p className="text-white text-sm mb-3">{result.description}</p>
            <button onClick={() => copy(result.description)} className="flex items-center gap-2 text-xs text-[#FF6B35] hover:opacity-80">
              <Copy size={14} /> Copy Description
            </button>
          </div>

          <div className="rounded-2xl border p-6" style={{ background: '#1a1a1a', borderColor: '#1f1f1f' }}>
            <p className="text-xs font-semibold text-[#999] mb-3">GOOGLE PREVIEW</p>
            <p className="text-sm font-medium hover:underline cursor-pointer" style={{ color: '#8ab4f8' }}>{result.title}</p>
            <p className="text-xs" style={{ color: '#34a853' }}>yourwebsite.com</p>
            <p className="text-[#999] text-xs mt-1">{result.description}</p>
          </div>

          <div className="flex gap-3">
            {projectId && (
              <button
                onClick={saveResultToProject}
                disabled={savedToProject}
                className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 border-2"
                style={{ borderColor: '#FFD4C2', color: '#FFD4C2' }}
              >
                {savedToProject ? <Check size={16} /> : <BookmarkPlus size={16} />}
                {savedToProject ? 'Saved to Project' : 'Use in Project'}
              </button>
            )}
            <button
              onClick={saveToLibrary}
              disabled={saving || saved}
              className="flex-1 py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
              style={{ backgroundColor: '#FF6B35' }}
            >
              <Save size={16} />
              {saving ? 'Saving...' : saved ? 'Saved to Library ✓' : 'Save to Library'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
