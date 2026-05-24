import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import { logoutUser } from '../utils/authSession';

export default function AppNavbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/events" style={styles.brand}>
        CloudWave Events
      </Link>
      <div style={styles.links}>
        {isAuthenticated() ? (
          <>
            <Link to="/events" style={styles.link}>
              Events
            </Link>
            <Link to="/events/create" style={styles.link}>
              Create Event
            </Link>
            <button type="button" onClick={handleLogout} style={styles.btn}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>
              Login
            </Link>
            <Link to="/register" style={styles.link}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#1a1a2e',
    color: 'white',
  },
  brand: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  links: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
  },
  btn: {
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
};
