import { useState } from 'react'
import { MapContainer, TileLayer, Polygon, CircleMarker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const YEARS = [2025, 2030, 2040, 2050]

const RISK_SCENARIOS = {
  2025: { floodOpacity: 0.15, heatOpacity: 0.12, label: 'Riesgo actual' },
  2030: { floodOpacity: 0.28, heatOpacity: 0.22, label: 'Proyección 2030' },
  2040: { floodOpacity: 0.45, heatOpacity: 0.38, label: 'Proyección 2040' },
  2050: { floodOpacity: 0.65, heatOpacity: 0.55, label: 'Proyección 2050' },
}

const ASSETS = [
  { id: 1, name: 'Hotel Meridian', lat: 39.470, lng: -0.376, type: 'Hotel',    risk: 'high'   },
  { id: 2, name: 'Torre Oficinas', lat: 39.475, lng: -0.381, type: 'Oficinas', risk: 'medium' },
  { id: 3, name: 'Hospital Norte', lat: 39.479, lng: -0.369, type: 'Hospital', risk: 'low'    },
  { id: 4, name: 'Puerto Seco',    lat: 39.465, lng: -0.390, type: 'Puerto',   risk: 'high'   },
]

const FLOOD_ZONE = [
  [39.460, -0.395], [39.460, -0.360],
  [39.485, -0.360], [39.485, -0.395],
]

const HEAT_ZONE = [
  [39.463, -0.388], [39.463, -0.368],
  [39.480, -0.368], [39.480, -0.388],
]

const RISK_COLOR = { high: '#E24B4A', medium: '#EF9F27', low: '#1D9E75' }
const RISK_LABEL = { high: 'Alto',    medium: 'Medio',   low: 'Bajo'    }

function FlyTo({ center }) {
  const map = useMap()
  map.flyTo(center, 15, { duration: 1.2 })
  return null
}

export default function RiskMap() {
  const [yearIndex, setYearIndex] = useState(0)
  const [selected, setSelected]   = useState(null)
  const [flyTo, setFlyTo]         = useState(null)

  const year     = YEARS[yearIndex]
  const scenario = RISK_SCENARIOS[year]

  function handleAssetClick(asset) {
    setSelected(asset)
    setFlyTo([asset.lat, asset.lng])
    setTimeout(() => setFlyTo(null), 100)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0a0a', fontFamily: 'sans-serif' }}>

      <div style={{
        width: 260, flexShrink: 0, background: 'rgba(10,10,20,0.97)',
        borderRight: '0.5px solid rgba(255,255,255,0.08)',
        padding: '20px 16px', color: 'white', display: 'flex', flexDirection: 'column', gap: 20,
        zIndex: 1000,
      }}>
        <div>
          <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            Territorial Risk Intelligence
          </div>
          <div style={{ fontSize: 18, fontWeight: 500 }}>{scenario.label}</div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>Proyección temporal</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {YEARS.map((y, i) => (
              <button
                key={y}
                onClick={() => setYearIndex(i)}
                style={{
                  flex: 1, padding: '7px 0', borderRadius: 6, cursor: 'pointer', fontSize: 12,
                  border: yearIndex === i ? '1px solid #378ADD' : '0.5px solid rgba(255,255,255,0.12)',
                  background: yearIndex === i ? 'rgba(55,138,221,0.15)' : 'transparent',
                  color: yearIndex === i ? '#378ADD' : '#666',
                  fontWeight: yearIndex === i ? 600 : 400,
                  transition: 'all 0.15s',
                }}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>Capas de riesgo</div>
          {[
            { color: '#378ADD', label: 'Inundación',    opacity: Math.round(scenario.floodOpacity * 100) + '%' },
            { color: '#E24B4A', label: 'Isla de calor', opacity: Math.round(scenario.heatOpacity  * 100) + '%' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
                <span style={{ fontSize: 12, color: '#ccc' }}>{l.label}</span>
              </div>
              <span style={{ fontSize: 10, color: '#555' }}>{l.opacity}</span>
            </div>
          ))}
        </div>

        <div>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>Activos monitorizados</div>
          {ASSETS.map(a => (
            <div key={a.id} onClick={() => handleAssetClick(a)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 10px', borderRadius: 6, cursor: 'pointer', marginBottom: 2,
                background: selected?.id === a.id ? 'rgba(255,255,255,0.07)' : 'transparent',
                border: selected?.id === a.id ? '0.5px solid rgba(255,255,255,0.12)' : '0.5px solid transparent',
              }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: RISK_COLOR[a.risk], flexShrink: 0,
                boxShadow: `0 0 6px ${RISK_COLOR[a.risk]}` }} />
              <div>
                <div style={{ fontSize: 12, color: '#ddd' }}>{a.name}</div>
                <div style={{ fontSize: 10, color: '#555' }}>{a.type}</div>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div style={{
            marginTop: 'auto', padding: '12px 14px', borderRadius: 8,
            border: `0.5px solid ${RISK_COLOR[selected.risk]}`,
            background: 'rgba(255,255,255,0.03)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{selected.name}</div>
              <button onClick={() => setSelected(null)}
                style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0 }}>
                ×
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: RISK_COLOR[selected.risk] }} />
              <span style={{ fontSize: 11, color: RISK_COLOR[selected.risk] }}>
                Riesgo {RISK_LABEL[selected.risk]} — {year}
              </span>
            </div>
            <div style={{ fontSize: 11, color: '#666', lineHeight: 1.6 }}>
              {selected.risk === 'high'
                ? `Zona de inundación activa en proyección ${year}. Requiere evaluación urgente de resiliencia.`
                : selected.risk === 'medium'
                ? `Riesgo moderado por isla de calor. Monitorización recomendada a partir de 2030.`
                : `Activo en zona de bajo riesgo climático proyectado hasta 2050.`}
            </div>
          </div>
        )}
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer
          key={year}
          center={[39.470, -0.376]} zoom={13}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com">CARTO</a>'
          />
          {flyTo && <FlyTo center={flyTo} />}
          <Polygon
            positions={FLOOD_ZONE}
            pathOptions={{ color: '#378ADD', fillColor: '#378ADD', fillOpacity: scenario.floodOpacity, weight: 0 }}
          />
          <Polygon
            positions={HEAT_ZONE}
            pathOptions={{ color: '#E24B4A', fillColor: '#E24B4A', fillOpacity: scenario.heatOpacity, weight: 0 }}
          />
          {ASSETS.map(a => (
            <CircleMarker key={a.id} center={[a.lat, a.lng]} radius={8}
              pathOptions={{ color: 'white', weight: 1.5, fillColor: RISK_COLOR[a.risk], fillOpacity: 1 }}
              eventHandlers={{ click: () => handleAssetClick(a) }}>
              <Popup>
                <strong>{a.name}</strong><br />
                {a.type} · Riesgo {RISK_LABEL[a.risk]}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

    </div>
  )
}