// Authentication component - Sign In / Sign Up UI
// Local-first app: auth is optional, only needed for cloud sync

import { useState } from 'react';
import { signIn, signUp, resetPassword } from '../lib/auth';

interface AuthProps {
  onSuccess?: () => void;
}

export function Auth({ onSuccess }: AuthProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    const result = await signIn(email, password);
    setIsLoading(false);

    if (result.success) {
      setEmail('');
      setPassword('');
      onSuccess?.();
    } else {
      setError(result.error);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    const result = await signUp(email, password);
    setIsLoading(false);

    if (result.success) {
      const message = result.message || 'Account created successfully!';
      setSuccessMessage(`${message} Check your email to confirm your account before signing in.`);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } else {
      setError(result.error);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(email);
    setIsLoading(false);

    if (result.success) {
      setSuccessMessage('Password reset email sent! Check your inbox.');
      setTimeout(() => {
        setMode('signin');
        setSuccessMessage('');
      }, 3000);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-green-700">Heal From It</h2>
        <p className="text-sm text-gray-500 mt-1">
          Sign in to sync your data across devices
        </p>
      </div>

      {/* Reset Password Mode */}
      {mode === 'reset' ? (
        <div>
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-green-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="p-3 text-sm text-green-700 bg-green-50 rounded-md border border-green-200">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              onMouseEnter={() => setHoveredBtn('reset')}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                width: '100%',
                padding: '10px 16px',
                backgroundColor: hoveredBtn === 'reset' ? '#15803d' : '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              {isLoading ? 'Sending...' : 'Send Reset Email'}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError('');
                setSuccessMessage('');
              }}
              className="w-full text-sm text-green-600 hover:text-green-700 underline"
            >
              Back to sign in
            </button>
          </form>
        </div>
      ) : (
        /* Sign In / Sign Up Mode */
        <div className="flex flex-col gap-4">
          {/* Toggle Buttons */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                mode === 'signin'
                  ? 'text-green-700 border-b-2 border-green-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                mode === 'signup'
                  ? 'text-green-700 border-b-2 border-green-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Sign In Form */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="flex flex-col gap-4">
              <div>
                <label htmlFor="signin-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="signin-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-green-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label htmlFor="signin-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="signin-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-green-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                onMouseEnter={() => setHoveredBtn('signin')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  backgroundColor: hoveredBtn === 'signin' ? '#15803d' : '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('reset');
                  setError('');
                }}
                className="w-full text-sm text-green-600 hover:text-green-700 underline"
              >
                Forgot password?
              </button>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="flex flex-col gap-4">
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-green-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-green-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label htmlFor="signup-confirm" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="signup-confirm"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-green-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="p-3 text-sm text-green-700 bg-green-50 rounded-md border border-green-200">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                onMouseEnter={() => setHoveredBtn('signup')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  backgroundColor: hoveredBtn === 'signup' ? '#15803d' : '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
