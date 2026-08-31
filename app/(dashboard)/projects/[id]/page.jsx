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

function slugify(text) {
  return (text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

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
        <StepResearch project={project} analyzing={analyzing} onContinue={() => goToStep(3)} onBack={() => goToStep(1)} />
      )}
      {project.current_step === 3 && (
        <StepContentPlan project={project} patch={patch} onContinue={() => goToStep(4)} onBack={() => goToStep(2)} />
      )}
      {project.current_step === 4 && (
        <StepWrite project={project} patch={patch} onContinue={() => goToStep(5)} onBack={() => goToStep(3)} />
      )}
      {project.current_step === 5 && (
        <StepPublish project={project} patch={patch} goToStep={goToStep} />
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

function StepNav({ onBack, onContinue, continueLabel = 'Continue' }) {
  return (
    <div className="flex gap-3">
      {onBack && (
        <button
          onClick={onBack}
          className="px-5 py-3 rounded-xl text-sm font-semibold border border-[#1f1f1f] text-[#999] hover:text-white hover:bg-[#1a1a1a] transition"
        >
          ← Back
        </button>
      )}
      <button
        onClick={onContinue}
        className="flex-1 text-white font-semibold py-3 rounded-xl transition hover:opacity-90"
        style={{ backgroundColor: '#FF6B35' }}
      >
        {continueLabel}
      </button>
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

function StepResearch({ project, analyzing, onContinue, onBack }) {
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

      <StepNav onBack={onBack} onContinue={onContinue} continueLabel="Continue to Content Plan" />
    </div>
  )
}

function OptionalTag() {
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide" style={{ background: 'rgba(153,153,153,0.15)', color: '#999' }}>
      Optional
    </span>
  )
}

function StepContentPlan({ project, patch, onContinue, onBack }) {
  const [title, setTitle] = useState(project.selected_title || '')
  const [metaDescription, setMetaDescription] = useState(project.meta_description || '')
  const [slug, setSlug] = useState(project.slug || '')
  const [faqs, setFaqs] = useState(project.faqs || [])
  const [newQ, setNewQ] = useState('')
  const [newA, setNewA] = useState('')
  const [saving, setSaving] = useState(null)
  const [activeModal, setActiveModal] = useState(null)

  // Title is the single source of truth — saving it also syncs the meta title,
  // and auto-fills the slug if one hasn't been set yet.
  const saveTitle = async (value) => {
    if (project.selected_title && project.selected_title !== value) {
      if (!window.confirm('Replace your saved title? This will also update your meta title.')) return
    }
    setSaving('selected_title')
    try {
      const updates = { selected_title: value, meta_title: value }
      if (!slug) updates.slug = slugify(value)
      const updated = await patch(updates)
      setTitle(value)
      if (updated.slug) setSlug(updated.slug)
      toast.success('Title saved')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(null)
    }
  }

  const saveDescription = async (value) => {
    if (project.meta_description && project.meta_description !== value) {
      if (!window.confirm('Replace your saved meta description?')) return
    }
    setSaving('meta_description')
    try {
      await patch({ meta_description: value, meta_title: title })
      setMetaDescription(value)
      toast.success('Meta description saved')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(null)
    }
  }

  const saveSlug = async (value) => {
    if (project.slug && project.slug !== value) {
      if (!window.confirm('Replace your saved slug?')) return
    }
    setSaving('slug')
    try {
      await patch({ slug: value })
      setSlug(value)
      toast.success('Slug saved')
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
      <p className="text-xs text-[#999]">
        Everything below is optional — skip whatever you don't need and hit Continue whenever you're ready.
      </p>

      <Card>
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold flex items-center gap-2" style={{ color: '#FAFAFA' }}>
            Title <OptionalTag />
          </label>
          <button onClick={() => setActiveModal('title')} className="text-xs font-semibold" style={{ color: '#FF6B35' }}>
            Generate ideas →
          </button>
        </div>
        <div className="flex gap-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Paste or write your chosen title" className={inputClass} />
          <button onClick={() => saveTitle(title)} disabled={saving === 'selected_title'} className="px-4 rounded-lg text-sm font-semibold text-white shrink-0" style={{ background: '#FF6B35' }}>
            {saving === 'selected_title' ? '…' : 'Save'}
          </button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold flex items-center gap-2" style={{ color: '#FAFAFA' }}>
            <Tags size={14} style={{ color: '#FF6B35' }} /> Meta Description <OptionalTag />
          </label>
          <button onClick={() => setActiveModal('meta')} className="text-xs font-semibold" style={{ color: '#FF6B35' }}>
            Generate →
          </button>
        </div>
        <p className="text-xs" style={{ color: '#999' }}>
          Meta title: <span style={{ color: title ? '#FAFAFA' : '#666' }}>{title || 'Set a title above first — it doubles as your meta title'}</span>
        </p>
        <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="Meta description" rows={2} className={`${inputClass} resize-none`} />
        <button
          onClick={() => saveDescription(metaDescription)}
          disabled={saving === 'meta_description'}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: '#FF6B35' }}
        >
          {saving === 'meta_description' ? '…' : 'Save Description'}
        </button>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold flex items-center gap-2" style={{ color: '#FAFAFA' }}>
            <Link2 size={14} style={{ color: '#FF6B35' }} /> Slug <OptionalTag />
          </label>
          <button onClick={() => setActiveModal('slug')} className="text-xs font-semibold" style={{ color: '#FF6B35' }}>
            Generate →
          </button>
        </div>
        <div className="flex gap-2">
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. best-coffee-maker" className={inputClass} />
          <button onClick={() => saveSlug(slug)} disabled={saving === 'slug'} className="px-4 rounded-lg text-sm font-semibold text-white shrink-0" style={{ background: '#FF6B35' }}>
            {saving === 'slug' ? '…' : 'Save'}
          </button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold flex items-center gap-2" style={{ color: '#FAFAFA' }}>
            <HelpCircle size={14} style={{ color: '#FF6B35' }} /> FAQs ({faqs.length}) <OptionalTag />
          </label>
          <button onClick={() => setActiveModal('faq')} className="text-xs font-semibold" style={{ color: '#FF6B35' }}>
            Generate →
          </button>
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

      <StepNav onBack={onBack} onContinue={onContinue} continueLabel="Continue to Write" />

      {activeModal === 'title' && (
        <TitleGenModal
          keyword={project.keyword}
          onClose={() => setActiveModal(null)}
          onSelect={(value) => { saveTitle(value); setActiveModal(null) }}
        />
      )}
      {activeModal === 'meta' && (
        <MetaGenModal
          keyword={title || project.keyword}
          hasTitle={!!title}
          onClose={() => setActiveModal(null)}
          onSelect={(description) => { saveDescription(description); setActiveModal(null) }}
        />
      )}
      {activeModal === 'slug' && (
        <SlugGenModal
          keyword={title || project.keyword}
          onClose={() => setActiveModal(null)}
          onSelect={(value) => { saveSlug(value); setActiveModal(null) }}
        />
      )}
      {activeModal === 'faq' && (
        <FaqGenModal
          keyword={project.keyword}
          onClose={() => setActiveModal(null)}
          onSelect={(newFaqs) => {
            const merged = [...faqs, ...newFaqs]
            setFaqs(merged)
            patch({ faqs: merged }).then(() => toast.success('FAQs saved'))
            setActiveModal(null)
          }}
        />
      )}
    </div>
  )
}

function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-6"
        style={{ background: '#111', border: '1px solid #1f1f1f' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>{title}</h3>
          <button onClick={onClose} className="text-[#999] hover:text-white">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function GenerateButton({ onClick, loading, children }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50 hover:opacity-90"
      style={{ backgroundColor: '#FF6B35' }}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  )
}

function TitleGenModal({ keyword, onClose, onSelect }) {
  const [titles, setTitles] = useState([])
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/title-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
      })
      const data = await res.json()
      if (!res.ok || !data.titles) throw new Error(data.error || 'Failed to generate titles')
      setTitles(data.titles.split('\n').map((t) => t.trim()).filter(Boolean))
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { generate() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ModalShell title="Generate Title" onClose={onClose}>
      <div className="space-y-3">
        {titles.map((t, i) => (
          <button
            key={i}
            onClick={() => onSelect(t)}
            className="w-full text-left rounded-lg p-3 text-sm transition hover:border-[#FF6B35]"
            style={{ background: '#1a1a1a', border: '1px solid #1f1f1f', color: '#e5e5e5' }}
          >
            {t}
          </button>
        ))}
        <GenerateButton onClick={generate} loading={loading}>
          {loading ? 'Generating…' : titles.length ? 'Regenerate' : 'Generate Titles'}
        </GenerateButton>
      </div>
    </ModalShell>
  )
}

function MetaGenModal({ keyword, hasTitle, onClose, onSelect }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: keyword, keyword }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to generate meta tags')
      setResult(data)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { generate() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ModalShell title="Generate Meta Description" onClose={onClose}>
      <div className="space-y-3">
        {hasTitle && (
          <p className="text-xs" style={{ color: '#999' }}>
            Your saved title will be used as the meta title — only the description is generated here.
          </p>
        )}
        {result && (
          <div className="rounded-lg p-3 space-y-2" style={{ background: '#1a1a1a', border: '1px solid #1f1f1f' }}>
            <p className="text-xs" style={{ color: '#e5e5e5' }}>{result.description}</p>
            <button
              onClick={() => onSelect(result.description)}
              className="text-xs font-semibold"
              style={{ color: '#FF6B35' }}
            >
              Use This →
            </button>
          </div>
        )}
        <GenerateButton onClick={generate} loading={loading}>
          {loading ? 'Generating…' : result ? 'Regenerate' : 'Generate Description'}
        </GenerateButton>
      </div>
    </ModalShell>
  )
}

function SlugGenModal({ keyword, onClose, onSelect }) {
  const [slugs, setSlugs] = useState([])
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/slug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
      })
      const data = await res.json()
      if (!res.ok || !data.slugs) throw new Error(data.error || 'Failed to generate slugs')
      setSlugs(data.slugs)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { generate() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ModalShell title="Generate Slug" onClose={onClose}>
      <div className="space-y-3">
        {slugs.map((s, i) => (
          <button
            key={i}
            onClick={() => onSelect(s)}
            className="w-full text-left rounded-lg p-3 text-sm font-mono transition hover:border-[#FF6B35]"
            style={{ background: '#1a1a1a', border: '1px solid #1f1f1f', color: '#e5e5e5' }}
          >
            /{s}
          </button>
        ))}
        <GenerateButton onClick={generate} loading={loading}>
          {loading ? 'Generating…' : slugs.length ? 'Regenerate' : 'Generate Slugs'}
        </GenerateButton>
      </div>
    </ModalShell>
  )
}

function FaqGenModal({ keyword, onClose, onSelect }) {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: keyword }),
      })
      const data = await res.json()
      if (!res.ok || !data.faqs) throw new Error(data.error || 'Failed to generate FAQs')
      setFaqs(data.faqs)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { generate() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ModalShell title="Generate FAQs" onClose={onClose}>
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <div key={i} className="rounded-lg p-3" style={{ background: '#1a1a1a', border: '1px solid #1f1f1f' }}>
            <p className="text-sm font-medium" style={{ color: '#FAFAFA' }}>{f.question}</p>
            <p className="text-xs mt-1" style={{ color: '#999' }}>{f.answer}</p>
          </div>
        ))}
        {faqs.length > 0 && (
          <button onClick={() => onSelect(faqs)} className="w-full text-sm font-semibold py-2 rounded-lg border-2" style={{ borderColor: '#FFD4C2', color: '#FFD4C2' }}>
            Use all {faqs.length} FAQs
          </button>
        )}
        <GenerateButton onClick={generate} loading={loading}>
          {loading ? 'Generating…' : faqs.length ? 'Regenerate' : 'Generate FAQs'}
        </GenerateButton>
      </div>
    </ModalShell>
  )
}

function StepWrite({ project, patch, onContinue, onBack }) {
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
          <button
            onClick={saveToLibrary}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-sm font-semibold"
            style={{ borderColor: '#FFD4C2', color: '#FFD4C2' }}
          >
            {savedOk ? <CheckCheck size={15} /> : <BookmarkPlus size={15} />}
            {saving ? 'Saving…' : savedOk ? 'Saved!' : 'Save to Library'}
          </button>
          <StepNav onBack={onBack} onContinue={onContinue} continueLabel="Continue to Publish" />
        </Card>
      )}
    </div>
  )
}

function StepPublish({ project, patch, goToStep }) {
  const [publishing, setPublishing] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(project.generated_content || '')
  const [savingEdit, setSavingEdit] = useState(false)

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

  const saveEdit = async () => {
    setSavingEdit(true)
    try {
      await patch({ generated_content: draft })
      setEditing(false)
      toast.success('Article updated — republish to push these changes live')
    } catch (e) {
      toast.error(e.message || 'Failed to save changes')
    } finally {
      setSavingEdit(false)
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

      {project.generated_content && (
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>Article Content</span>
            <div className="flex items-center gap-3">
              {!editing && (
                <button onClick={() => { setDraft(project.generated_content); setEditing(true) }} className="text-xs font-semibold flex items-center gap-1" style={{ color: '#FF6B35' }}>
                  <FileEdit size={13} /> Edit
                </button>
              )}
              <button onClick={() => goToStep(4)} className="text-xs font-semibold" style={{ color: '#FFD4C2' }}>
                Regenerate in Write step →
              </button>
            </div>
          </div>

          {editing ? (
            <div className="space-y-3">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={16}
                className="w-full bg-[#1a1a1a] text-white border border-[#1f1f1f] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35] resize-y font-mono"
              />
              <div className="flex gap-3">
                <button onClick={() => setEditing(false)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-[#1f1f1f] text-[#999]">
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  disabled={savingEdit}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: '#FF6B35' }}
                >
                  {savingEdit ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <MarkdownContent text={project.generated_content} />
          )}
        </Card>
      )}

      <button
        onClick={() => goToStep(4)}
        className="px-5 py-3 rounded-xl text-sm font-semibold border border-[#1f1f1f] text-[#999] hover:text-white hover:bg-[#1a1a1a] transition"
      >
        ← Back to Write
      </button>

      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => publish('draft')}
            disabled={publishing}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold disabled:opacity-50"
            style={{ borderColor: '#FF6B35', color: '#FF6B35' }}
          >
            {publishing ? <Loader2 size={15} className="animate-spin" /> : <FileEdit size={15} />}
            {project.wordpress_status === 'none' ? 'Save as Draft' : 'Update Draft'}
          </button>
          <button
            onClick={() => publish('publish')}
            disabled={publishing}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: '#FF6B35' }}
          >
            {publishing ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {project.wordpress_status === 'published' ? 'Republish' : 'Publish Live'}
          </button>
        </div>
      </Card>
    </div>
  )
}
