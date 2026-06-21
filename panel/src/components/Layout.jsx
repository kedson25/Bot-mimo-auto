import { Outlet, Link, useLocation } from 'react-router-dom'

const menuItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/flows', label: 'Fluxos', icon: '🔀' },
  { path: '/settings', label: 'Configuracoes', icon: '⚙️' }
]

export default function Layout() {
  const location = useLocation()

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>📱</span>
          <span style={styles.logoText}>WhatsApp Bot</span>
        </div>

        <nav style={styles.nav}>
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.navItem,
                ...(location.pathname === item.path ? styles.navItemActive : {})
              }}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={styles.status}>
          <div style={styles.statusDot} />
          <span style={styles.statusText}>Bot Online</span>
        </div>
      </aside>

      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

const styles = {
  sidebar: {
    width: 240,
    background: '#1a1a1a',
    borderRight: '1px solid #333',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0',
    position: 'fixed',
    height: '100vh',
    zIndex: 10
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 20px 20px',
    borderBottom: '1px solid #333'
  },
  logoIcon: {
    fontSize: 24
  },
  logoText: {
    fontSize: 16,
    fontWeight: 600
  },
  nav: {
    flex: 1,
    padding: '20px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 16px',
    borderRadius: 8,
    color: '#a0a0a0',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.2s'
  },
  navItemActive: {
    background: '#25D36620',
    color: '#25D366'
  },
  navIcon: {
    fontSize: 18
  },
  status: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '16px 20px',
    borderTop: '1px solid #333'
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#25D366'
  },
  statusText: {
    fontSize: 12,
    color: '#a0a0a0'
  },
  main: {
    flex: 1,
    marginLeft: 240,
    padding: 30,
    minHeight: '100vh'
  }
}
