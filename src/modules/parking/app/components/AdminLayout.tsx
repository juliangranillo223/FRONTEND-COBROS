import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { Container, Button } from 'react-bootstrap';
import { LogOut } from 'lucide-react';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';
import { clearAdminSession, getAdminSession, type AdminSession } from '../utils/adminSession';

export function AdminLayout() {
  const navigate = useNavigate();
  const [session, setSession] = useState<AdminSession | null>(null);

  useEffect(() => {
    const currentSession = getAdminSession();

    if (!currentSession) {
      navigate('/parking/admin');
      return;
    }

    setSession(currentSession);
  }, [navigate]);

  const handleLogout = () => {
    clearAdminSession();
    navigate('/parking/admin');
  };

  return (
    <div className="parking-shell parking-shell--solid">
      <AppHeader
        subtitle="Panel de Administracion"
        actions={
          <>
            <div className="text-end d-none d-md-block text-white">
              <div className="small fw-medium">{session?.displayName || 'Sesion Administrativa'}</div>
              <small style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{session?.role || 'Sin rol'}</small>
            </div>
            <Button variant="light" size="sm" onClick={handleLogout}>
              <LogOut size={16} className="me-2" />
              Cerrar Sesion
            </Button>
          </>
        }
      />

      <main>
        <Container fluid="lg" className="parking-content-container py-4">
          <Outlet />
        </Container>
      </main>

      <AppFooter />
    </div>
  );
}
