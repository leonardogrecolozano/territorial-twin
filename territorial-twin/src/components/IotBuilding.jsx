import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

const FLOORS = [
  { id: 1, label: 'Planta baja', temp: 24.2, humidity: 58, energy: 12.4, air: 87, status: 'ok'      },
  { id: 2, label: 'Planta 1',    temp: 23.8, humidity: 61, energy: 9.8,  air: 92, status: 'ok'      },
  { id: 3, label: 'Planta 2',    temp: 26.1, humidity: 71, energy: 14.2, air: 64, status: 'warning' },
  { id: 4, label: 'Planta 3',    temp: 22.9, humidity: 55, energy: 8.1,  air: 95, status: 'ok'      },
  { id: 5, label: 'Planta 4',    temp: 28.4, humidity: 78, energy: 17.6, air: 48, status: 'alert'   },
  { id: 6, label: 'Cubierta',    temp: 31.2, humidity: 42, energy: 4.2,  air: 99, status: 'ok'      },
]

const STATUS_COLOR = { ok: '#1D9E75', warning: '#EF9F27', alert: '#E24B4A' }

function Gauge({ value, max, color, label, unit }) {
  const r = 28, stroke = 6
  const circ = 2 * Math.PI * r
  const pct  = Math.min(value / max, 1)
  const dash = pct * circ * 0.75
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke} strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
          strokeDashoffset={circ * 0.125} strokeLinecap="round" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ - dash + circ * 0.25}`}
          strokeDashoffset={circ * 0.125} strokeLinecap="round" />
        <text x="36" y="40" textAnchor="middle" fill="white" fontSize="13" fontWeight="500">
          {typeof value === 'number' ? value.toFixed(1) : value}
        </text>
      </svg>
      <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>{label}</div>
      <div style={{ fontSize: 9,  color: '#444' }}>{unit}</div>
    </div>
  )
}

export default function IotBuilding() {
  const mountRef  = useRef(null)
  const meshesRef = useRef([])
  const frameRef  = useRef(null)

  const [selected,  setSelected]  = useState(FLOORS[0])
  const [liveData,  setLiveData]  = useState(FLOORS)
  const [time,      setTime]      = useState(new Date().toLocaleTimeString())

  useEffect(() => {
    const el = mountRef.current
    const W  = el.clientWidth
    const H  = el.clientHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(window.devicePixelRatio)
    el.appendChild(renderer.domElement)

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100)
    camera.position.set(6, 8, 10)
    camera.lookAt(0, 3, 0)

    scene.add(new THREE.AmbientLight(0xffffff, 0.4))
    const dir = new THREE.DirectionalLight(0xffffff, 0.8)
    dir.position.set(5, 10, 5)
    scene.add(dir)

    const meshes = []
    FLOORS.forEach((f, i) => {
      const geo  = new THREE.BoxGeometry(2.8, 0.7, 2.8)
      const mat  = new THREE.MeshLambertMaterial({
        color: new THREE.Color(STATUS_COLOR[f.status]),
        transparent: true,
        opacity: 0.85,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(0, i * 0.85 + 0.35, 0)
      mesh.userData = { floorId: f.id }
      scene.add(mesh)
      meshes.push(mesh)

      const edges = new THREE.EdgesGeometry(geo)
      const line  = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 })
      )
      line.position.copy(mesh.position)
      scene.add(line)
    })
    meshesRef.current = meshes

    const raycaster = new THREE.Raycaster()
    const mouse     = new THREE.Vector2()

    const onClick = e => {
      const rect = el.getBoundingClientRect()
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(meshes)
      if (hits.length > 0) {
        const id = hits[0].object.userData.floorId
        setSelected(FLOORS.find(f => f.id === id))
      }
    }
    el.addEventListener('click', onClick)

    let t = 0
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)
      t += 0.005
      scene.rotation.y = Math.sin(t * 0.3) * 0.3
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameRef.current)
      el.removeEventListener('click', onClick)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => prev.map(f => ({
        ...f,
        temp:     parseFloat((f.temp     + (Math.random() - 0.5) * 0.4).toFixed(1)),
        humidity: parseFloat((f.humidity + (Math.random() - 0.5) * 1.0).toFixed(1)),
        energy:   parseFloat((f.energy   + (Math.random() - 0.5) * 0.6).toFixed(1)),
        air:      Math.min(100, Math.max(0, Math.round(f.air + (Math.random() - 0.5) * 2))),
      })))
      setTime(new Date().toLocaleTimeString())
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    meshesRef.current.forEach((mesh, i) => {
      mesh.material.color.set(new THREE.Color(STATUS_COLOR[liveData[i].status]))
    })
  }, [liveData])

  const live = liveData.find(f => f.id === selected.id) || selected

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0a0a', fontFamily: 'sans-serif', color: 'white' }}>

      <div style={{
        width: 200, flexShrink: 0,
        borderRight: '0.5px solid rgba(255,255,255,0.08)',
        padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
          Plantas
        </div>
        {liveData.map(f => (
          <div key={f.id} onClick={() => setSelected(f)}
            style={{
              padding: '8px 10px', borderRadius: 6, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: selected.id === f.id ? 'rgba(255,255,255,0.07)' : 'transparent',
              border: `0.5px solid ${selected.id === f.id ? 'rgba(255,255,255,0.15)' : 'transparent'}`,
            }}>
            <span style={{ fontSize: 12, color: '#ccc' }}>{f.label}</span>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: STATUS_COLOR[f.status],
              boxShadow: `0 0 5px ${STATUS_COLOR[f.status]}`,
            }} />
          </div>
        ))}

        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
          {Object.entries(STATUS_COLOR).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: v }} />
              <span style={{ fontSize: 10, color: '#555' }}>
                {k === 'ok' ? 'Normal' : k === 'warning' ? 'Aviso' : 'Alerta'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div ref={mountRef} style={{ flex: 1, cursor: 'pointer' }} />

      <div style={{
        width: 260, flexShrink: 0,
        borderLeft: '0.5px solid rgba(255,255,255,0.08)',
        padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            IoT en tiempo real
          </div>
          <div style={{ fontSize: 16, fontWeight: 500 }}>{selected.label}</div>
          <div style={{ fontSize: 10, color: '#444', marginTop: 2 }}>Actualizado: {time}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Gauge value={live.temp}     max={40}  color="#E24B4A" label="Temperatura" unit="°C"  />
          <Gauge value={live.humidity} max={100} color="#378ADD" label="Humedad"     unit="%"   />
          <Gauge value={live.energy}   max={25}  color="#EF9F27" label="Energía"     unit="kW"  />
          <Gauge value={live.air}      max={100} color="#1D9E75" label="Calidad aire" unit="IAQ" />
        </div>

        <div style={{
          padding: '12px 14px', borderRadius: 8,
          background: 'rgba(255,255,255,0.03)',
          border: `0.5px solid ${STATUS_COLOR[live.status]}`,
        }}>
          <div style={{ fontSize: 11, color: STATUS_COLOR[live.status], marginBottom: 6, fontWeight: 500 }}>
            {live.status === 'ok' ? 'Estado normal' : live.status === 'warning' ? 'Aviso activo' : 'Alerta crítica'}
          </div>
          <div style={{ fontSize: 11, color: '#666', lineHeight: 1.6 }}>
            {live.status === 'alert'
              ? `Temperatura (${live.temp}°C) y humedad (${live.humidity}%) fuera de rango. Riesgo de degradación acelerada de materiales.`
              : live.status === 'warning'
              ? `Humedad elevada (${live.humidity}%). Monitorización de condensación recomendada.`
              : `Todos los parámetros dentro de rangos óptimos.`}
          </div>
        </div>

        <div style={{ fontSize: 10, color: '#333', lineHeight: 1.7 }}>
          Datos actualizados cada 2 segundos simulando sensores IoT integrados con el modelo BIM del edificio.
        </div>
      </div>

    </div>
  )
}