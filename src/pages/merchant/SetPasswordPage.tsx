import React, { useId, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, extractApiError } from '../../lib/api';
import { useDocumentTitle } from '../../lib/useDocumentTitle';

/** Shared by staff invitations and "forgot password" emails: both link here with ?token=&email=. */
export const SetPasswordPage: React.FC = () => {
  useDocumentTitle('Set your password · Merchant Console');
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [email, setEmail] = useState(params.get('email') || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const ids = { email: useId(), password: useId(), confirm: useId() };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError('Use at least 8 characters with letters and numbers.');
      return;
    }
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/auth/password/reset', {
        email: email.trim().toLowerCase(),
        token,
        password,
        password_confirmation: confirm,
      });
      setDone(true);
    } catch (err: any) {
      setError(extractApiError(err, 'This link is invalid or has expired. Ask for a new invitation or reset link.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-svh flex items-center justify-center bg-[#f5f4f0] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h1 className="text-xl font-bold text-slate-900">Set your password</h1>

        {!token ? (
          <p role="alert" className="text-sm text-rose-700">
            This page needs the link from your invitation or password-reset email. Open the link from the email again.
          </p>
        ) : done ? (
          <div role="status" className="space-y-3 text-sm">
            <p className="text-emerald-800 font-semibold">Your password has been set.</p>
            <Link to="/merchant" className="inline-block px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold">
              Sign in to the merchant console
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-sm" noValidate>
            <div>
              <label htmlFor={ids.email} className="block font-semibold text-slate-700 mb-1">
                Email
              </label>
              <input
                id={ids.email}
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg"
              />
            </div>
            <div>
              <label htmlFor={ids.password} className="block font-semibold text-slate-700 mb-1">
                New password
              </label>
              <input
                id={ids.password}
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg"
              />
              <p className="text-xs text-slate-500 mt-1">At least 8 characters, with letters and numbers.</p>
            </div>
            <div>
              <label htmlFor={ids.confirm} className="block font-semibold text-slate-700 mb-1">
                Confirm new password
              </label>
              <input
                id={ids.confirm}
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-3 py-2 rounded-lg"
              />
            </div>
            {error && (
              <p role="alert" className="text-rose-700 font-semibold">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-slate-900 text-white font-semibold cursor-pointer disabled:opacity-60"
            >
              {submitting ? 'Saving…' : 'Set password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
