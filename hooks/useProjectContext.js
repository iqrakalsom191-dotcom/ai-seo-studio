'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function useProjectContext() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get('project')
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(!!projectId)

  useEffect(() => {
    if (!projectId) {
      setLoading(false)
      return
    }
    const load = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`)
        const data = await res.json()
        if (res.ok) setProject(data.project)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [projectId])

  const saveToProject = async (updates) => {
    if (!projectId) return
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to save to project')
    setProject(data.project)
    return data.project
  }

  return { projectId, project, loading, saveToProject }
}
