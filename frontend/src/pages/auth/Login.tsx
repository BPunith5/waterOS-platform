import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Droplet, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { GlassInput } from '@/components/glass/GlassInput';
import { LiquidButton } from '@/components/glass/LiquidButton';
import { OceanBackground } from '@/components/water/OceanBackground';
import { useAuth } from '@/context/AuthContext';
import { colors, gradients, radius, shadows } from '@/theme/tokens';
import { linearGradient } from '@/theme/gradient';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-5 py-12">
      <OceanBackground />
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }}
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
            Sign in to dive into your dashboard
          </p>
        </div>

        <GlassSurface borderRadius={radius.xl} className="p-6">
          <form onSubmit={handleSubmit}>
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
            <GlassInput
              label="Password"
              icon={Lock}
              type={hidePassword ? 'password' : 'text'}
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              rightIcon={hidePassword ? Eye : EyeOff}
              onRightIconClick={() => setHidePassword((v) => !v)}
              required
            />

            {error && (
              <p className="mb-4 -mt-1 text-sm" style={{ color: colors.danger, fontFamily: 'var(--font-body)' }}>
                {error}
              </p>
            )}

            <LiquidButton type="submit" label={submitting ? 'Signing In…' : 'Sign In'} fullWidth disabled={submitting} />
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
    </div>
  );
}
