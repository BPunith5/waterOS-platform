import { useEffect, useState } from 'react';
import { Wifi, Radio, Info, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

const BROKER_URL = 't611713b.ala.asia-southeast1.emqxsl.com:8883';

export function ConsoleSettings() {
  const [protocol, setProtocol] = useState<'mqtt' | 'http' | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [loadError, setLoadError] = useState(false);

  function fetchConfig() {
    setLoadError(false);
    setProtocol(null);
    api.systemConfig.get()
      .then(c => setProtocol(c.telemetryProtocol))
      .catch(() => { setProtocol(null); setLoadError(true); });
  }

  useEffect(() => {
    fetchConfig();
  }, []);

  async function handleSelect(next: 'mqtt' | 'http') {
    if (next === protocol || saving) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await api.systemConfig.setProtocol(next);
      setProtocol(res.telemetryProtocol);
      setFeedback({ ok: true, msg: `Switched to ${next.toUpperCase()} mode` });
    } catch {
      setFeedback({ ok: false, msg: 'Failed to update — try again.' });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold mb-2" style={{ color: '#F4FBFF', fontFamily: 'var(--font-heading)' }}>
        System Settings
      </h1>
      <p className="text-sm mb-6" style={{ color: 'rgba(244,251,255,0.45)', fontFamily: 'var(--font-body)' }}>
        Global configuration visible only to super admins. Regular users are unaffected by these settings.
      </p>

      {/* Protocol Toggle Card */}
      <div className="rounded-2xl p-5 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2 mb-1">
          <Radio size={15} color="rgba(244,251,255,0.6)" />
          <h2 className="text-sm font-semibold" style={{ color: 'rgba(244,251,255,0.68)', fontFamily: 'var(--font-heading)' }}>
            Telemetry Protocol
          </h2>
        </div>
        <p className="text-xs mb-4" style={{ color: 'rgba(244,251,255,0.35)', fontFamily: 'var(--font-body)' }}>
          Controls how the mobile app receives sensor data. Regular users see no difference.
        </p>

        {protocol === null ? (
          <div className="h-20 flex items-center justify-center">
            {loadError ? (
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs" style={{ color: '#FB7185', fontFamily: 'var(--font-body)' }}>
                  Failed to load — could not reach server.
                </p>
                <button
                  onClick={fetchConfig}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80"
                  style={{ background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.25)', color: '#FB7185', fontFamily: 'var(--font-body)' }}
                >
                  <RefreshCw size={12} />
                  Retry
                </button>
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: '#4DE8E6' }} />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {/* MQTT Option */}
            <button
              onClick={() => handleSelect('mqtt')}
              disabled={saving}
              className="rounded-xl p-4 text-left transition-all"
              style={{
                background: protocol === 'mqtt' ? 'rgba(77,232,230,0.1)' : 'rgba(255,255,255,0.03)',
                border: protocol === 'mqtt' ? '1.5px solid rgba(77,232,230,0.5)' : '1px solid rgba(255,255,255,0.08)',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving && protocol !== 'mqtt' ? 0.5 : 1,
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Wifi size={16} color={protocol === 'mqtt' ? '#4DE8E6' : 'rgba(244,251,255,0.4)'} />
                <span className="text-sm font-semibold" style={{ color: protocol === 'mqtt' ? '#4DE8E6' : 'rgba(244,251,255,0.6)', fontFamily: 'var(--font-heading)' }}>
                  MQTT
                </span>
                {protocol === 'mqtt' && (
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(77,232,230,0.15)', color: '#4DE8E6', fontFamily: 'var(--font-body)' }}>
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs" style={{ color: 'rgba(244,251,255,0.35)', fontFamily: 'var(--font-body)' }}>
                Real-time via EMQX broker. ESP32 publishes directly.
              </p>
            </button>

            {/* HTTP Option */}
            <button
              onClick={() => handleSelect('http')}
              disabled={saving}
              className="rounded-xl p-4 text-left transition-all"
              style={{
                background: protocol === 'http' ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
                border: protocol === 'http' ? '1.5px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.08)',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving && protocol !== 'http' ? 0.5 : 1,
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Radio size={16} color={protocol === 'http' ? 'rgba(244,251,255,0.8)' : 'rgba(244,251,255,0.4)'} />
                <span className="text-sm font-semibold" style={{ color: protocol === 'http' ? 'rgba(244,251,255,0.9)' : 'rgba(244,251,255,0.6)', fontFamily: 'var(--font-heading)' }}>
                  HTTP
                </span>
                {protocol === 'http' && (
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(244,251,255,0.7)', fontFamily: 'var(--font-body)' }}>
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs" style={{ color: 'rgba(244,251,255,0.35)', fontFamily: 'var(--font-body)' }}>
                Polling every 30s via REST API. No broker required.
              </p>
            </button>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div
            className="mt-3 text-xs px-3 py-2 rounded-lg"
            style={{
              background: feedback.ok ? 'rgba(77,232,230,0.08)' : 'rgba(251,113,133,0.08)',
              border: `1px solid ${feedback.ok ? 'rgba(77,232,230,0.2)' : 'rgba(251,113,133,0.2)'}`,
              color: feedback.ok ? '#4DE8E6' : '#FB7185',
              fontFamily: 'var(--font-body)',
            }}
          >
            {feedback.msg}
          </div>
        )}
      </div>

      {/* Info row — broker details */}
      {protocol === 'mqtt' && (
        <div className="rounded-xl px-4 py-3 flex items-start gap-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Info size={14} color="rgba(244,251,255,0.3)" style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <p className="text-xs" style={{ color: 'rgba(244,251,255,0.35)', fontFamily: 'var(--font-body)' }}>
              <span style={{ color: 'rgba(244,251,255,0.55)' }}>Broker:</span> {BROKER_URL}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(244,251,255,0.35)', fontFamily: 'var(--font-body)' }}>
              ESP32 must publish to <span style={{ color: 'rgba(244,251,255,0.55)' }}>aquanigha/&#123;deviceId&#125;/telemetry</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
