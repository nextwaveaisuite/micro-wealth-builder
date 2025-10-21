import React from 'react'
import { Navigate } from 'react-router-dom'
import { Auth } from '../lib/auth'

export default function ProtectedRoute({ children }) {
  if (!Auth.isAuthed()) return <Navigate to="/login" replace />
  return children
}
