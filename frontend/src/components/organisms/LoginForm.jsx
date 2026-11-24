import { useState } from 'react';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import FormField from '../molecules/FormField';

export default function LoginForm({ onLogin }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    if (pending) return;
    const credentials = Object.fromEntries(new FormData(event.currentTarget));
    setPending(true);
    setError('');
    try {
      await onLogin(credentials);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <FormField label="Email">
        {(props) => <Input {...props} name="email" type="email" autoComplete="username" required />}
      </FormField>
      <FormField label="Password">
        {(props) => <Input {...props} name="password" type="password" autoComplete="current-password" required />}
      </FormField>
      {error && <p className="alert alert--error" role="alert">{error}</p>}
      <Button type="submit" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</Button>
    </form>
  );
}
