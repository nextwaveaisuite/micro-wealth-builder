import React, { Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles.css'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

const Login = lazy(()=>import('./pages/Login.jsx'))
const Overview = lazy(()=>import('./pages/Overview.jsx'))
const Offers = lazy(()=>import('./pages/Offers.jsx'))
const Users = lazy(()=>import('./pages/Users.jsx'))
const Settings = lazy(()=>import('./pages/Settings.jsx'))
const NotFound = lazy(()=>import('./pages/NotFound.jsx'))

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<div style={{padding:20}}>Loading…</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
            <Route path="/offers" element={<ProtectedRoute><Offers /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
)
