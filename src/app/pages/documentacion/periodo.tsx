import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Row, Table, Spinner, Button, Form } from 'react-bootstrap'
import { useEffect, useState, useRef } from 'react'
import { fetchPeriodo, fetchPeriodoById, createPeriodo, updatePeriodo, deletePeriodo, Periodo } from '@/servicios/documentacion/periodoProvider'
import Swal from 'sweetalert2'
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import { BiEdit, BiPlus, BiTrash, BiRefresh } from 'react-icons/bi'
import { useAuthContext } from '@/context/useAuthContext'
import DataTable from 'react-data-table-component'
import { useLayoutContext } from '@/context/useLayoutContext'

// Add CSS for spin animation
const spinKeyframes = `
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.spin {
  animation: spin 1s linear infinite;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = spinKeyframes;
  document.head.appendChild(style);
}

const PeriodoPage = () => {
    const { theme, changeTheme } = useLayoutContext()
    const isDark = theme === 'dark'
    const [periodos, setPeriodos] = useState<Periodo[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [reloading, setReloading] = useState<boolean>(false)
    const [submitting, setSubmitting] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [showDrawer, setShowDrawer] = useState(false)
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState<Periodo | null>(null)
    const [isEdit, setEdit] = useState(true)
    const { user } = useAuthContext()
    const { token, id_empresa } = user || {}
    const labelRef = useRef<HTMLInputElement>(null)
    const [formValues, setFormValues] = useState({
        id_periodo: 0,
        label: '',
        fecha_inicio: new Date(),
        fecha_fin: new Date(),
        estado: 'SI',
        id_empresa: Number(id_empresa) || 0,
    })

    const [search, setSearch] = useState('');
    const [columnFilters, setColumnFilters] = useState({
        id_periodo: '',
        label: '',
        fecha_inicio: '',
        fecha_fin: '',
        estado: '',
    });

    const [formErrors, setFormErrors] = useState<{
        label?: string
        fecha_inicio?: string
        fecha_fin?: string
        estado?: string
    }>({})

    const handleColumnFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setColumnFilters(prev => ({ ...prev, [name]: value }));
    };

    const columns = [
        { 
            name: 'ID', 
            selector: (row: Periodo) => row.id_periodo, 
            sortable: true,
            width: '80px',
            cell: (row: Periodo) => (
                <div style={{ 
                    backgroundColor: isDark ? '#374151' : '#e0f2fe',
                    color: isDark ? '#ffffff' : '#0277bd',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textAlign: 'center',
                    minWidth: '40px'
                }}>
                    {row.id_periodo}
                </div>
            )
        },
        { 
            name: 'Label', 
            selector: (row: Periodo) => row.label, 
            sortable: true,
            cell: (row: Periodo) => (
                <div style={{ 
                    fontWeight: '500',
                    color: isDark ? '#f3f4f6' : '#1f2937'
                }}>
                    {row.label}
                </div>
            )
        },
        { 
            name: 'Fecha Inicio', 
            selector: (row: Periodo) => row.fecha_inicio instanceof Date ? row.fecha_inicio.toLocaleDateString() : row.fecha_inicio, 
            sortable: true,
            cell: (row: Periodo) => (
                <div style={{ 
                    fontWeight: '500',
                    color: isDark ? '#f3f4f6' : '#1f2937'
                }}>
                    {row.fecha_inicio instanceof Date ? row.fecha_inicio.toLocaleDateString() : row.fecha_inicio}
                </div>
            )
        },
        { 
            name: 'Fecha Fin', 
            selector: (row: Periodo) => row.fecha_fin instanceof Date ? row.fecha_fin.toLocaleDateString() : row.fecha_fin, 
            sortable: true,
            cell: (row: Periodo) => (
                <div style={{ 
                    fontWeight: '500',
                    color: isDark ? '#f3f4f6' : '#1f2937'
                }}>
                    {row.fecha_fin instanceof Date ? row.fecha_fin.toLocaleDateString() : row.fecha_fin}
                </div>
            )
        },
        { 
            name: 'Estado', 
            selector: (row: Periodo) => row.estado, 
            sortable: true,
            width: '100px',
            cell: (row: Periodo) => (
                <div style={{ 
                    backgroundColor: row.estado === 'SI' ? (isDark ? '#065f46' : '#f0fdf4') : (isDark ? '#7f1d1d' : '#fef2f2'),
                    color: row.estado === 'SI' ? (isDark ? '#34d399' : '#16a34a') : (isDark ? '#fca5a5' : '#dc2626'),
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textAlign: 'center',
                    border: row.estado === 'SI' ? (isDark ? '1px solid #059669' : '1px solid #22c55e') : (isDark ? '1px solid #dc2626' : '1px solid #ef4444')
                }}>
                    {row.estado}
                </div>
            )
        },
        {
            name: 'Acciones',
            cell: (periodo) => (
                <div className="d-flex gap-2">
                    <Button
                        variant="warning"
                        size="sm"
                        className="d-flex align-items-center"
                        onClick={() => handleEdit(periodo)}
                        style={{
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            border: 'none',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            transition: 'all 0.2s ease',
                            minWidth: '85px',
                            whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                        }}
                    >
                        <BiEdit size={14} className="me-1" />
                        Editar
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        className="d-flex align-items-center"
                        onClick={() => handleDelete(periodo)}
                        style={{
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            border: 'none',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            transition: 'all 0.2s ease',
                            minWidth: '90px',
                            whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                        }}
                    >
                        <BiTrash size={14} className="me-1" />
                        Eliminar
                    </Button>
                </div>
            ),
            ignoreRowClick: true,
            width: '200px'
        },
    ];

    const filteredPeriodos = periodos.filter((periodo) => {
        const s = search.toLowerCase();
        const fechaInicioStr = periodo.fecha_inicio instanceof Date ? periodo.fecha_inicio.toLocaleDateString() : String(periodo.fecha_inicio);
        const fechaFinStr = periodo.fecha_fin instanceof Date ? periodo.fecha_fin.toLocaleDateString() : String(periodo.fecha_fin);
        
        const globalMatch = (
            String(periodo.id_periodo).includes(s) ||
            (periodo.label?.toLowerCase().includes(s)) ||
            periodo.estado?.toLowerCase().includes(s) ||
            fechaInicioStr.includes(s) ||
            fechaFinStr.includes(s)
        );

        const columnMatch = (
            String(periodo.id_periodo).includes(columnFilters.id_periodo) &&
            (periodo.label?.toLowerCase().includes(columnFilters.label.toLowerCase()) || columnFilters.label === '') &&
            (periodo.estado?.toLowerCase().includes(columnFilters.estado.toLowerCase()) || columnFilters.estado === '') &&
            (fechaInicioStr.toLowerCase().includes(columnFilters.fecha_inicio.toLowerCase()) || columnFilters.fecha_inicio === '') &&
            (fechaFinStr.toLowerCase().includes(columnFilters.fecha_fin.toLowerCase()) || columnFilters.fecha_fin === '')
        );

        return globalMatch && columnMatch;
    });

    const validateForm = () => {
        const errors: { [key: string]: string } = {};
        if (!formValues.label.trim()) {
            errors.label = "El label es obligatorio.";
        }
        if (!formValues.fecha_inicio) {
            errors.fecha_inicio = "La fecha de inicio es obligatoria.";
        }
        if (!formValues.fecha_fin) {
            errors.fecha_fin = "La fecha de fin es obligatoria.";
        }
        if (!formValues.estado) {
            errors.estado = "El estado es obligatorio.";
        }
        return errors;
    };

    const handleInputChange = (e: React.ChangeEvent<any>) => {
        const { id, value } = e.target
        setFormValues(prev => ({
            ...prev,
            [id]: id === 'fecha_inicio' || id === 'fecha_fin' ? new Date(value) : value,
        }))
    }

    const handleCancel = () => {
        setShowDrawer(false)
        setPeriodoSeleccionado(null)
        setFormErrors({})
    }

    const handleCreate = () => {
        setPeriodoSeleccionado(null)
        setShowDrawer(true)
        setEdit(false)
        setFormValues({
            id_periodo: 0,
            label: '',
            fecha_inicio: new Date(),
            fecha_fin: new Date(),
            estado: 'SI',
            id_empresa: Number(id_empresa) || 0,
        })
        setFormErrors({})
    }

    const handleReload = async () => {
        setReloading(true)
        try {
            const periodosData = await fetchPeriodo(token, Number(id_empresa))
            setPeriodos(periodosData)
        } catch (error) {
            setError('Error al recargar períodos')
        } finally {
            setReloading(false)
        }
    }

    const refreshPeriodos = async () => {
        try {
            const periodosData = await fetchPeriodo(token, Number(id_empresa))
            setPeriodos(periodosData)
        } catch (error) {
            setError('Error al cargar períodos')
        }
    }

    const getPeriodos = async () => {
        setLoading(true)
        try {
            const periodosData = await fetchPeriodo(token, Number(id_empresa))
            setPeriodos(periodosData)
        } catch (error) {
            setError('Error al cargar períodos')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (token && id_empresa) {
            getPeriodos();
        }
    }, [token, id_empresa])

    useEffect(() => {
        if (periodoSeleccionado) {
            setFormValues({
                id_periodo: periodoSeleccionado.id_periodo,
                label: periodoSeleccionado.label || '',
                fecha_inicio: periodoSeleccionado.fecha_inicio || new Date(),
                fecha_fin: periodoSeleccionado.fecha_fin || new Date(),
                estado: periodoSeleccionado.estado || 'SI',
                id_empresa: periodoSeleccionado.id_empresa,
            })
            setFormErrors({})
        }
    }, [periodoSeleccionado])

    const handleEdit = async (periodo: Periodo) => {
        try {
            const data = await fetchPeriodoById(periodo.id_periodo, token);
            setPeriodoSeleccionado(data);
            setFormErrors({});
            setEdit(true);
            setShowDrawer(true);
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo obtener la información del período.',
                icon: 'error',
            });
        }
    }

    const handleCloseDrawer = () => {
        setShowDrawer(false)
        setPeriodoSeleccionado(null)
        setFormErrors({})
    }

    const handleDelete = (periodo: Periodo) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar el período "${periodo.label}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const deleteResult = await deletePeriodo(periodo.id_periodo, token)
                    await refreshPeriodos();
                    Swal.fire('Eliminado', 'El período ha sido eliminado.', 'success')
                } catch (error) {
                    Swal.fire('Error', 'No se pudo eliminar el período.', 'error')
                }
            }
        })
    }

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            if (isEdit) {
                if (!periodoSeleccionado) {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se ha seleccionado un período para editar.',
                        icon: 'error',
                    });
                    return;
                }

                const update = await updatePeriodo({
                    id_periodo: periodoSeleccionado.id_periodo,
                    ...formValues,
                }, token);

                if ((update as any).estado !== false) {
                    await getPeriodos();
                    Swal.fire({
                        title: 'Registro Modificado',
                        text: 'Se ha modificado el registro.',
                        icon: 'success',
                    });
                    setShowDrawer(false)
                    setFormErrors({})
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se ha podido modificar el registro.',
                        icon: 'error',
                    });
                }
            } else {
                const newEntrie = await createPeriodo({
                    label: formValues.label,
                    fecha_inicio: formValues.fecha_inicio,
                    fecha_fin: formValues.fecha_fin,
                    estado: formValues.estado,
                    id_empresa: formValues.id_empresa,
                }, token);

                if ((newEntrie as any).estado !== false) {
                    await getPeriodos();
                    Swal.fire({
                        title: 'Registro exitoso',
                        text: 'Se ha creado un nuevo registro.',
                        icon: 'success',
                    });
                    setShowDrawer(false)
                    setFormErrors({})
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se ha podido crear el registro.',
                        icon: 'error',
                    });
                }
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Ocurrió un error inesperado.',
                icon: 'error',
            });
        }
    };

    const handleSubmit = async () => {
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setSubmitting(true);
        try {
            if (isEdit) {
                if (!periodoSeleccionado) {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se ha seleccionado un período para editar.',
                        icon: 'error',
                    });
                    return;
                }

                const update = await updatePeriodo({
                    id_periodo: periodoSeleccionado.id_periodo,
                    ...formValues,
                }, token);

                if ((update as any).estado !== false) {
                    await refreshPeriodos();
                    Swal.fire({
                        title: 'Registro Modificado',
                        text: 'Se ha modificado el registro.',
                        icon: 'success',
                    });
                    setShowDrawer(false)
                    setFormErrors({})
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se ha podido modificar el registro.',
                        icon: 'error',
                    });
                }
            } else {
                const newEntrie = await createPeriodo({
                    label: formValues.label,
                    fecha_inicio: formValues.fecha_inicio,
                    fecha_fin: formValues.fecha_fin,
                    estado: formValues.estado,
                    id_empresa: formValues.id_empresa,
                }, token);

                if ((newEntrie as any).estado !== false) {
                    await refreshPeriodos();
                    Swal.fire({
                        title: 'Registro exitoso',
                        text: 'Se ha creado un nuevo registro.',
                        icon: 'success',
                    });
                    setShowDrawer(false)
                    setFormErrors({})
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se ha podido crear el registro.',
                        icon: 'error',
                    });
                }
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Ocurrió un error inesperado.',
                icon: 'error',
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Spinner animation="border" />
    if (error) return <div>Error: {error}</div>

    return (
        <>
            <PageTitle title="Períodos" subTitle="Documentación" />
            <Row>
                <Col xs={12}>
                    <Card>
                        <CardBody>
                            <div className="d-flex justify-content-between align-items-center">
                                <h4 className="header-title">Gestión de Períodos</h4>
                                <div className="d-flex gap-2">
                                    <Button variant="primary" onClick={handleCreate}>
                                        <BiPlus size={16} className="me-2" />
                                        Crear Período
                                    </Button>
                                    <Button 
                                        variant="outline-secondary" 
                                        size="sm" 
                                        onClick={handleReload}
                                        disabled={reloading}
                                        style={{
                                            borderRadius: '6px',
                                            padding: '6px 12px',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            border: isDark ? '1px solid #404040' : '1px solid #d1d5db',
                                            backgroundColor: 'transparent',
                                            color: isDark ? '#9ca3af' : '#6b7280',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!reloading) {
                                                e.currentTarget.style.backgroundColor = isDark ? '#404040' : '#f3f4f6';
                                                e.currentTarget.style.color = isDark ? '#ffffff' : '#374151';
                                                e.currentTarget.style.borderColor = isDark ? '#525252' : '#9ca3af';
                                                e.currentTarget.style.transform = 'translateY(-1px)';
                                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!reloading) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = isDark ? '#9ca3af' : '#6b7280';
                                                e.currentTarget.style.borderColor = isDark ? '#404040' : '#d1d5db';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                            }
                                        }}
                                    >
                                        <BiRefresh 
                                            size={16} 
                                            className={`me-1 ${reloading ? 'spin' : ''}`} 
                                            style={{
                                                animation: reloading ? 'spin 1s linear infinite' : 'none'
                                            }}
                                        />
                                        {reloading ? 'Cargando...' : 'Recargar'}
                                    </Button>
                                </div>
                            </div>
                            <p className="text-muted">Gestión de períodos</p>

                            {/* Global Search */}
                            <div className="mb-4">
                                <Form.Control
                                    type="text"
                                    placeholder="🔍 Buscar en todos los campos..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="border-2"
                                    style={{
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        padding: '10px 15px'
                                    }}
                                />
                            </div>
                            
                            {/* Column-specific filters */}
                            <Card className="mb-4" style={{ backgroundColor: isDark ? '#2d2d2d' : '#f8f9fa' }}>
                                <CardBody className="py-3">
                                    <h6 className="mb-3 text-muted">Filtros por Columna</h6>
                                    <Row>
                                        <Col xs={12} md={2} className="mb-2">
                                            <Form.Label className="small text-muted mb-1">ID</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="id_periodo"
                                                placeholder="Filtrar por ID"
                                                value={columnFilters.id_periodo}
                                                onChange={handleColumnFilterChange}
                                                size="sm"
                                                style={{ borderRadius: '6px' }}
                                            />
                                        </Col>
                                        <Col xs={12} md={3} className="mb-2">
                                            <Form.Label className="small text-muted mb-1">Label</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="label"
                                                placeholder="Filtrar por Label"
                                                value={columnFilters.label}
                                                onChange={handleColumnFilterChange}
                                                size="sm"
                                                style={{ borderRadius: '6px' }}
                                            />
                                        </Col>
                                        <Col xs={12} md={2} className="mb-2">
                                            <Form.Label className="small text-muted mb-1">Fecha Inicio</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="fecha_inicio"
                                                placeholder="Filtrar por Fecha Inicio"
                                                value={columnFilters.fecha_inicio}
                                                onChange={handleColumnFilterChange}
                                                size="sm"
                                                style={{ borderRadius: '6px' }}
                                            />
                                        </Col>
                                        <Col xs={12} md={2} className="mb-2">
                                            <Form.Label className="small text-muted mb-1">Fecha Fin</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="fecha_fin"
                                                placeholder="Filtrar por Fecha Fin"
                                                value={columnFilters.fecha_fin}
                                                onChange={handleColumnFilterChange}
                                                size="sm"
                                                style={{ borderRadius: '6px' }}
                                            />
                                        </Col>
                                        <Col xs={12} md={3} className="mb-2">
                                            <Form.Label className="small text-muted mb-1">Estado</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="estado"
                                                placeholder="Filtrar por Estado"
                                                value={columnFilters.estado}
                                                onChange={handleColumnFilterChange}
                                                size="sm"
                                                style={{ borderRadius: '6px' }}
                                            />
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>
                            
                            <div style={{ 
                                borderRadius: '12px', 
                                overflow: 'hidden',
                                boxShadow: isDark 
                                    ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)' 
                                    : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                border: isDark ? '1px solid #404040' : '1px solid #e5e7eb'
                            }}>
                                <DataTable
                                    columns={columns}
                                    data={filteredPeriodos}
                                    pagination
                                    responsive
                                    highlightOnHover
                                    striped
                                    paginationPerPage={10}
                                    paginationRowsPerPageOptions={[5, 10, 15, 20, 25]}
                                    customStyles={{
                                        header: {
                                            style: {
                                                backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                                                color: isDark ? '#ffffff' : '#000000',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                borderBottom: isDark ? '2px solid #404040' : '2px solid #e5e7eb',
                                                minHeight: '56px',
                                            },
                                        },
                                        headRow: {
                                            style: {
                                                backgroundColor: isDark ? '#2d2d2d' : '#f8f9fa',
                                                borderTopLeftRadius: '12px',
                                                borderTopRightRadius: '12px',
                                                borderBottom: isDark ? '1px solid #404040' : '1px solid #dee2e6',
                                                minHeight: '52px',
                                            },
                                        },
                                        headCells: {
                                            style: {
                                                fontSize: '13px',
                                                fontWeight: '700',
                                                color: isDark ? '#e5e7eb' : '#374151',
                                                paddingLeft: '16px',
                                                paddingRight: '16px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                            },
                                        },
                                        rows: {
                                            style: {
                                                backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                                                color: isDark ? '#ffffff' : '#000000',
                                                fontSize: '14px',
                                                borderBottom: isDark ? '1px solid #333333' : '1px solid #f1f5f9',
                                                minHeight: '48px',
                                                '&:hover': {
                                                    backgroundColor: isDark ? '#2d2d2d' : '#f8fafc',
                                                    cursor: 'pointer',
                                                    transform: 'scale(1.001)',
                                                    transition: 'all 0.2s ease-in-out',
                                                },
                                                '&:nth-of-type(even)': {
                                                    backgroundColor: isDark ? '#262626' : '#fafbfc',
                                                },
                                            },
                                        },
                                        cells: {
                                            style: {
                                                paddingLeft: '16px',
                                                paddingRight: '16px',
                                                paddingTop: '12px',
                                                paddingBottom: '12px',
                                            },
                                        },
                                        pagination: {
                                            style: {
                                                backgroundColor: isDark ? '#2d2d2d' : '#f8f9fa',
                                                borderTop: isDark ? '1px solid #404040' : '1px solid #dee2e6',
                                                color: isDark ? '#ffffff' : '#000000',
                                                fontSize: '13px',
                                                minHeight: '56px',
                                                borderBottomLeftRadius: '12px',
                                                borderBottomRightRadius: '12px',
                                            },
                                            pageButtonsStyle: {
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                color: isDark ? '#9ca3af' : '#6b7280',
                                                fontSize: '13px',
                                                fontWeight: '500',
                                                padding: '8px 12px',
                                                margin: '0 2px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    backgroundColor: isDark ? '#404040' : '#e5e7eb',
                                                    color: isDark ? '#ffffff' : '#000000',
                                                },
                                                '&:disabled': {
                                                    backgroundColor: 'transparent',
                                                    color: isDark ? '#4b5563' : '#9ca3af',
                                                    cursor: 'not-allowed',
                                                },
                                            },
                                        },
                                        noData: {
                                            style: {
                                                backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                                                color: isDark ? '#9ca3af' : '#6b7280',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                padding: '48px 24px',
                                            },
                                        },
                                    }}
                                    noDataComponent={
                                        <div style={{ 
                                            padding: '48px 24px', 
                                            textAlign: 'center',
                                            color: isDark ? '#9ca3af' : '#6b7280'
                                        }}>
                                            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📅</div>
                                            <h5 style={{ fontWeight: '600', marginBottom: '8px', color: isDark ? '#e5e7eb' : '#374151' }}>
                                                No hay datos disponibles
                                            </h5>
                                            <p style={{ fontSize: '14px', margin: 0 }}>
                                                No se encontraron períodos que coincidan con los criterios de búsqueda.
                                            </p>
                                        </div>
                                    }
                                />
                            </div>

                            <Drawer
                                open={showDrawer}
                                onClose={handleCloseDrawer}
                                direction='right'
                                size={500}
                                style={{
                                    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                                    color: isDark ? '#ffffff' : '#000000',
                                    boxShadow: isDark 
                                        ? '-10px 0 25px -3px rgba(0, 0, 0, 0.5), -4px 0 10px -2px rgba(0, 0, 0, 0.3)' 
                                        : '-10px 0 25px -3px rgba(0, 0, 0, 0.1), -4px 0 10px -2px rgba(0, 0, 0, 0.05)',
                                    top: '70px', // Add top margin to avoid topbar overlap
                                    height: 'calc(100vh - 70px)', // Adjust height accordingly
                                }}
                                className="custom-drawer"
                            >
                                <div style={{ 
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    backgroundColor: isDark ? '#1a1a1a' : '#ffffff'
                                }}>
                                    {/* Enhanced Header */}
                                    <div style={{
                                        padding: '0',
                                        borderBottom: isDark ? '1px solid #404040' : '1px solid #e5e7eb',
                                        backgroundColor: isDark ? '#2d2d2d' : '#f8f9fa',
                                    }}>
                                        {/* Title Bar */}
                                        <div style={{
                                            padding: '20px 24px',
                                            background: `linear-gradient(135deg, ${isDark ? '#374151' : '#3b82f6'} 0%, ${isDark ? '#4b5563' : '#1d4ed8'} 100%)`,
                                            color: '#ffffff',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}>
                                            {/* Background Pattern */}
                                            <div style={{
                                                position: 'absolute',
                                                top: 0,
                                                right: 0,
                                                width: '100px',
                                                height: '100px',
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                borderRadius: '50%',
                                                transform: 'translate(30px, -30px)'
                                            }}></div>
                                            <div style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                width: '60px',
                                                height: '60px',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                borderRadius: '50%',
                                                transform: 'translate(-20px, 20px)'
                                            }}></div>

                                            <div className="d-flex justify-content-between align-items-center" style={{ position: 'relative', zIndex: 1 }}>
                                                <div>
                                                    <div className="d-flex align-items-center mb-2">
                                                        <div style={{
                                                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                            borderRadius: '8px',
                                                            padding: '8px',
                                                            marginRight: '12px',
                                                            fontSize: '20px'
                                                        }}>
                                                            {isEdit ? "✏️" : "➕"}
                                                        </div>
                                                        <                                                        h3 style={{ 
                                                            margin: 0, 
                                                            fontWeight: '700',
                                                            fontSize: '24px',
                                                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                                                        }}>
                                                            {isEdit ? "Editar Período" : "Crear Período"}
                                                        </h3>
                                                    </div>
                                                    <p style={{ 
                                                        margin: 0, 
                                                        fontSize: '14px',
                                                        opacity: 0.9,
                                                        fontWeight: '400'
                                                    }}>
                                                        {isEdit 
                                                            ? `Modificando: ${periodoSeleccionado?.label || 'Período'}`
                                                            : 'Complete la información del nuevo período'
                                                        }
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="outline-light"
                                                    size="sm"
                                                    onClick={handleCloseDrawer}
                                                    style={{
                                                        border: '2px solid rgba(255, 255, 255, 0.3)',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                        color: '#ffffff',
                                                        fontSize: '16px',
                                                        padding: '8px 12px',
                                                        borderRadius: '8px',
                                                        transition: 'all 0.2s ease',
                                                        backdropFilter: 'blur(10px)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                                                        e.currentTarget.style.transform = 'scale(1.05)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                                                        e.currentTarget.style.transform = 'scale(1)';
                                                    }}
                                                >
                                                    ✕
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Breadcrumb/Status Bar */}
                                        <div style={{
                                            padding: '12px 24px',
                                            backgroundColor: isDark ? '#1f2937' : '#f1f5f9',
                                            borderBottom: isDark ? '1px solid #374151' : '1px solid #e2e8f0'
                                        }}>
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="d-flex align-items-center">
                                                    <span style={{
                                                        fontSize: '12px',
                                                        color: isDark ? '#9ca3af' : '#64748b',
                                                        fontWeight: '500'
                                                    }}>
                                                        Gestión de Áreas
                                                    </span>
                                                    <span style={{ 
                                                        margin: '0 8px', 
                                                        color: isDark ? '#6b7280' : '#94a3b8' 
                                                    }}>›</span>
                                                    <span style={{
                                                        fontSize: '12px',
                                                        color: isDark ? '#e5e7eb' : '#475569',
                                                        fontWeight: '600'
                                                    }}>
                                                        {isEdit ? 'Edición' : 'Creación'}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    backgroundColor: isEdit 
                                                        ? (isDark ? '#d97706' : '#f59e0b') 
                                                        : (isDark ? '#059669' : '#10b981'),
                                                    color: '#ffffff',
                                                    padding: '4px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    {isEdit ? 'Editando' : 'Creando'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form Content */}
                                    <div style={{ 
                                        flex: 1, 
                                        padding: '32px 24px 24px 24px', 
                                        overflowY: 'auto',
                                        backgroundColor: isDark ? '#111827' : '#ffffff'
                                    }}>
                                        <Form onSubmit={submit}>
                                            <Form.Group className="mb-4">
                                                <Form.Label style={{
                                                    fontWeight: '600',
                                                    color: isDark ? '#e5e7eb' : '#374151',
                                                    fontSize: '14px',
                                                    marginBottom: '8px'
                                                }}>
                                                    Label *
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    id="label"
                                                    ref={labelRef}
                                                    placeholder="Ingrese el label del período"
                                                    value={formValues.label}
                                                    onChange={handleInputChange}
                                                    style={{
                                                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                                        borderColor: isDark ? '#374151' : '#d1d5db',
                                                        color: isDark ? '#ffffff' : '#000000',
                                                        padding: '12px 16px',
                                                        fontSize: '14px',
                                                        borderRadius: '8px',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                />
                                                {formErrors.label && (
                                                    <div style={{ 
                                                        color: '#ef4444', 
                                                        fontSize: '13px', 
                                                        marginTop: '6px',
                                                        padding: '8px 12px',
                                                        backgroundColor: isDark ? '#7f1d1d' : '#fef2f2',
                                                        borderRadius: '6px',
                                                        border: '1px solid #ef4444'
                                                    }}>
                                                        ⚠️ {formErrors.label}
                                                    </div>
                                                )}
                                            </Form.Group>

                                            <Form.Group className="mb-4">
                                                <Form.Label style={{
                                                    fontWeight: '600',
                                                    color: isDark ? '#e5e7eb' : '#374151',
                                                    fontSize: '14px',
                                                    marginBottom: '8px'
                                                }}>
                                                    Fecha Inicio *
                                                </Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    id="fecha_inicio"
                                                    value={formValues.fecha_inicio instanceof Date ? formValues.fecha_inicio.toISOString().split('T')[0] : formValues.fecha_inicio}
                                                    onChange={handleInputChange}
                                                    style={{
                                                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                                        borderColor: isDark ? '#374151' : '#d1d5db',
                                                        color: isDark ? '#ffffff' : '#000000',
                                                        padding: '12px 16px',
                                                        fontSize: '14px',
                                                        borderRadius: '8px',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                />
                                                {formErrors.fecha_inicio && (
                                                    <div style={{ 
                                                        color: '#ef4444', 
                                                        fontSize: '13px', 
                                                        marginTop: '6px',
                                                        padding: '8px 12px',
                                                        backgroundColor: isDark ? '#7f1d1d' : '#fef2f2',
                                                        borderRadius: '6px',
                                                        border: '1px solid #ef4444'
                                                    }}>
                                                        ⚠️ {formErrors.fecha_inicio}
                                                    </div>
                                                )}
                                            </Form.Group>

                                            <Form.Group className="mb-4">
                                                <Form.Label style={{
                                                    fontWeight: '600',
                                                    color: isDark ? '#e5e7eb' : '#374151',
                                                    fontSize: '14px',
                                                    marginBottom: '8px'
                                                }}>
                                                    Fecha Fin *
                                                </Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    id="fecha_fin"
                                                    value={formValues.fecha_fin instanceof Date ? formValues.fecha_fin.toISOString().split('T')[0] : formValues.fecha_fin}
                                                    onChange={handleInputChange}
                                                    style={{
                                                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                                        borderColor: isDark ? '#374151' : '#d1d5db',
                                                        color: isDark ? '#ffffff' : '#000000',
                                                        padding: '12px 16px',
                                                        fontSize: '14px',
                                                        borderRadius: '8px',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                />
                                                {formErrors.fecha_fin && (
                                                    <div style={{ 
                                                        color: '#ef4444', 
                                                        fontSize: '13px', 
                                                        marginTop: '6px',
                                                        padding: '8px 12px',
                                                        backgroundColor: isDark ? '#7f1d1d' : '#fef2f2',
                                                        borderRadius: '6px',
                                                        border: '1px solid #ef4444'
                                                    }}>
                                                        ⚠️ {formErrors.fecha_fin}
                                                    </div>
                                                )}
                                            </Form.Group>

                                            <Form.Group className="mb-4">
                                                <Form.Label style={{
                                                    fontWeight: '600',
                                                    color: isDark ? '#e5e7eb' : '#374151',
                                                    fontSize: '14px',
                                                    marginBottom: '8px'
                                                }}>
                                                    Estado *
                                                </Form.Label>
                                                <Form.Select
                                                    id="estado"
                                                    value={formValues.estado}
                                                    onChange={handleInputChange}
                                                    style={{
                                                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                                        borderColor: isDark ? '#374151' : '#d1d5db',
                                                        color: isDark ? '#ffffff' : '#000000',
                                                        padding: '12px 16px',
                                                        fontSize: '14px',
                                                        borderRadius: '8px',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    <option value="">Seleccione un estado</option>
                                                    <option value="SI">SI</option>
                                                    <option value="NO">NO</option>
                                                </Form.Select>
                                                {formErrors.estado && (
                                                    <div style={{ 
                                                        color: '#ef4444', 
                                                        fontSize: '13px', 
                                                        marginTop: '6px',
                                                        padding: '8px 12px',
                                                        backgroundColor: isDark ? '#7f1d1d' : '#fef2f2',
                                                        borderRadius: '6px',
                                                        border: '1px solid #ef4444'
                                                    }}>
                                                        ⚠️ {formErrors.estado}
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Form>
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{ 
                                        padding: '20px 24px', 
                                        borderTop: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                                        backgroundColor: isDark ? '#1f2937' : '#f8f9fa'
                                    }}>
                                        <div className="d-flex gap-3">
                                            <Button 
                                                variant="success" 
                                                type="submit" 
                                                className="flex-fill"
                                                onClick={handleSubmit}
                                                disabled={submitting}
                                                style={{
                                                    backgroundColor: isDark ? '#059669' : '#10b981',
                                                    borderColor: isDark ? '#047857' : '#059669',
                                                    padding: '12px 24px',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    borderRadius: '8px',
                                                    transition: 'all 0.2s ease',
                                                    opacity: submitting ? 0.7 : 1
                                                }}
                                            >
                                                {submitting 
                                                    ? (isEdit ? "💾 Actualizando..." : "➕ Creando...") 
                                                    : (isEdit ? "💾 Actualizar Período" : "➕ Crear Período")
                                                }
                                            </Button>
                                            <Button 
                                                variant="outline-secondary" 
                                                onClick={handleCloseDrawer}
                                                style={{
                                                    borderColor: isDark ? '#6b7280' : '#9ca3af',
                                                    color: isDark ? '#9ca3af' : '#6b7280',
                                                    backgroundColor: 'transparent',
                                                    padding: '12px 24px',
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    borderRadius: '8px',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                🚫 Cancelar
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Drawer>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </>
    )
}

export default PeriodoPage