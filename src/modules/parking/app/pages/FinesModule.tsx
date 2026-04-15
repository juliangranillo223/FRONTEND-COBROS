import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Alert, Button, Card, Col, Row } from 'react-bootstrap';
import { AlertTriangle, ClipboardPlus, CreditCard, ShieldCheck } from 'lucide-react';
import { getAdminSession } from '../utils/adminSession';

interface FineSubmoduleCard {
  title: string;
  description: string;
  buttonLabel: string;
  icon: typeof AlertTriangle;
  variant: 'danger' | 'primary' | 'outline-secondary';
  onClick?: () => void;
  disabled?: boolean;
}

export function FinesModule() {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminPortal = location.pathname.startsWith('/parking/admin');
  const adminSession = isAdminPortal ? getAdminSession() : null;
  const role = isAdminPortal ? adminSession?.role : 'Estudiante';
  const cards = useMemo<FineSubmoduleCard[]>(() => {
    if (isAdminPortal) {
      return [
        {
          title: 'Consultar Multas / Pago de Multas',
          description: 'Disponible desde el portal de autogestion del estudiante para consultar multas activas y registrar pagos.',
          buttonLabel: 'Disponible en portal estudiantil',
          icon: CreditCard,
          variant: 'outline-secondary',
          disabled: true,
        },
        {
          title: 'Asignar Multas',
          description: 'Registre y administre la asignacion de multas para estudiantes autorizados.',
          buttonLabel: 'Abrir submodulo',
          icon: ClipboardPlus,
          variant: 'danger',
          onClick: () => navigate('/parking/admin/dashboard/multas/asignar'),
        },
      ];
    }

    return [
      {
        title: 'Consultar Multas / Pago de Multas',
        description: 'Consulte el estado de sus multas y abra el formulario para pagar las que sigan activas.',
        buttonLabel: 'Abrir submodulo',
        icon: CreditCard,
        variant: 'danger',
        onClick: () => navigate('/parking/user/multas/consultar'),
      },
      {
        title: 'Asignar Multas',
        description: 'Registre multas asociadas a una placa desde el portal del estudiante.',
        buttonLabel: 'Abrir submodulo',
        icon: ClipboardPlus,
        variant: 'danger',
        onClick: () => navigate('/parking/user/multas/asignar'),
      },
    ];
  }, [isAdminPortal, navigate]);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Card className="shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <Card.Title className="mb-1 h4">Multas</Card.Title>
              <Card.Subtitle className="text-muted">
                Acceda a los submodulos disponibles para consultar, pagar o asignar multas.
              </Card.Subtitle>
            </div>
            <Button
              variant="outline-secondary"
              onClick={() => navigate(isAdminPortal ? '/parking/admin/dashboard' : '/parking')}
            >
              Volver
            </Button>
          </div>
        </Card.Header>
        <Card.Body className="p-4">
          {isAdminPortal && (
            <Alert variant="info" className="mb-4 d-flex align-items-center gap-2">
              <ShieldCheck size={18} />
              <span>
                Rol actual: <strong>{role || 'Sin sesion'}</strong>. Temporalmente, el submodulo <strong>Asignar Multas</strong>
                permite el ingreso a cualquier usuario autenticado.
              </span>
            </Alert>
          )}

          <Row className="g-4">
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <Col md={6} key={card.title}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="p-4 d-flex flex-column">
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div
                          className="d-inline-flex align-items-center justify-content-center rounded-circle"
                          style={{ width: 52, height: 52, backgroundColor: '#F4F7FA' }}
                        >
                          <Icon size={26} color={card.variant === 'danger' ? '#C7352E' : '#1A6AA6'} />
                        </div>
                        <div>
                          <Card.Title className="h5 mb-1">{card.title}</Card.Title>
                          <Card.Subtitle className="text-muted small">{card.description}</Card.Subtitle>
                        </div>
                      </div>

                      <div className="mt-auto">
                        <Button
                          variant={card.variant}
                          className="w-100"
                          onClick={card.onClick}
                          disabled={card.disabled}
                        >
                          {card.buttonLabel}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
}
