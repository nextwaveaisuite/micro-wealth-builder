import React, { Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles.css'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

const Login = lazy(()=>import('./pages/Login.jsx'))
const Overview = lazy(()=>import('./pages/Overview.jsx'))
const Portfolio = lazy(()=>import('./pages/Portfolio.jsx'))
const Planner = lazy(()=>import('./pages/Planner.jsx'))
const Calculator = lazy(()=>import('./pages/Calculator.jsx'))
const Learn = lazy(()=>import('./pages/Learn.jsx'))
const Execute = lazy(()=>import('./pages/Execute.jsx'))   // ← NEW
const NotFound = lazy(()=>import('./pages/NotFound.jsx'))

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<div style={{padding:20}}>Loading…</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
            <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
            <Route path="/planner" element={<ProtectedRoute><Planner /></ProtectedRoute>} />
            <Route path="/calculator" element={<ProtectedRoute><Calculator /></ProtectedRoute>} />
            <Route path="/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
            <Route path="/execute" element={<ProtectedRoute><Execute /></ProtectedRoute>} /> {/* ← NEW */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
)
