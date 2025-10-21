import React, { useEffect, useMemo, useState } from 'react'
import { Layout } from '../components/Layout'

const menu = [
  { to: '/', label: 'Overview', end: true },
  { to: '/providers', label: 'Providers' },
  { to: '/offers', label: 'Offers' },
  { to: '/users', label: 'Users' },
  { to: '/settings', label: 'Settings' }
]

const STORAGE_KEY = 'mw_admin_providers_v1'

// Default 5 micro-investment providers
const DEFAULT_PROVIDERS = [
  {
    id: 1,
    key: 'raiz',
    name: 'Raiz',
    accent: '#1aa7ec',
    tagline: 'Round-ups into diversified portfolios.',
    openUrl: 'https://raizinvest.com.au/',
    howUrl: 'https://raizinvest.com.au/how-it-works/',
    active: true
  },
  {
    id: 2,
    key: 'spaceship',
    name: 'Spaceship Voyager',
    accent: '#6b5bff',
    tagline: 'Micro-investing in tech & global themes.',
    openUrl: 'https://www.spaceship.com.au/voyager/',
    howUrl: 'https://www.spaceship.com.au/voyager/how-it-works/',
    active: true
  },
  {
    id: 3,
    key: 'commsec',
    name: 'CommSec Pocket',
    accent: '#fdb913',
    tagline: 'ASX ETF micro-buys via CommSec.',
    openUrl: 'https://www.commsec.com.au/products/commsec-pocket.html',
    howUrl: 'https://www.commbank.com.au/articles/investing/commsec-pocket.html',
    active: true
  },
  {
    id: 4,
    key: 'stockspot',
    name: 'Stockspot',
    accent: '#00a2ae',
    tagline: 'Automated ETF portfolios & rebalancing.',
    openUrl: 'https://www.stockspot.com.au/',
    howUrl: 'https://www.stockspot.com.au/how-it-works',
    active: true
  },
  {
    id: 5,
    key: 'quietgrowth',
    name: 'QuietGrowth',
    accent: '#2bb673',
    tagline: 'Robo-advice & diversified portfolio automation.',
    openUrl: 'https://www.quietgrowth.com.au/',
    howUrl: 'https://www.quietgrowth.com.au/how-it-works',
    active: true
  }
]

function loadProviders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PROVIDERS
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr) || arr.length === 0) return DEFAULT_PROVIDERS
    return arr
  } catch {
    return DEFAULT_PROVIDERS
  }
}

function saveProviders(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export default function Providers(){
  const [providers, setProviders] = useState(() => loadProviders())
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    name: '', key: '', accent: '#4db5ff', tagline: '',
    openUrl: '', howUrl: '', active: true
  })
  const [filter, setFilter] = useState('all') // all | active | inactive
  const [q, setQ] = useState('')

  useEffect(()=>{ saveProviders(providers) }, [providers])

  const filtered = useMemo(()=>{
    let arr = providers
    if (filter === 'active') arr = arr.filter(p => !!p.active)
    if (filter === 'inactive') arr = arr.filter(p => !p.active)
    if (q.trim()) {
      const s = q.toLowerCase()
      arr = arr.filter(p =>
        p.name.toLowerCase().includes(s) ||
        p.key.toLowerCase().includes(s) ||
        (p.tagline||'').toLowerCase().includes(s)
      )
    }
    return arr
  }, [providers, filter, q])

  function resetForm(){
    setForm({ name:'', key:'', accent:'#4db5ff', tagline:'', openUrl:'', howUrl:'', active:true })
    setEditing(null)
  }

  function onEdit(p){
    setEditing(p.id)
    setForm({
      name: p.name, key: p.key, accent: p.accent, tagline: p.tagline,
      openUrl: p.openUrl, howUrl: p.howUrl, active: !!p.active
    })
  }

  function onDelete(id){
    if (!confirm('Delete this provider?')) return
    setProviders(prev => prev.filter(p => p.id !== id))
    if (editing === id) resetForm()
  }

  function onToggle(id){
    setProviders(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p))
  }

  function onSubmit(e){
    e.preventDefault()
    const payload = {
      name: form.name.trim(),
      key: form.key.trim(),
      accent: form.accent.trim() || '#4db5ff',
      tagline: form.tagline.trim(),
      openUrl: form.openUrl.trim(),
      howUrl: form.howUrl.trim(),
      active: !!form.active
    }
    if (!payload.name || !payload.key) {
      alert('Name and key are required.')
      return
    }
    if (editing) {
      setProviders(prev => prev.map(p => p.id === editing ? { ...p, ...payload } : p))
      resetForm()
    } else {
      const nextId = providers.length ? Math.max(...providers.map(p => p.id)) + 1 : 1
      setProviders(prev => [...prev, { id: nextId, ...payload }])
      resetForm()
    }
  }

  function exportJson(){
    const blob = new Blob([JSON.stringify(providers, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'providers.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function importJson(e){
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        if (!Array.isArray(data)) throw new Error('Invalid format')
        // normalize ids
        let id = 1
        const normalized = data.map(p => ({
          id: p.id ?? (id++),
          key: String(p.key || '').trim(),
          name: String(p.name || '').trim(),
          accent: String(p.accent || '#4db5ff').trim(),
          tagline: String(p.tagline || '').trim(),
          openUrl: String(p.openUrl || '').trim(),
          howUrl: String(p.howUrl || '').trim(),
          active: !!p.active
        }))
        setProviders(normalized)
        e.target.value = ''
      } catch (err) {
        alert('Import failed: ' + (err?.message || 'Unknown error'))
      }
    }
    reader.readAsText(file)
  }

  return (
    <Layout title="Providers" menu={menu}>
      <div className="grid">
        <div className="card">
          <div className="h2">Add / Edit Provider</div>
          <form onSubmit={onSubmit} style={{display:'grid', gap:10, marginTop:10}}>
            <div><div className="small">Name *</div><input className="input" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/></div>
            <div><div className="small">Key (unique, lowercase) *</div><input className="input" value={form.key} onChange={e=>setForm({...form, key:e.target.value})}/></div>
            <div><div className="small">Accent (hex)</div><input className="input" value={form.accent} onChange={e=>setForm({...form, accent:e.target.value})}/></div>
            <div><div className="small">Tagline</div><input className="input" value={form.tagline} onChange={e=>setForm({...form, tagline:e.target.value})}/></div>
            <div><div className="small">Open URL</div><input className="input" value={form.openUrl} onChange={e=>setForm({...form, openUrl:e.target.value})}/></div>
            <div><div className="small">How it works URL</div><input className="input" value={form.howUrl} onChange={e=>setForm({...form, howUrl:e.target.value})}/></div>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <input id="active" type="checkbox" checked={form.active} onChange={e=>setForm({...form, active:e.target.checked})}/>
              <label htmlFor="active" className="small">Active</label>
            </div>
            <div style={{display:'flex', gap:10}}>
              <button className="btn" type="submit">{editing ? 'Save Changes' : 'Add Provider'}</button>
              {editing && <button type="button" className="btn secondary" onClick={resetForm}>Cancel</button>}
            </div>
          </form>
        </div>

        <div className="card">
          <div className="h2">Providers</div>
          <div style={{display:'flex', gap:10, margin:'10px 0', flexWrap:'wrap'}}>
            <select className="input" style={{maxWidth:220}} value={filter} onChange={e=>setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <input className="input" style={{maxWidth:260}} placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)} />
            <button className="btn secondary" onClick={exportJson}>Export JSON</button>
            <label className="btn secondary" style={{display:'inline-block', cursor:'pointer'}}>
              Import JSON
              <input type="file" accept="application/json" onChange={importJson} style={{display:'none'}} />
            </label>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Key</th>
                <th>Tagline</th>
                <th>Links</th>
                <th>Status</th>
                <th style={{textAlign:'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p=>(
                <tr key={p.id}>
                  <td>
                    <div style={{display:'flex', alignItems:'center', gap:8}}>
                      <span style={{width:12,height:12,borderRadius:'50%',background:p.accent,boxShadow:`0 0 10px ${p.accent}`}} />
                      {p.name}
                    </div>
                  </td>
                  <td>{p.key}</td>
                  <td className="small">{p.tagline}</td>
                  <td>
                    <a className="small" href={p.openUrl} target="_blank" rel="noreferrer">Open</a>
                    {' · '}
                    <a className="small" href={p.howUrl} target="_blank" rel="noreferrer">How</a>
                  </td>
                  <td>{p.active ? <span className="badge green">Active</span> : <span className="badge blue">Inactive</span>}</td>
                  <td style={{textAlign:'right', display:'flex', gap:8, justifyContent:'flex-end'}}>
                    <button className="btn secondary" onClick={()=>onEdit(p)}>Edit</button>
                    <button className="btn secondary" onClick={()=>onToggle(p.id)}>{p.active?'Disable':'Enable'}</button>
                    <button className="btn danger" onClick={()=>onDelete(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {filtered.length===0 && (
                <tr><td colSpan="6"><div className="small">No providers found.</div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
