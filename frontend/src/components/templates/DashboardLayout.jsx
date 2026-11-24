import Button from '../atoms/Button';

export default function DashboardLayout({ employee, onLogout, signingOut, children }) {
  return (
    <>
      <header className="app-header">
        <div className="shell header-content">
          <a className="brand" href="/dashboard">Laundry Management System</a>
          <div className="employee">
            <span>{employee.name}</span>
            <Button variant="secondary" onClick={onLogout} disabled={signingOut}>
              {signingOut ? 'Signing out…' : 'Log out'}
            </Button>
          </div>
        </div>
      </header>
      <main className="shell dashboard">{children}</main>
    </>
  );
}
