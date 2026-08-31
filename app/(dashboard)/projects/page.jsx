'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Rocket, Plus, ArrowRight, Search, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import useGuestGuard from '@/hooks/useGuestGuard'
import GuestModal from '@/components/ui/GuestModal'

const STEP_LABELS = { 1: 'Keyword', 2: 'Research', 3: 'Content Plan', 4: 'Write', 5: 'Publish' }

export default function ProjectsPage() {
  const router = useRouter()
  const [keyword, setKeyword] = useState('')
  const [creating, setCreating] = useState(false)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const { showModal, setShowModal, guardedAction } = useGuestGuard()

  const loadProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      if (res.ok) setProjects(data.projects || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const createProject = guardedAction(async () => {
    if (!keyword.trim()) {
      toast.error('Please enter a keyword')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create project')
      router.push(`/projects/${data.id}`)
    } catch (e) {
      console.error(e)
      toast.error(e.message || 'Failed to create project')
    } finally {
      setCreating(false)
    }
  })

  const deleteProject = guardedAction(async (id) => {
    setDeleting(id)
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete project')
      setProjects((prev) => prev.filter((p) => p.id !== id))
      toast.success('Project removed')
    } catch (e) {
      console.error(e)
      toast.error(e.message || 'Failed to delete project')
    } finally {
      setDeleting(null)
    }
  })

  return (
    <div className="max-w-3xl mx-auto p-6" style={{ background: '#09090B' }}>
      <div className="flex items-center gap-3 mb-2">
        <Rocket size={28} style={{ color: '#FF6B35' }} />
        <h1 className="text-2xl font-bold" style={{ color: '#FAFAFA' }}>SEO Workflow</h1>
      </div>
      <p className="text-[#999] mb-8">
        Go from a keyword to a published, SEO-optimized post — one guided journey.
      </p>

      <div className="bg-[#111] rounded-2xl border border-[#1f1f1f] shadow-sm p-6 mb-8">
        <label className="block text-sm font-medium text-[#999] mb-2">Start a new project</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999] w-4 h-4" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createProject()}
              placeholder="e.g. best coffee maker"
              className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] text-white placeholder-gray-600 border border-[#1f1f1f] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
            />
          </div>
          <button
            onClick={createProject}
            disabled={creating}
            className="px-6 py-3 rounded-xl text-white text-sm font-semibold flex items-center gap-2 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#FF6B35' }}
          >
            <Plus className="w-4 h-4" />
            {creating ? 'Starting...' : 'New Project'}
          </button>
        </div>
      </div>

      <h2 className="text-sm font-semibold text-[#999] mb-3 uppercase tracking-wide">My Projects</h2>

      {loading ? (
        <p className="text-sm text-[#999]">Loading…</p>
      ) : projects.length === 0 ? (
        <div className="bg-[#111] rounded-2xl border border-[#1f1f1f] p-8 text-center">
          <p className="text-sm text-[#999]">No projects yet — start one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <div
              key={p.id}
              className="bg-[#111] rounded-2xl border border-[#1f1f1f] p-4 flex items-center justify-between gap-4 flex-wrap hover:border-[#FF6B35]/40 transition cursor-pointer"
              onClick={() => router.push(`/projects/${p.id}`)}
            >
              <div>
                <div className="font-semibold text-sm mb-1" style={{ color: '#FAFAFA' }}>{p.keyword}</div>
                <div className="flex items-center gap-2 text-xs text-[#999]">
                  <span
                    className="px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: 'rgba(255,107,53,0.12)', color: '#FF6B35' }}
                  >
                    Step {p.current_step}: {STEP_LABELS[p.current_step]}
                  </span>
                  {p.wordpress_status === 'published' && (
                    <span className="px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                      Published
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); deleteProject(p.id) }}
                  disabled={deleting === p.id}
                  className="p-2 rounded-lg border border-[#1f1f1f] text-[#999] hover:text-[#f87171] hover:border-[#f87171]/40 transition disabled:opacity-50"
                >
                  <Trash2 size={14} />
                </button>
                <ArrowRight size={16} style={{ color: '#FF6B35' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      <GuestModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}
