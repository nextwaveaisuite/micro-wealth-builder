// micro-wealth-builder/src/components/charts/SimplePie.jsx
import React, { useMemo } from 'react'

function pctToRadian(p){ return (p/100)*2*Math.PI }

export default function SimplePie({ size = 300, values = [], labels = [], colors = [] }) {
  const radius = size / 2
  const strokeW = radius // full pie (donut with inner radius ~0)
  const C = radius
  const r = radius - strokeW/2

  const total = values.reduce((a,b)=>a+b,0) || 1
  const slices = useMemo(()=>{
    let acc = 0
    return values.map((v, i) => {
      const pct = (v / total) * 100
      const start = pctToRadian(acc)
      const end = pctToRadian(acc + pct)
      acc += pct
      return { pct, start, end, color: colors[i % colors.length], label: labels[i] ?? `Item ${i+1}` }
    })
  }, [values, labels, colors, total])

  const circumference = 2 * Math.PI * r

  return (
    <div style={{display:'grid', gap:10}}>
      <div style={{width:'100%', maxWidth:size, margin:'0 auto'}}>
        <svg width="100%" viewBox={`0 0 ${size} ${size}`}>
          <circle cx={C} cy={C} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeW} />
          {slices.map((s, i) => {
            const arcLen = (s.pct/100) * circumference
            const offset = circumference - arcLen - (slices.slice(0,i).reduce((k,t)=>k+(t.pct/100)*circumference,0))
            return (
              <circle
                key={i}
                cx={C} cy={C} r={r} fill="none"
                stroke={s.color} strokeWidth={strokeW}
                strokeDasharray={`${arcLen} ${circumference - arcLen}`}
                strokeDashoffset={offset}
                strokeLinecap="butt"
              />
            )
          })}
        </svg>
      </div>
      <div style={{display:'grid', gap:6}}>
        {slices.map((s,i)=>(
          <div key={i} style={{display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#9fb0d0'}}>
            <span style={{width:12,height:12,borderRadius:3,background:s.color,boxShadow:`0 0 6px ${s.color}`}} />
            <span style={{color:'#f2f6ff'}}>{s.label}</span>
            <span style={{marginLeft:6}}>{values[i]}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

