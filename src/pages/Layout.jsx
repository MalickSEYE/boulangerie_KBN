import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.wrapper}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>🥐 Boulangerie</div>

        <nav style={styles.nav}>
          <NavLink to="/"         end style={navStyle}>🏠 Tableau de bord</NavLink>
          <NavLink to="/produits"     style={navStyle}>🍞 Produits</NavLink>
          <NavLink to="/ventes"       style={navStyle}>🧾 Ventes</NavLink>
          <NavLink to="/ventes/nouvelle" style={navStyle}>➕ Nouvelle vente</NavLink>
          {isAdmin() && (
            <NavLink to="/employes" style={navStyle}>👥 Employés</NavLink>
          )}
        </nav>

        <div style={styles.userBox}>
          <p style={styles.userName}>{user?.nom}</p>
          <p style={styles.userRole}>{user?.role}</p>
          <button onClick={handleLogout} style={styles.logoutBtn}>Déconnexion</button>
        </div>
      </aside>

      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const navStyle = ({ isActive }) => ({
  display: 'block',
  padding: '0.6rem 1rem',
  borderRadius: 8,
  textDecoration: 'none',
  fontSize: 14,
  fontWeight: isActive ? 600 : 400,
  background: isActive ? '#fdf0de' : 'transparent',
  color: isActive ? '#c17c2e' : '#444',
  marginBottom: 4,
});

const styles = {
  wrapper:    { display: 'flex', minHeight: '100vh' },
  sidebar:    { width: 220, background: '#fff', borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column', padding: '1.5rem 1rem' },
  logo:       { fontSize: 20, fontWeight: 700, marginBottom: '2rem', color: '#c17c2e' },
  nav:        { flex: 1 },
  userBox:    { borderTop: '1px solid #eee', paddingTop: '1rem' },
  userName:   { fontWeight: 600, fontSize: 14 },
  userRole:   { fontSize: 12, color: '#888', textTransform: 'capitalize', marginBottom: 8 },
  logoutBtn:  { width: '100%', padding: '0.4rem', background: 'none', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: '#666' },
  main:       { flex: 1, background: '#f8f6f2', padding: '2rem', overflowY: 'auto' },
};
