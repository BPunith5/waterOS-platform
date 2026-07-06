import mqtt from 'mqtt'
import { useEffect, useRef, useState } from 'react'

const BROKER_URL = `wss://${import.meta.env.VITE_MQTT_HOST}:8084/mqtt`
const MQTT_USER = import.meta.env.VITE_MQTT_USERNAME
const MQTT_PASS = import.meta.env.VITE_MQTT_PASSWORD

export interface LiveTelemetry {
  deviceId: string
  waterLevel?: number
  ph?: number
  temperature?: number
  battery?: number
  signal?: number
  ts: Date
}

export function useMqttTelemetry(deviceIds: string[]) {
  const [telemetry, setTelemetry] = useState<Record<string, LiveTelemetry>>({})
  const [connected, setConnected] = useState(false)
  const clientRef = useRef<ReturnType<typeof mqtt.connect> | null>(null)

  useEffect(() => {
    if (!MQTT_USER || !deviceIds.length) return

    const client = mqtt.connect(BROKER_URL, {
      username: MQTT_USER,
      password: MQTT_PASS,
      clientId: `aquanigha-web-${crypto.randomUUID().slice(0, 8)}`,
      clean: true,
      reconnectPeriod: 5000,
    })

    clientRef.current = client

    client.on('connect', () => {
      setConnected(true)
      deviceIds.forEach(id => {
        client.subscribe(`aquanigha/${id}/telemetry`, { qos: 0 })
      })
    })

    client.on('message', (topic, payload) => {
      try {
        const parts = topic.split('/')
        const deviceId = parts[1]
        const data = JSON.parse(payload.toString())
        setTelemetry(prev => ({
          ...prev,
          [deviceId]: { deviceId, ...data, ts: new Date() },
        }))
      } catch { /* ignore malformed */ }
    })

    client.on('close', () => setConnected(false))

    return () => {
      client.end()
      clientRef.current = null
    }
  }, [deviceIds.join(',')])

  return { telemetry, connected }
}
