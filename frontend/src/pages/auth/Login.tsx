import { useState, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet, Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { GlassInput } from '@/components/glass/GlassInput';
import { LiquidButton } from '@/components/glass/LiquidButton';
import { OceanBackground } from '@/components/water/OceanBackground';
import { useAuth } from '@/context/AuthContext';
import { colors, gradients, radius, shadows } from '@/theme/tokens';
import { linearGradient } from '@/theme/gradient';

type Step = 'email' | 'otp';

function roleRedirect(role: string) {
  if (role === 'superadmin') return '/console';
  if (role === 'admin') return '/admin';
  return '/app';
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login, verifyOtp } = useAuth();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  async function handleEmail(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await login(email);
      setPendingEmail(result.email);
      setOtp(['', '', '', '', '', '']);
      setStep('otp');
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send OTP');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOtp(e: FormEvent) {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const user = await verifyOtp(pendingEmail, code);
      navigate(roleRedirect(user.role), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired OTP');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError(null);
    try {
      await login(pendingEmail);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  }

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) otpRefs[index - 1].current?.focus();
    if (e.key === 'ArrowRight' && index < 5) otpRefs[index + 1].current?.focus();
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(''));
      otpRefs[5].current?.focus();
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-5 py-12">
      <OceanBackground />
      <AnimatePresence mode="wait">
        {step === 'email' ? (
          <motion.div
            key="email"
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: [0.215, 0.61, 0.355, 1] }}
          >
            <div className="mb-8 flex flex-col items-center text-center">
              <div
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundImage: linearGradient(gradients.aquaGlow), boxShadow: shadows.glow(colors.cyan, 0.5) }}
              >
                <Droplet size={28} color={colors.textInverse} />
              </div>
              <h1
                className="text-2xl font-bold"
                style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}
              >
                Welcome Back
              </h1>
              <p className="mt-1.5 text-base" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
                Enter your email and we'll send you a login code
              </p>
            </div>

            <GlassSurface borderRadius={radius.xl} className="p-6">
              <form onSubmit={handleEmail}>
                <GlassInput
                  label="Email"
                  icon={Mail}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                {error && (
                  <p className="mb-4 -mt-1 text-sm" style={{ color: colors.danger, fontFamily: 'var(--font-body)' }}>
                    {error}
                  </p>
                )}

                <LiquidButton type="submit" label={submitting ? 'Sending Code…' : 'Send Login Code'} fullWidth disabled={submitting} />
              </form>
            </GlassSurface>

            <div className="mt-8 flex justify-center">
              <span className="text-base" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
                Don't have an account?{' '}
              </span>
              <Link
                to="/signup"
                className="ml-1 text-base font-bold"
                style={{ color: colors.cyan, fontFamily: 'var(--font-body)' }}
              >
                Sign Up
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="otp"
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: [0.215, 0.61, 0.355, 1] }}
          >
            <button
              type="button"
              onClick={() => { setStep('email'); setError(null); }}
              className="mb-6 flex items-center gap-2 text-sm"
              style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <div className="mb-8 flex flex-col items-center text-center">
              <div
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundImage: linearGradient(gradients.aquaGlow), boxShadow: shadows.glow(colors.cyan, 0.5) }}
              >
                <Mail size={28} color={colors.textInverse} />
              </div>
              <h1
                className="text-2xl font-bold"
                style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}
              >
                Check your email
              </h1>
              <p className="mt-1.5 text-base" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
                We sent a 6-digit code to
              </p>
              <p className="mt-0.5 text-sm font-semibold" style={{ color: colors.cyan, fontFamily: 'var(--font-body)' }}>
                {pendingEmail}
              </p>
            </div>

            <GlassSurface borderRadius={radius.xl} className="p-6">
              <form onSubmit={handleOtp}>
                <div className="mb-5 flex justify-center gap-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={otpRefs[i]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="h-14 w-11 rounded-xl text-center text-xl font-bold outline-none transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: `1.5px solid ${digit ? colors.cyan : 'rgba(255,255,255,0.14)'}`,
                        color: colors.textPrimary,
                        fontFamily: 'var(--font-heading)',
                        boxShadow: digit ? `0 0 0 2px ${colors.cyan}33` : 'none',
                      }}
                    />
                  ))}
                </div>

                {error && (
                  <p className="mb-4 text-sm text-center" style={{ color: colors.danger, fontFamily: 'var(--font-body)' }}>
                    {error}
                  </p>
                )}

                <LiquidButton
                  type="submit"
                  label={submitting ? 'Verifying…' : 'Verify & Sign In'}
                  fullWidth
                  disabled={submitting || otp.join('').length !== 6}
                />
              </form>
            </GlassSurface>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="flex items-center gap-1.5 text-sm transition-opacity disabled:opacity-50"
                style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}
              >
                <RefreshCw size={13} className={resending ? 'animate-spin' : ''} />
                {resending ? 'Sending…' : 'Resend code'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
