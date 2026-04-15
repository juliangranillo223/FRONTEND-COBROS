import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Alert, Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import { ArrowLeft, ClipboardPlus, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { getReadableApiError } from '../../../../../shared/api';
import type { BackendEstudiante, BackendEstudianteMulta, BackendMulta } from '../../../../../shared/models/backend';
import { fineService, studentService } from '../../../../../shared/services';
import { getAdminSession } from '../../utils/adminSession';
import { findRegistrationByPlate } from '../../utils/plateRegistry';

export function AssignFines() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getAdminSession();
  const createdBy = useMemo(() => session?.displayName || session?.username || 'usuario', [session]);
  const backPath = useMemo(
    () => (location.pathname.startsWith('/parking/user') ? '/parking/user/multas' : '/parking/admin/dashboard/multas'),
    [location.pathname]
  );
  const [plate, setPlate] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [resolvedStudent, setResolvedStudent] = useState<BackendEstudiante | null>(null);
  const [resolvedPlate, setResolvedPlate] = useState('');
  const [createdFine, setCreatedFine] = useState<BackendMulta | null>(null);
  const [createdRelation, setCreatedRelation] = useState<BackendEstudianteMulta | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    dueDate: '',
  });

  const taxAmount = useMemo(() => {
    const total = Number(formData.amount || 0);
    return Number((total * 0.12).toFixed(2));
  }, [formData.amount]);

  const baseAmount = useMemo(() => {
    const total = Number(formData.amount || 0);
    return Number((total - taxAmount).toFixed(2));
  }, [formData.amount, taxAmount]);

  const handleFindPlate = async () => {
    const normalizedPlate = plate.trim().toUpperCase();

    if (!normalizedPlate) {
      toast.error('Ingrese una placa para buscarla');
      return;
    }

    setLookupLoading(true);
    setSearchError('');
    setSubmitError('');
    setResolvedStudent(null);
    setCreatedFine(null);
    setCreatedRelation(null);

    try {
      const plateMatch = findRegistrationByPlate(normalizedPlate);

      if (!plateMatch) {
        throw new Error('No se encontro una placa registrada en el frontend para asociar la multa.');
      }

      const student = await studentService.getByCarne(plateMatch.carnet);
      setResolvedStudent(student);
      setResolvedPlate(plateMatch.plate);
      toast.success(`Placa ${plateMatch.plate} encontrada para ${student.EST_NOMBRE_COMPLETO}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : getReadableApiError(error, 'No fue posible resolver la placa ingresada.');
      setSearchError(message);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleAssignFine = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resolvedStudent) {
      toast.error('Primero busque una placa valida');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Ingrese una descripcion para la multa');
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error('Ingrese un monto valido');
      return;
    }

    if (!formData.dueDate) {
      toast.error('Seleccione la fecha de vencimiento');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const fine = await fineService.createFine({
        MUL_descripcion: formData.description.trim(),
        MUL_monto_total: Number(formData.amount),
        MUL_monto_base: baseAmount > 0 ? baseAmount : Number(formData.amount),
        MUL_impuesto: taxAmount >= 0 ? taxAmount : 0,
        MUL_fecha: new Date().toISOString(),
        MUL_fecha_vencimiento: new Date(formData.dueDate).toISOString(),
        MUL_creado_por: createdBy,
      });

      const relation = await fineService.createStudentFine({
        MUL_MULTA: fine.MUL_id_multa,
        EST_CARNE: resolvedStudent.EST_CARNE,
        EMU_ESTADO_MULTA: 'A',
        EMU_CREADO_POR: createdBy,
      });

      setCreatedFine(fine);
      setCreatedRelation(relation);
      toast.success('Multa asignada y registrada correctamente');
      setFormData({
        description: '',
        amount: '',
        dueDate: '',
      });
    } catch (error) {
      setSubmitError(getReadableApiError(error, 'No fue posible registrar la multa.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 980, margin: '0 auto' }}>
      <Card className="shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <Card.Title className="mb-1 h4">Asignar Multas</Card.Title>
              <Card.Subtitle className="text-muted">
                Disponible para administradores y para el estudiante logeado.
              </Card.Subtitle>
            </div>
            <Button variant="outline-secondary" onClick={() => navigate(backPath)}>
              <ArrowLeft size={16} className="me-2" />
              Volver a Multas
            </Button>
          </div>
        </Card.Header>
        <Card.Body className="p-4">
          <Alert variant="info" className="mb-4">
            La placa se resuelve con los registros almacenados por el frontend y la multa se guarda en base de datos
            usando las APIs de <code>multa</code> y <code>estudiante_multa</code>.
          </Alert>

          <Row className="g-4">
            <Col lg={5}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <ClipboardPlus size={28} color="#C7352E" />
                    <div>
                      <h5 className="mb-1">Buscar placa</h5>
                      <p className="text-muted mb-0">
                        Encuentre el estudiante antes de crear la multa.
                      </p>
                    </div>
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Label>Placa</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ej. P123ABC"
                      value={plate}
                      onChange={(e) => setPlate(e.target.value.toUpperCase())}
                    />
                  </Form.Group>

                  <Button className="w-100 mb-3" variant="primary" onClick={handleFindPlate} disabled={lookupLoading}>
                    {lookupLoading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Buscando...
                      </>
                    ) : (
                      <>
                        <Search size={16} className="me-2" />
                        Buscar placa
                      </>
                    )}
                  </Button>

                  {searchError && <Alert variant="warning">{searchError}</Alert>}

                  {resolvedStudent && (
                    <Card className="bg-light border-0">
                      <Card.Body>
                        <div className="fw-semibold mb-2">Resultado encontrado</div>
                        <div><strong>Placa:</strong> {resolvedPlate}</div>
                        <div><strong>Carnet:</strong> {resolvedStudent.EST_CARNE}</div>
                        <div><strong>Nombre:</strong> {resolvedStudent.EST_NOMBRE_COMPLETO}</div>
                        <div><strong>Correo:</strong> {resolvedStudent.EST_EMAIL}</div>
                      </Card.Body>
                    </Card>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={7}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <h5 className="mb-3">Registrar multa</h5>

                  {submitError && <Alert variant="danger">{submitError}</Alert>}

                  <Form onSubmit={handleAssignFine}>
                    <Form.Group className="mb-3">
                      <Form.Label>Descripcion</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Detalle de la infraccion"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </Form.Group>

                    <Row className="g-3 mb-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Monto total</Form.Label>
                          <Form.Control
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="150.00"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Fecha de vencimiento</Form.Label>
                          <Form.Control
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="g-3 mb-4">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Monto base</Form.Label>
                          <Form.Control type="text" readOnly value={`Q${baseAmount.toFixed(2)}`} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Impuesto estimado</Form.Label>
                          <Form.Control type="text" readOnly value={`Q${taxAmount.toFixed(2)}`} />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Button type="submit" variant="danger" className="w-100" disabled={submitting || !resolvedStudent}>
                      {submitting ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Registrando multa...
                        </>
                      ) : 'Asignar multa'}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {createdFine && createdRelation && (
            <Card className="border-0 shadow-sm mt-4">
              <Card.Body>
                <h5 className="mb-3">Registro creado</h5>
                <div className="table-responsive">
                  <Table className="align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Placa</th>
                        <th>Carnet</th>
                        <th>ID Multa</th>
                        <th>ID Relacion</th>
                        <th>Estado</th>
                        <th>Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{resolvedPlate}</td>
                        <td>{resolvedStudent?.EST_CARNE}</td>
                        <td>{createdFine.MUL_id_multa}</td>
                        <td>{createdRelation.EMU_ESTUDIANTE_MULTA}</td>
                        <td>{createdRelation.EMU_ESTADO_MULTA || 'A'}</td>
                        <td>Q{Number(createdFine.MUL_monto_total || 0).toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
