import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <span className="navbar-brand">TaskFlow_</span>
        <Link to="/dashboard" style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>My Tasks</Link>
        {user?.role === 'admin' && (
          <Link to="/admin" style={{ fontSize: '0.88rem', color: 'var(--warn)' }}>Admin Panel</Link>
        )}
      </div>
      <div className="navbar-user">
        <span>{user?.name}</span>
        <span className={`role-badge ${user?.role}`}>{user?.role}</span>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
