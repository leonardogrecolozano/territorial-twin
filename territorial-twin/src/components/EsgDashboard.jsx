import { useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const ASSETS = [
  { id: 1, name: 'Hotel Meridian',  type: 'Hotel'    },
  { id: 2, name: 'Torre Oficinas',  type: 'Oficinas' },
  { id: 3, name: 'Hospital Norte',  type: 'Hospital' },
  { id: 4, name: 'Puerto Seco',     type: 'Puerto'   },
]

const ASSET_DATA = {
  1: {
    esgScore: 61,
    carbon:   [
      { year: '2021', value: 890 }, { year: '2022', value: 820 },
      { year: '2023', value: 740 }, { year: '2024', value: 680 },
      { year: '2025', value: 610 },
    ],
    energy:   [
      { month: 'Ene', value: 142 }, { month: 'Feb', value: 128 },
      { month: 'Mar', value: 135 }, { month: 'Abr', value: 119 },
      { month: 'May', value: 124 }, { month: 'Jun', value: 158 },
    ],
    metrics: [
      { label: 'Emisiones CO₂',    value: '610 t/año',  trend: -11, status: 'ok'      },
      { label: 'Consumo energético', value: '134 kWh/m²', trend: -6,  status: 'ok'      },
      { label: 'Agua consumida',   value: '4.2 m³/día', trend: +3,  status: 'warning' },
      { label: 'Residuos generados', value: '1.8 t/mes',  trend: -8,  status: 'ok'      },
    ],
    climateRisk: { flood: 82, heat: 67, material: 54 },
  },
  2: {
    esgScore: 74,
    carbon:   [
      { year: '2021', value: 540 }, { year: '2022', value: 490 },
      { year: '2023', value: 445 }, { year: '2024', value: 398 },
      { year: '2025', value: 362 },
    ],
    energy:   [
      { month: 'Ene', value: 98  }, { month: 'Feb', value: 91  },
      { month: 'Mar', value: 87  }, { month: 'Abr', value: 82  },
      { month: 'May', value: 79  }, { month: 'Jun', value: 94  },
    ],
    metrics: [
      { label: 'Emisiones CO₂',    value: '362 t/año',  trend: -9,  status: 'ok' },
      { label: 'Consumo energético', value: '88 kWh/m²',  trend: -12, status: 'ok' },
      { label: 'Agua consumida',   value: '2.1 m³/día', trend: -4,  status: 'ok' },
      { label: 'Residuos generados', value: '0.9 t/mes',  trend: -5,  status: 'ok' },
    ],
    climateRisk: { flood: 45, heat: 58, material: 32 },
  },
  3: {
    esgScore: 58,
    carbon:   [
      { year: '2021', value: 1240 }, { year: '2022', value: 1180 },
      { year: '2023', value: 1090 }, { year: '2024', value: 1020 },
      { year: '2025', value: 960  },
    ],
    energy:   [
      { month: 'Ene', value: 198 }, { month: 'Feb', value: 187 },
      { month: 'Mar', value: 192 }, { month: 'Abr', value: 179 },
      { month: 'May', value: 184 }, { month: 'Jun', value: 201 },
    ],
    metrics: [
      { label: 'Emisiones CO₂',    value: '960 t/año',  trend: -6,  status: 'ok'      },
      { label: 'Consumo energético', value: '189 kWh/m²', trend: +2,  status: 'warning' },
      { label: 'Agua consumida',   value: '8.4 m³/día', trend: +5,  status: 'warning' },
      { label: 'Residuos generados', value: '3.2 t/mes',  trend: -2,  status: 'ok'      },
    ],
    climateRisk: { flood: 38, heat: 72, material: 61 },
  },
  4: {
    esgScore: 43,
    carbon:   [
      { year: '2021', value: 2100 }, { year: '2022', value: 2040 },
      { year: '2023', value: 1980 }, { year: '2024', value: 1870 },
      { year: '2025', value: 1760 },
    ],
    energy:   [
      { month: 'Ene', value: 312 }, { month: 'Feb', value: 298 },
      { month: 'Mar', value: 321 }, { month: 'Abr', value: 287 },
      { month: 'May', value: 304 }, { month: 'Jun', value: 334 },
    ],
    metrics: [
      { label: 'Emisiones CO₂',    value: '1760 t/año', trend: -6,  status: 'ok'      },
      { label: 'Consumo energético', value: '309 kWh/m²', trend: +4,  status: 'warning' },
      { label: 'Agua consumida',   value: '18 m³/día',  trend: +8,  status: 'alert'   },
      { label: 'Residuos generados', value: '12 t/mes',   trend: +2,  status: 'warning' },
    ],
    climateRisk: { flood: 91, heat: 55, material: 78 },
  },
}

const STATUS_COLOR = { ok: '#1D9E75', warning: '#EF9F27', alert: '#E24B4A' }

function ScoreRing({ score }) {
  const r = 42, stroke = 8
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = score >= 70 ? '#1D9E75' : score >= 50 ? '#EF9F27' : '#E24B4A'
  return (
    <svg width="110" height="110" viewBox="0 0 110 110">
      <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform="rotate(-90 55 55)" />
      <text x="55" y="50" textAnchor="middle" fill="white" fontSize="22" fontWeight="500">{score}</text>
      <text x="55" y="68" textAnchor="middle" fill="#555" fontSize="11">ESG Score</text>
    </svg>
  )
}

function RiskBar({ label, value }) {
  const color = value >= 70 ? '#E24B4A' : value >= 40 ? '#EF9F27' : '#1D9E75'
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: '#888' }}>{label}</span>
        <span style={{ fontSize: 11, color }}>{value}%</span>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 2, transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

export default function EsgDashboard() {
  const [selectedId, setSelectedId] = useState(1)
  const data = ASSET_DATA[selectedId]
  const asset = ASSETS.find(a => a.id === selectedId)

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0a0a', fontFamily: 'sans-serif', color: 'white', overflow: 'hidden' }}>

      <div style={{
        width: 200, flexShrink: 0,
        borderRight: '0.5px solid rgba(255,255,255,0.08)',
        padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
          Portfolio
        </div>
        {ASSETS.map(a => {
          const d = ASSET_DATA[a.id]
          const color = d.esgScore >= 70 ? '#1D9E75' : d.esgScore >= 50 ? '#EF9F27' : '#E24B4A'
          return (
            <div key={a.id} onClick={() => setSelectedId(a.id)}
              style={{
                padding: '10px 12px', borderRadius: 6, cursor: 'pointer',
                background: selectedId === a.id ? 'rgba(255,255,255,0.07)' : 'transparent',
                border: `0.5px solid ${selectedId === a.id ? 'rgba(255,255,255,0.15)' : 'transparent'}`,
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#ccc' }}>{a.name}</span>
                <span style={{ fontSize: 11, color, fontWeight: 500 }}>{d.esgScore}</span>
              </div>
              <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{a.type}</div>
            </div>
          )
        })}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              ESG Reporting
            </div>
            <div style={{ fontSize: 20, fontWeight: 500 }}>{asset.name}</div>
          </div>
          <ScoreRing score={data.esgScore} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {data.metrics.map(m => (
            <div key={m.label} style={{
              padding: '14px 16px', borderRadius: 8,
              background: 'rgba(255,255,255,0.03)',
              border: `0.5px solid ${STATUS_COLOR[m.status]}22`,
            }}>
              <div style={{ fontSize: 11, color: '#666', marginBottom: 6 }}>{m.label}</div>
              <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>{m.value}</div>
              <div style={{ fontSize: 11, color: m.trend < 0 ? '#1D9E75' : '#E24B4A' }}>
                {m.trend < 0 ? '↓' : '↑'} {Math.abs(m.trend)}% vs año anterior
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div style={{ padding: '16px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 12 }}>Emisiones CO₂ — evolución anual (t)</div>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={data.carbon}>
                <XAxis dataKey="year" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={{ background: '#111', border: '0.5px solid #333', borderRadius: 6, fontSize: 11 }} />
                <Line type="monotone" dataKey="value" stroke="#E24B4A" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ padding: '16px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 12 }}>Consumo energético — 2025 (kWh/m²)</div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={data.energy}>
                <XAxis dataKey="month" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} width={35} />
                <Tooltip contentStyle={{ background: '#111', border: '0.5px solid #333', borderRadius: 6, fontSize: 11 }} />
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                  {data.energy.map((_, i) => <Cell key={i} fill="#378ADD" fillOpacity={0.7} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ padding: '16px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 11, color: '#666', marginBottom: 14 }}>Exposición a riesgo climático — proyección 2050</div>
          <RiskBar label="Riesgo de inundación"         value={data.climateRisk.flood}    />
          <RiskBar label="Isla de calor urbano"          value={data.climateRisk.heat}     />
          <RiskBar label="Degradación de materiales"     value={data.climateRisk.material} />
        </div>

      </div>
    </div>
  )
}