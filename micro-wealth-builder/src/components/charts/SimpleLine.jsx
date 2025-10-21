// micro-wealth-builder/src/components/charts/SimpleLine.jsx
import React, { useMemo } from 'react'

export default function SimpleLine({ height = 360, series = [], labels = [] }) {
  // series: [{ name, data: [..], color }, ...]
  const padding = { top: 20, right: 20, bottom: 28, left: 40 }
  const width = 800 // viewBox width; SVG scales responsively
  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom

  const flat = series.flatMap(s => s.data)
  const minY = Math.min(...flat, 0)
  const maxY = Math.max(...flat, 1)
  const yPad = (maxY - minY) * 0.08
  const y0 = minY - yPad
  const y1 = maxY + yPad
  const n = Math.max(1, (labels?.length || series[0]?.data?.length || 1) - 1)

  const x = (i) => padding.left + (i / n) * innerW
  const y = (v) => padding.top + innerH * (1 - (v - y0) / (y1 - y0))

  const paths = useMemo(()=> series.map(s=>{
    const pts = s.data.map((v,i)=>[x(i), y(v)])
    let d = ''
    pts.forEach(([px,py], idx)=>{
      if(idx===0) d = `M ${px} ${py}`
      else {
        const prev = pts[idx-1]
        const mx = (prev[0] + px) / 2
        // smooth-ish cubic
        d += ` C ${mx} ${prev[1]} ${mx} ${py} ${px} ${py}`
      }
    })
    return { name: s.name, d, color: s.color }
  }), [series])

  const xTicks = useMemo(()=>{
    const step = Math.ceil(labels.length / 6) || 1
    return labels.map((l,i)=> (i % step === 0 ? {i,l} : null)).filter(Boolean)
  }, [labels])

  const yTicks = useMemo(()=>{
    const lines = 4
    return Array.from({length: lines+1}, (_,k)=>{
      const v = y0 + (k/lines)*(y1-y0)
      return { v, label: (v).toFixed(0), y: y(v) }
    })
  }, [y0, y1])

  return (
    <div style={{width:'100%'}}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
        {/* Grid Y */}
        {yTicks.map((t,idx)=>(
          <g key={idx}>
            <line x1={padding.left} y1={t.y} x2={width-padding.right} y2={t.y}
                  stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={padding.left-8} y={t.y+4} textAnchor="end" fontSize="10" fill="#9fb0d0">{t.label}</text>
          </g>
        ))}
        {/* Grid X */}
        {xTicks.map((t,idx)=>(
          <g key={idx}>
            <line x1={x(t.i)} y1={padding.top} x2={x(t.i)} y2={height-padding.bottom}
                  stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <text x={x(t.i)} y={height-padding.bottom+16} textAnchor="middle" fontSize="10" fill="#9fb0d0">{t.l}</text>
          </g>
        ))}
        {/* Lines */}
        {paths.map((p,idx)=>(
          <path key={idx} d={p.d} fill="none" stroke={p.color} strokeWidth="2.2" />
        ))}
        {/* Legend */}
        <g transform={`translate(${padding.left},${padding.top-8})`}>
          {series.map((s,i)=>(
            <g key={i} transform={`translate(${i*160},0)`}>
              <rect width="12" height="12" rx="2" fill={s.color} />
              <text x="18" y="11" fontSize="11" fill="#9fb0d0">{s.name}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}
