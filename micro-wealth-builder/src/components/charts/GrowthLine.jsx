import React from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Title)

export default function GrowthLine({ labels, series }) {
  // series: [{ name: 'VAS.AX', data: [..] }, ...]
  const palette = ['#4db5ff','#7af0b2','#ffd166','#c3a6ff','#ff6b6b','#64d2ff','#ffc4e1']

  const data = {
    labels,
    datasets: series.map((s, i) => ({
      label: s.name,
      data: s.data,
      borderColor: palette[i % palette.length],
      backgroundColor: palette[i % palette.length],
      tension: 0.25,
      pointRadius: 2,
      borderWidth: 2
    }))
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: { display: true, text: 'Product Growth (Indexed to 100)' },
      legend: {
        position: 'bottom',
        labels: { color: '#9fb0d0' }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}`
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#9fb0d0' },
        grid: { color: 'rgba(255,255,255,0.04)' }
      },
      y: {
        ticks: { color: '#9fb0d0' },
        grid: { color: 'rgba(255,255,255,0.04)' },
        beginAtZero: false
      }
    }
  }

  return (
    <div style={{ height: 360 }}>
      <Line data={data} options={options} />
    </div>
  )
}
