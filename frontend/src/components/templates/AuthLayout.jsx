export default function AuthLayout({ children }) {
  return (
    <main className="auth-layout">
      <section className="panel auth-panel">
        <h1>Laundry Management System</h1>
        {children}
      </section>
    </main>
  );
}
