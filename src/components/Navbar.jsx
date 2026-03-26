import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        BlogHub
      </Link>
      <div className="nav-links">
        <Link to="/">Home</Link>
        {user ? (
          <>
            <Link to="/create" className="btn btn-outline btn-sm">
              Write
            </Link>
            <span className="nav-username">Hi, {user.username}</span>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
