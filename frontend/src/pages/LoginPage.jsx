import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { NotebookPen } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/Field';
import { apiErrorMessage } from '@/lib/api';

export default function LoginPage() {
  const { login, isAuthenticated, ready } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/';

  if (ready && isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, 'Login gagal'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-primary">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500">
            <NotebookPen className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Logbook Proyek</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Masuk untuk mulai mencatat</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-line dark:bg-secondary"
        >
          <TextInput
            id="email"
            type="email"
            label="Email"
            placeholder="nama@perusahaan.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <TextInput
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-300" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" loading={submitting} className="w-full">
            Masuk
          </Button>
        </form>
      </div>
    </div>
  );
}
