import { useState } from 'react'
import RiskMap    from './components/RiskMap'
import IotBuilding from './components/IotBuilding'

const VIEWS = [
  { id: 'map',      label: 'Riesgo territorial' },
  { id: 'building', label: 'Digital twin IoT'   },
]

export default function App() {
  const [view, setView] = useState('map')

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 20px',
        background: 'rgba(10,10,20,0.95)',
        borderBottom: '0.5px solid rgba(255,255,255,0.08)',
      }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: '#555', marginRight: 8, fontFamily: 'sans-serif' }}>
          Territorial Intelligence
        </span>
        {VIEWS.map(v => (
          <button key={v.id} onClick={() => setView(v.id)}
            style={{
              padding: '5px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
              fontFamily: 'sans-serif',
              background: view === v.id ? 'rgba(55,138,221,0.15)' : 'transparent',
              border: view === v.id ? '0.5px solid #378ADD' : '0.5px solid rgba(255,255,255,0.12)',
              color: view === v.id ? '#378ADD' : '#666',
            }}>
            {v.label}
          </button>
        ))}
      </div>
      <div style={{ paddingTop: 44 }}>
        {view === 'map'      && <RiskMap />}
        {view === 'building' && <IotBuilding />}
      </div>
    </div>
  )
}