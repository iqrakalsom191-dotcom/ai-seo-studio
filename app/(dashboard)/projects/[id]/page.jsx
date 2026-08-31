'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Rocket, Loader2, Search, Globe, Tags, Link2, HelpCircle, Plus, X,
  Sparkles, Send, FileEdit, BookmarkPlus, CheckCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import { MarkdownContent, OutputTopBar } from '@/components/ui/MarkdownOutput'
import ProjectStepper from '@/components/ui/ProjectStepper'
import useGuestGuard from '@/hooks/useGuestGuard'
import GuestModal from '@/components/ui/GuestModal'

const inputClass = 'w-full bg-[#1a1a1a] text-white placeholder-gray-600 border border-[#1f1f1f] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]'

export default function ProjectWorkspacePage() {
  const { id } = useParams()
  const router = useRouter()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const { showModal, setShowModal, guardedAction } = useGuestGuard()

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Project not found')
      setProject(data.project)
    } catch (e) {
      console.error(e)
      toast.error(e.message || 'Failed to load project')
      router.push('/projects')
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    load()
  }, [load])

  const patch = async (updates) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to save')
    setProject(data.project)
    return data.project
  }

  const goToStep = guardedAction(async (step) => {
    try {
      await patch({ current_step: step })
    } catch (e) {
      toast.error(e.message)
    }
  })

  // Auto-run keyword analysis when entering the workspace for the first time
  useEffect(() => {
    if (!project || project.keyword_analysis || analyzing) return
    const analyze = async () => {
      setAnalyzing(true)
      try {
        const res = await fetch('/api/keywords', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyword: project.keyword }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Keyword analysis failed')
        await patch({ keyword_analysis: data, current_step: Math.max(project.current_step, 2) })
      } catch (e) {
        console.error(e)
        toast.error(e.message || 'Keyword analysis failed')
      } finally {
        setAnalyzing(false)
      }
    }
    analyze()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id, project?.keyword_analysis])

  if (loading || !project) {
    return (
      <div className="max-w-3xl mx-auto p-6 flex items-center justify-center min-h-[50vh]" style={{ background: '#09090B' }}>
        <Loader2 size={28} className="animate-spin text-[#FF6B35]" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6" style={{ background: '#09090B' }}>
      <div className="flex items-center gap-3 mb-2">
        <Rocket size={26} style={{ color: '#FF6B35' }} />
        <h1 className="text-2xl font-bold" style={{ color: '#FAFAFA' }}>{project.keyword}</h1>
      </div>
      <p className="text-[#999] mb-8">Follow the journey from keyword to published post.</p>

      <ProjectStepper currentStep={project.current_step} onStepClick={goToStep} />

      {project.current_step === 1 && (
        <StepKeyword analyzing={analyzing} />
      )}
      {project.current_step === 2 && (
        <StepResearch project={project} analyzing={analyzing} onContinue={() => goToStep(3)} />
      )}
      {project.current_step === 3 && (
        <StepContentPlan project={project} patch={patch} onContinue={() => goToStep(4)} />
      )}
      {project.current_step === 4 && (
        <StepWrite project={project} patch={patch} onContinue={() => goToStep(5)} />
      )}
      {project.current_step === 5 && (
        <StepPublish project={project} patch={patch} />
      )}

      <GuestModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}

function Card({ children }) {
  return (
    <div className="bg-[#111] rounded-2xl border border-[#1f1f1f] shadow-sm p-6 space-y-4">
      {children}
    </div>
  )
}

function StepKeyword({ analyzing }) {
  return (
    <Card>
      <div className="flex items-center gap-3 text-sm" style={{ color: '#e5e5e5' }}>
        {analyzing ? <Loader2 size={16} className="animate-spin text-[#FF6B35]" /> : <Search size={16} style={{ color: '#FF6B35' }} />}
        {analyzing ? 'Analyzing your keyword…' : 'Preparing keyword research…'}
      </div>
    </Card>
  )
}

function StepResearch({ project, analyzing, onContinue }) {
  const a = project.keyword_analysis
  if (analyzing || !a) {
    return (
      <Card>
        <div className="flex items-center gap-3 text-sm" style={{ color: '#e5e5e5' }}>
          <Loader2 size={16} className="animate-spin text-[#FF6B35]" />
          Analyzing your keyword…
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <p className="text-xs font-bold text-[#FF6B35] uppercase tracking-wide">Search Intent</p>
          <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold" style={{ background: 'rgba(255,212,194,0.15)', color: '#FFD4C2' }}>
            {a.intent}
          </span>
        </Card>
        <Card>
          <p className="text-xs font-bold text-[#FF6B35] uppercase tracking-wide">Difficulty</p>
          <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold" style={{ background: 'rgba(255,212,194,0.15)', color: '#FFD4C2' }}>
            {a.difficulty}
          </span>
        </Card>
      </div>

      <Card>
        <p className="text-sm font-bold text-[#FF6B35]">Related Keywords</p>
        <div className="flex flex-wrap gap-2">
          {a.related?.map((k, i) => (
            <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-medium border" style={{ background: 'rgba(255,107,53,0.12)', color: '#FFD4C2', borderColor: 'rgba(255,107,53,0.3)' }}>
              {k}
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2">
          <Globe size={16} style={{ color: '#FF6B35' }} />
          <p className="text-sm font-bold" style={{ color: '#FAFAFA' }}>Want to check what competitors are doing?</p>
        </div>
        <Link href={`/competitor-meta?project=${project.id}`} target="_blank" className="text-xs font-semibold" style={{ color: '#FF6B35' }}>
          Open Competitor Meta Analyzer →
        </Link>
      </Card>

      <button
        onClick={onContinue}
        className="w-full text-white font-semibold py-3 rounded-xl transition hover:opacity-90"
        style={{ backgroundColor: '#FF6B35' }}
      >
        Continue to Content Plan
      </button>
    </div>
  )
}

function StepContentPlan({ project, patch, onContinue }) {
  const [title, setTitle] = useState(project.selected_title || '')
  const [metaTitle, setMetaTitle] = useState(project.meta_title || '')
  const [metaDescription, setMetaDescription] = useState(project.meta_description || '')
  const [slug, setSlug] = useState(project.slug || '')
  const [faqs, setFaqs] = useState(project.faqs || [])
  const [newQ, setNewQ] = useState('')
  const [newA, setNewA] = useState('')
  const [saving, setSaving] = useState(null)

  const saveField = async (key, value, label) => {
    setSaving(key)
    try {
      await patch({ [key]: value })
      toast.success(`${label} saved`)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(null)
    }
  }

  const addFaq = async () => {
    if (!newQ.trim() || !newA.trim()) return
    const updated = [...faqs, { question: newQ.trim(), answer: newA.trim() }]
    setFaqs(updated)
    setNewQ('')
    setNewA('')
    try {
      await patch({ faqs: updated })
    } catch (e) {
      toast.error(e.message)
    }
  }

  const removeFaq = async (i) => {
    const updated = faqs.filter((_, idx) => idx !== i)
    setFaqs(updated)
    try {
      await patch({ faqs: updated })
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>Title</label>
          <Link href={`/title-generator?project=${project.id}`} target="_blank" className="text-xs font-semibold" style={{ color: '#FF6B35' }}>
            Generate ideas →
          </Link>
        </div>
        <div className="flex gap-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Paste or write your chosen title" className={inputClass} />
          <button onClick={() => saveField('selected_title', title, 'Title')} disabled={saving === 'selected_title'} className="px-4 rounded-lg text-sm font-semibold text-white shrink-0" style={{ background: '#FF6B35' }}>
            {saving === 'selected_title' ? '…' : 'Save'}
          </button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold flex items-center gap-2" style={{ color: '#FAFAFA' }}>
            <Tags size={14} style={{ color: '#FF6B35' }} /> Meta Title & Description
          </label>
          <Link href={`/meta?project=${project.id}`} target="_blank" className="text-xs font-semibold" style={{ color: '#FF6B35' }}>
            Generate →
          </Link>
        </div>
        <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Meta title" className={inputClass} />
        <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="Meta description" rows={2} className={`${inputClass} resize-none`} />
        <button
          onClick={() => saveField('meta_title', metaTitle, 'Meta title')
            .then(() => saveField('meta_description', metaDescription, 'Meta description'))}
          disabled={saving}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: '#FF6B35' }}
        >
          {saving ? '…' : 'Save Meta'}
        </button>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold flex items-center gap-2" style={{ color: '#FAFAFA' }}>
            <Link2 size={14} style={{ color: '#FF6B35' }} /> Slug
          </label>
          <Link href={`/slug?project=${project.id}`} target="_blank" className="text-xs font-semibold" style={{ color: '#FF6B35' }}>
            Generate →
          </Link>
        </div>
        <div className="flex gap-2">
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. best-coffee-maker" className={inputClass} />
          <button onClick={() => saveField('slug', slug, 'Slug')} disabled={saving === 'slug'} className="px-4 rounded-lg text-sm font-semibold text-white shrink-0" style={{ background: '#FF6B35' }}>
            {saving === 'slug' ? '…' : 'Save'}
          </button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold flex items-center gap-2" style={{ color: '#FAFAFA' }}>
            <HelpCircle size={14} style={{ color: '#FF6B35' }} /> FAQs ({faqs.length})
          </label>
          <Link href={`/faq?project=${project.id}`} target="_blank" className="text-xs font-semibold" style={{ color: '#FF6B35' }}>
            Generate →
          </Link>
        </div>
        {faqs.map((f, i) => (
          <div key={i} className="flex items-start justify-between gap-2 rounded-lg p-3" style={{ background: '#1a1a1a' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: '#FAFAFA' }}>{f.question}</p>
              <p className="text-xs mt-1" style={{ color: '#999' }}>{f.answer}</p>
            </div>
            <button onClick={() => removeFaq(i)} className="text-[#999] hover:text-[#f87171] shrink-0">
              <X size={14} />
            </button>
          </div>
        ))}
        <input value={newQ} onChange={(e) => setNewQ(e.target.value)} placeholder="Question" className={inputClass} />
        <input value={newA} onChange={(e) => setNewA(e.target.value)} placeholder="Answer" className={inputClass} />
        <button onClick={addFaq} className="flex items-center gap-2 text-xs font-semibold" style={{ color: '#FF6B35' }}>
          <Plus size={14} /> Add FAQ
        </button>
      </Card>

      <button
        onClick={onContinue}
        className="w-full text-white font-semibold py-3 rounded-xl transition hover:opacity-90"
        style={{ backgroundColor: '#FF6B35' }}
      >
        Continue to Write
      </button>
    </div>
  )
}

function StepWrite({ project, patch, onContinue }) {
  const [tone, setTone] = useState('professional')
  const [wordCount, setWordCount] = useState('1000')
  const [language, setLanguage] = useState('english')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: project.keyword,
          tone,
          wordCount,
          language,
          context: {
            title: project.selected_title,
            metaDescription: project.meta_description,
            relatedKeywords: project.keyword_analysis?.related,
            faqs: project.faqs,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.content) throw new Error(data.error || 'Generation failed')
      await patch({ generated_content: data.content })
      toast.success('Article generated')
    } catch (e) {
      console.error(e)
      toast.error(e.message || 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  const saveToLibrary = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('saved_content').insert({
        user_id: user.id,
        title: project.selected_title || project.keyword,
        content: project.generated_content,
        type: 'blog',
        keyword: project.keyword,
        word_count: project.generated_content.split(/\s+/).length,
      })
      setSavedOk(true)
      toast.success('Saved to library')
    } catch (e) {
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="grid grid-cols-3 gap-3">
          <select value={tone} onChange={(e) => setTone(e.target.value)} className={inputClass}>
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="friendly">Friendly</option>
          </select>
          <select value={wordCount} onChange={(e) => setWordCount(e.target.value)} className={inputClass}>
            <option value="500">500 words</option>
            <option value="1000">1000 words</option>
            <option value="1500">1500 words</option>
          </select>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className={inputClass}>
            <option value="english">English</option>
            <option value="urdu">Urdu</option>
          </select>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 hover:opacity-90"
          style={{ backgroundColor: '#FF6B35' }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {loading ? 'Writing…' : project.generated_content ? 'Regenerate Article' : 'Generate Article'}
        </button>
      </Card>

      {project.generated_content && (
        <Card>
          <OutputTopBar wordCount={project.generated_content.split(/\s+/).length} contentType="Blog Post" />
          <MarkdownContent text={project.generated_content} />
          <div className="flex gap-3">
            <button
              onClick={saveToLibrary}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-sm font-semibold"
              style={{ borderColor: '#FFD4C2', color: '#FFD4C2' }}
            >
              {savedOk ? <CheckCheck size={15} /> : <BookmarkPlus size={15} />}
              {saving ? 'Saving…' : savedOk ? 'Saved!' : 'Save to Library'}
            </button>
            <button
              onClick={onContinue}
              className="flex-1 text-white font-semibold py-2.5 rounded-xl text-sm"
              style={{ backgroundColor: '#FF6B35' }}
            >
              Continue to Publish
            </button>
          </div>
        </Card>
      )}
    </div>
  )
}

function StepPublish({ project, patch }) {
  const [publishing, setPublishing] = useState(false)

  const publish = async (status) => {
    if (!project.generated_content) {
      toast.error('Generate the article first')
      return
    }
    setPublishing(true)
    try {
      const res = await fetch('/api/wordpress/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: project.selected_title || project.keyword,
          content: project.generated_content,
          status,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Publish failed')

      await patch({
        wordpress_status: status === 'publish' ? 'published' : 'draft',
        wordpress_post_url: data.postUrl,
        status: status === 'publish' ? 'published' : project.status,
      })

      toast.success(status === 'publish' ? 'Published to WordPress!' : 'Saved as draft in WordPress!')
    } catch (e) {
      console.error(e)
      toast.error(e.message || 'Failed to publish')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="space-y-5">
      {project.wordpress_status !== 'none' && (
        <Card>
          <p className="text-sm" style={{ color: '#10b981' }}>
            Status: {project.wordpress_status}
            {project.wordpress_post_url && (
              <> — <a href={project.wordpress_post_url} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#FF6B35' }}>View Post</a></>
            )}
          </p>
        </Card>
      )}

      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => publish('draft')}
            disabled={publishing}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold disabled:opacity-50"
            style={{ borderColor: '#FF6B35', color: '#FF6B35' }}
          >
            {publishing ? <Loader2 size={15} className="animate-spin" /> : <FileEdit size={15} />}
            Save as Draft
          </button>
          <button
            onClick={() => publish('publish')}
            disabled={publishing}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: '#FF6B35' }}
          >
            {publishing ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            Publish Live
          </button>
        </div>
      </Card>
    </div>
  )
}
