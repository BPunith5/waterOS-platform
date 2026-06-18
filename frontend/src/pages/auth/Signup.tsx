import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, UserPlus, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { GlassInput } from '@/components/glass/GlassInput';
import { LiquidButton } from '@/components/glass/LiquidButton';
import { LiquidCheckbox } from '@/components/glass/LiquidCheckbox';
import { PressableScale } from '@/components/glass/PressableScale';
import { OceanBackground } from '@/components/water/OceanBackground';
import { useAuth } from '@/context/AuthContext';
import { colors, gradients, radius, shadows } from '@/theme/tokens';
import { linearGradient } from '@/theme/gradient';

export function SignupPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const [agree, setAgree] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (!agree) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/app', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account');
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
        <PressableScale onClick={() => navigate(-1)} className="mb-4">
          <GlassSurface borderRadius={radius.pill} className="flex h-10 w-10 items-center justify-center">
            <ChevronLeft size={20} color={colors.textPrimary} />
          </GlassSurface>
        </PressableScale>

        <div className="mb-8 flex flex-col items-center text-center">
          <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundImage: linearGradient(gradients.aquaGlow), boxShadow: shadows.glow(colors.cyan, 0.5) }}
          >
            <UserPlus size={26} color={colors.textInverse} />
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}
          >
            Create Account
          </h1>
          <p className="mt-1.5 text-base" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
            Join WaterOS and start monitoring smarter
          </p>
        </div>

        <GlassSurface borderRadius={radius.xl} className="p-6">
          <form onSubmit={handleSubmit}>
            <GlassInput
              label="Full Name"
              icon={User}
              placeholder="Arjun Mehta"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              rightIcon={hidePassword ? Eye : EyeOff}
              onRightIconClick={() => setHidePassword((v) => !v)}
              required
              minLength={6}
            />
            <GlassInput
              label="Confirm Password"
              icon={Lock}
              type={hidePassword ? 'password' : 'text'}
              placeholder="••••••••"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />

            <div className="mt-1 mb-2 flex items-start gap-3">
              <LiquidCheckbox checked={agree} onToggle={() => setAgree((v) => !v)} />
              <p className="text-xs leading-[18px]" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
                I agree to the <span style={{ color: colors.cyan, fontWeight: 600 }}>Terms of Service</span> and{' '}
                <span style={{ color: colors.cyan, fontWeight: 600 }}>Privacy Policy</span>
              </p>
            </div>

            {error && (
              <p className="mb-2 text-sm" style={{ color: colors.danger, fontFamily: 'var(--font-body)' }}>
                {error}
              </p>
            )}

            <LiquidButton
              type="submit"
              label={submitting ? 'Creating Account…' : 'Create Account'}
              fullWidth
              disabled={submitting}
              className="mt-2"
            />
          </form>
        </GlassSurface>

        <div className="mt-8 flex justify-center">
          <span className="text-base" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
            Already have an account?{' '}
          </span>
          <Link
            to="/login"
            className="ml-1 text-base font-bold"
            style={{ color: colors.cyan, fontFamily: 'var(--font-body)' }}
          >
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
