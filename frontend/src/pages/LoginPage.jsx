import AuthLayout from '../components/templates/AuthLayout';
import LoginForm from '../components/organisms/LoginForm';

export default function LoginPage({ onLogin }) {
  return (
    <AuthLayout>
      <p className="muted">Sign in to manage laundry orders.</p>
      <LoginForm onLogin={onLogin} />
    </AuthLayout>
  );
}
