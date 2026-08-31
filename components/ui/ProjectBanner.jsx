'use client'

import Link from 'next/link'
import { Rocket, ArrowLeft } from 'lucide-react'

export default function ProjectBanner({ project, projectId }) {
  if (!projectId || !project) return null

  return (
    <div
      className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 mb-6 text-sm"
      style={{ background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.25)' }}
    >
      <span className="flex items-center gap-2" style={{ color: '#FFD4C2' }}>
        <Rocket size={15} style={{ color: '#FF6B35' }} />
        Working on project: <strong style={{ color: '#FAFAFA' }}>{project.keyword}</strong>
      </span>
      <Link href={`/projects/${projectId}`} className="flex items-center gap-1 font-semibold shrink-0" style={{ color: '#FF6B35' }}>
        <ArrowLeft size={14} />
        Back to workflow
      </Link>
    </div>
  )
}
