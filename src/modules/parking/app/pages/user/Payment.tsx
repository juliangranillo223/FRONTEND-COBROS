import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card, Button, Row, Col, Alert, Spinner, Form } from 'react-bootstrap';
import { ArrowLeft, DollarSign, CheckCircle, CreditCard } from 'lucide-react';
import { toast } from 'react-toastify';
import { useRegistration } from '../../context/RegistrationContext';
import { paymentConfig, type ParkingPlanKey } from '../../lib/paymentConfig';

const stripePromise = paymentConfig.publishableKey
  ? loadStripe(paymentConfig.publishableKey)
  : Promise.resolve(null);

type PaymentIntentResponse = {
  clientSecret: string;
  data?: {
    PAG_PAGO?: number | string;
    STRIPE_PAYMENT_INTENT_ID?: string;
  };
  message?: string;
  error?: string;
};

const getAmountFromPlan = (plan?: string) => {
  return 600;
};

const getPlanLabel = (plan?: string) => {
  switch (plan) {
    case 'entre-semana':
      return 'Entre Semana (Lunes a Viernes)';
    case 'sabado':
      return 'Sabado';
    case 'domingo':
      return 'Domingo';
    default:
      return '';
  }
};

const getInitialPaymentId = () => {
  const storedPaymentId = window.sessionStorage.getItem('parkingPaymentId');
  return storedPaymentId !== null
    ? Number(storedPaymentId)
    : paymentConfig.paymentIdStart;
};

type PagoRecord = {
  PAG_PAGO?: number | string;
};

const buildPaymentPayload = (
  registration: ReturnType<typeof useRegistration>['currentRegistration'],
  paymentData: {
    paymentId: number;
    carnet: string;
    paymentDate: string;
  },
) => {
  const parkingPlan = registration.parkingPlan as ParkingPlanKey | undefined;
  const amount = getAmountFromPlan(parkingPlan);

  return {
    PAG_PAGO: paymentData.paymentId,
    EST_CARNE: paymentData.carnet,
    PLN_PLAN: parkingPlan ? paymentConfig.planIds[parkingPlan] : undefined,
    FPG_FORMA_PAGO: paymentConfig.cardPaymentMethodId,
    PAG_FECHA_PAGO: paymentData.paymentDate,
    PAG_MONTO_TOTAL: amount,
  };
};

function FormLayout({
  amount,
  children,
}: {
  amount: number;
  children: ReactNode;
}) {
  const { currentRegistration } = useRegistration();

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <Card className="shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <Card.Title className="mb-1 h4">Informacion de Pago</Card.Title>
          <Card.Subtitle className="text-muted">
            Complete su pago seguro con Stripe
          </Card.Subtitle>
        </Card.Header>
        <Card.Body className="p-4">
          <div
            className="p-4 rounded mb-4 text-white"
            style={{
              background: 'linear-gradient(135deg, #1976d2 0%, #7e57c2 100%)',
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-3" style={{ opacity: 0.9 }}>
              <DollarSign size={16} />
              <small>Resumen de Pago</small>
            </div>
            <Row>
              <Col>
                <div>
                  <small style={{ opacity: 0.9 }}>Plan seleccionado</small>
                  <div className="fw-medium">{getPlanLabel(currentRegistration.parkingPlan)}</div>
                  <small style={{ opacity: 0.9 }} className="mt-2 d-block">
                    {currentRegistration.vehicles?.length || 0} vehiculo(s) registrado(s)
                  </small>
                </div>
              </Col>
              <Col xs="auto" className="text-end">
                <small style={{ opacity: 0.9 }}>Total a pagar</small>
                <div className="display-5 fw-bold">Q{amount}</div>
                <small style={{ opacity: 0.75 }}>Pago mensual</small>
              </Col>
            </Row>
          </div>

          <div
            className="d-flex align-items-center gap-3 mb-4 p-3 rounded"
            style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}
          >
            <CreditCard size={20} color="#1976d2" />
            <div>
              <div className="fw-medium">Pago con tarjeta</div>
              <small className="text-muted">Stripe se encarga de capturar y tokenizar los datos bancarios.</small>
            </div>
          </div>

          {children}
        </Card.Body>
      </Card>
    </div>
  );
}

function PaymentForm({
  amount,
  clientSecret,
}: {
  amount: number;
  clientSecret: string;
}) {
  const navigate = useNavigate();
  const { updateRegistration } = useRegistration();
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error('Stripe aun no termina de cargar');
      return;
    }

    setIsSubmitting(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      toast.error(error.message || 'No fue posible confirmar el pago');
      setIsSubmitting(false);
      return;
    }

    const finalIntent = paymentIntent ?? (await stripe.retrievePaymentIntent(clientSecret)).paymentIntent;

    if (finalIntent?.status === 'succeeded') {
      updateRegistration({
        amount,
        paymentStatus: 'paid',
        cardHolder: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
      });
      toast.success('Pago realizado correctamente');
      navigate('/parking/user/confirmacion');
      return;
    }

    if (finalIntent?.status === 'processing') {
      toast.info('El pago esta en proceso. Puedes verificarlo en unos segundos.');
    } else {
      toast.error('El pago no fue aprobado');
    }

    setIsSubmitting(false);
  };

  return (
    <FormLayout amount={amount}>
      <form onSubmit={handleSubmit}>
        <div
          style={{
            border: '1px solid #dee2e6',
            borderRadius: 8,
            padding: 16,
            backgroundColor: '#ffffff',
          }}
        >
          <PaymentElement options={{ layout: 'tabs' }} />
        </div>

        <Alert variant="warning" className="mt-4 mb-4">
          <small>
            <strong>Nota:</strong> Este flujo usa Stripe en modo de prueba. Puedes usar tarjetas de testing de Stripe.
          </small>
        </Alert>

        <Row className="g-3">
          <Col xs={6}>
            <Button
              variant="outline-secondary"
              size="lg"
              className="w-100"
              onClick={() => navigate('/parking/user/vehiculos')}
              disabled={isSubmitting}
            >
              <ArrowLeft size={16} className="me-2" />
              Atras
            </Button>
          </Col>
          <Col xs={6}>
            <Button variant="primary" type="submit" size="lg" className="w-100" disabled={!stripe || isSubmitting}>
              {isSubmitting ? <Spinner size="sm" className="me-2" /> : null}
              {isSubmitting ? 'Procesando...' : `Pagar Q${amount}`}
            </Button>
          </Col>
        </Row>
      </form>
    </FormLayout>
  );
}

export function Payment() {
  const navigate = useNavigate();
  const { currentRegistration } = useRegistration();
  const amount = getAmountFromPlan(currentRegistration.parkingPlan);
  const [clientSecret, setClientSecret] = useState('');
  const [isLoadingIntent, setIsLoadingIntent] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [hasAttemptedIntent, setHasAttemptedIntent] = useState(false);
  const [isLoadingNextId, setIsLoadingNextId] = useState(false);
  const [paymentData, setPaymentData] = useState(() => ({
    paymentId: getInitialPaymentId(),
    carnet: currentRegistration.carnet || '',
    paymentDate: new Date().toISOString().slice(0, 10),
  }));

  useEffect(() => {
    setPaymentData((prev) => ({
      ...prev,
      carnet: prev.carnet || currentRegistration.carnet || '',
    }));
  }, [currentRegistration.carnet]);

  useEffect(() => {
    if (clientSecret || hasAttemptedIntent) {
      return;
    }

    const syncNextPaymentId = async () => {
      setIsLoadingNextId(true);

      try {
        const response = await fetch(`${paymentConfig.apiBaseUrl}/api/pago`);

        if (!response.ok) {
          throw new Error('No se pudo consultar el ultimo ID de pago.');
        }

        const pagos = (await response.json()) as PagoRecord[];
        const maxPaymentId = pagos.reduce((max, pago) => {
          const currentId = Number(pago.PAG_PAGO);
          return Number.isFinite(currentId) ? Math.max(max, currentId) : max;
        }, paymentConfig.paymentIdStart - 1);

        const nextPaymentId = Math.max(paymentConfig.paymentIdStart, maxPaymentId + 1);
        window.sessionStorage.setItem('parkingPaymentId', String(nextPaymentId));
        setPaymentData((prev) => ({ ...prev, paymentId: nextPaymentId }));
      } catch {
        setPaymentData((prev) => ({ ...prev, paymentId: getInitialPaymentId() }));
      } finally {
        setIsLoadingNextId(false);
      }
    };

    void syncNextPaymentId();
  }, [clientSecret, hasAttemptedIntent]);

  const missingRequirements = useMemo(() => {
    if (!paymentConfig.publishableKey) {
      return 'Falta VITE_STRIPE_PUBLISHABLE_KEY en el entorno del front.';
    }

    if (!currentRegistration.parkingPlan) {
      return 'Completa primero el registro del usuario antes de intentar pagar.';
    }

    if (!amount) {
      return 'No se pudo calcular el monto del plan seleccionado.';
    }

    return '';
  }, [amount, currentRegistration.carnet, currentRegistration.parkingPlan]);

  const handleCreateIntent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentData.carnet || !paymentData.paymentDate) {
      const message = 'Completa el carnet y la fecha antes de continuar.';
      setLoadError(message);
      toast.error(message);
      return;
    }

    setIsLoadingIntent(true);
    setHasAttemptedIntent(true);
    setLoadError('');

    try {
      const payload = buildPaymentPayload(currentRegistration, paymentData);
      const response = await fetch(`${paymentConfig.apiBaseUrl}/api/pago`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as PaymentIntentResponse;

      if (!response.ok || !result.clientSecret) {
        const detailedMessage = [result.message, result.error].filter(Boolean).join(': ');
        throw new Error(detailedMessage || 'No se pudo iniciar el pago con Stripe');
      }

      window.sessionStorage.setItem('parkingPaymentId', String(paymentData.paymentId + 1));
      setClientSecret(result.clientSecret);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error inesperado al iniciar el pago';
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsLoadingIntent(false);
    }
  };

  if (currentRegistration.paymentStatus === 'paid') {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <Card className="shadow-sm">
          <Card.Header className="bg-white border-bottom">
            <Card.Title className="mb-1 h4">Verificacion de Pago</Card.Title>
            <Card.Subtitle className="text-muted">
              Confirme su informacion de pago
            </Card.Subtitle>
          </Card.Header>
          <Card.Body className="p-4">
            <div
              className="p-4 rounded mb-4 text-white"
              style={{
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-3" style={{ opacity: 0.9 }}>
                <CheckCircle size={16} />
                <small>Pago realizado correctamente</small>
              </div>
              <Row>
                <Col>
                  <div>
                    <small style={{ opacity: 0.9 }}>Plan seleccionado</small>
                    <div className="fw-medium">{getPlanLabel(currentRegistration.parkingPlan)}</div>
                    <small style={{ opacity: 0.9 }} className="mt-2 d-block">
                      {currentRegistration.vehicles?.length || 0} vehiculo(s) registrado(s)
                    </small>
                  </div>
                </Col>
                <Col xs="auto" className="text-end">
                  <small style={{ opacity: 0.9 }}>Total pagado</small>
                  <div className="display-5 fw-bold">Q{amount}</div>
                  <small style={{ opacity: 0.75 }}>Pago mensual</small>
                </Col>
              </Row>
            </div>

            <Alert variant="success" className="mb-4">
              Stripe confirmo el pago de prueba correctamente. El estado final en base de datos depende del webhook del backend.
            </Alert>

            <Row className="g-3">
              <Col xs={6}>
                <Button
                  variant="outline-primary"
                  size="lg"
                  className="w-100"
                  onClick={() => navigate('/parking/user/vehiculos')}
                >
                  <ArrowLeft size={16} className="me-2" />
                  Atras
                </Button>
              </Col>
              <Col xs={6}>
                <Button variant="primary" size="lg" className="w-100" onClick={() => navigate('/parking/user/firma')}>
                  Siguiente
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>
    );
  }

  if (missingRequirements) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <Alert variant="warning">{missingRequirements}</Alert>
      </div>
    );
  }

  if (isLoadingIntent) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <Card className="shadow-sm">
          <Card.Body className="p-5 text-center">
            <Spinner animation="border" role="status" className="mb-3" />
            <div className="fw-medium">Preparando el formulario de pago seguro...</div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  if (loadError || !clientSecret) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <FormLayout amount={amount}>
          {loadError ? <Alert variant="danger" className="mb-4">{loadError}</Alert> : null}

          <Form onSubmit={handleCreateIntent}>
            <Row className="g-3 mb-4">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>ID de Pago</Form.Label>
                  <Form.Control type="number" value={paymentData.paymentId} readOnly />
                  <Form.Text className="text-muted">
                    {isLoadingNextId ? 'Consultando siguiente correlativo...' : 'Se propone automaticamente el siguiente ID disponible.'}
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Group>
                  <Form.Label>Carnet</Form.Label>
                  <Form.Control
                    type="text"
                    value={paymentData.carnet}
                    onChange={(e) => setPaymentData((prev) => ({ ...prev, carnet: e.target.value }))}
                    placeholder="5190-23-10007"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Fecha de Pago</Form.Label>
                  <Form.Control
                    type="date"
                    value={paymentData.paymentDate}
                    onChange={(e) => setPaymentData((prev) => ({ ...prev, paymentDate: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Monto</Form.Label>
                  <Form.Control type="text" value={`Q${amount}`} readOnly />
                </Form.Group>
              </Col>
            </Row>

            <Alert variant="info" className="mb-4">
              El sistema usara monto fijo de Q600 y dejara el siguiente ID listo automaticamente despues de crear el pago.
            </Alert>

            <Row className="g-3">
              <Col xs={6}>
                <Button
                  variant="outline-secondary"
                  size="lg"
                  className="w-100"
                  onClick={() => navigate('/parking/user/vehiculos')}
                >
                  <ArrowLeft size={16} className="me-2" />
                  Atras
                </Button>
              </Col>
              <Col xs={6}>
                <Button variant="primary" type="submit" size="lg" className="w-100" disabled={isLoadingNextId}>
                  Crear Pago
                </Button>
              </Col>
            </Row>
          </Form>
        </FormLayout>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm amount={amount} clientSecret={clientSecret} />
    </Elements>
  );
}
