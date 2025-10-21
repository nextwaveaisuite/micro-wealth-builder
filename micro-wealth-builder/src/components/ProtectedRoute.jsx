import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getSession } from '../lib/auth'

export default function ProtectedRoute({ children }) {
  const [state, setState] = useState({ loading: true, ok: false })

  useEffect(() => {
    let alive = true
    ;(async () => {
      const session = await getSession()
      if (!alive) return
      setState({ loading: false, ok: !!session?.ok })
    })()
    return () => { alive = false }
  }, [])

  if (state.loading) return <div style={{padding:20}}>Loading…</div>
  if (!state.ok) return <Navigate to="/login" replace />
  return children
}
