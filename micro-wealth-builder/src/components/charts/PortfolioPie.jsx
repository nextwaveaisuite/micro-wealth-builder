// micro-wealth-builder/src/components/charts/PortfolioPie.jsx
import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend, Title)

export default function PortfolioPie({ labels, values }) {
  const data = {
    labels,
    datasets: [
      {
        label: 'Allocation (%)',
        data: values,
        backgroundColor: ['#4db5ff','#7af0b2','#ffd166','#c3a6ff','#ff6b6b'],
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 2
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: { display: true, text: 'Portfolio Allocation' },
      legend: { position: 'bottom', labels: { color: '#9fb0d0', boxWidth: 14 } },
      tooltip: {
        callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed}%` }
      }
    }
  }

  return (
    <div style={{ height: 320 }}>
      <Doughnut data={data} options={options} />
    </div>
  )
}
