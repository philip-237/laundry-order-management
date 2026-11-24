import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { request } from './api/client';
import Button from './components/atoms/Button';
import AuthLayout from './components/templates/AuthLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<EmployeeApp page="login" />} />
      <Route path="/dashboard" element={<EmployeeApp page="dashboard" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function EmployeeApp({ page }) {
  const [employee, setEmployee] = useState(undefined);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    request('/auth/me', { signal: controller.signal }).then(setEmployee).catch((failure) => {
      if (failure.name === 'AbortError') return;
      if (failure.status === 401) setEmployee(null);
      else setError(failure.message);
    });
    return () => controller.abort();
  }, [attempt]);

  async function login(credentials) {
    setEmployee(await request('/auth/login', { method: 'POST', body: credentials }));
  }

  async function logout() {
    await request('/auth/logout', { method: 'POST' });
    setEmployee(null);
  }

  if (employee === undefined) {
    return (
      <AuthLayout>
        {error ? <>
          <p className="alert alert--error" role="alert">{error}</p>
          <Button onClick={() => { setError(''); setAttempt(attempt + 1); }}>Retry</Button>
        </> : <p role="status">Checking your session…</p>}
      </AuthLayout>
    );
  }

  if (page === 'login') {
    return employee ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={login} />;
  }

  return employee
    ? <DashboardPage employee={employee} onLogout={logout} onExpired={() => setEmployee(null)} />
    : <Navigate to="/login" replace />;
}
