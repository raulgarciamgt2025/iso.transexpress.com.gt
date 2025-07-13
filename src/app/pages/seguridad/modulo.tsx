import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Row, Table, Spinner, Button, Form } from 'react-bootstrap'
import { useEffect, useState, useRef } from 'react'
import { fetchModulo, fetchModuloById, createModulo, updateModulo, deleteModulo, Modulo } from '@/servicios/moduloProvider'
import Swal from 'sweetalert2'
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import { BiEdit, BiPlus, BiTrash, BiRefresh } from 'react-icons/bi'
import { useFormContext } from "@/utils/formContext.jsx";
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


const ModulosPage = () => {
    const { theme, changeTheme } = useLayoutContext()
    const isDark = theme === 'dark'
    const [modulos, setModulos] = useState<Modulo[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [showDrawer, setShowDrawer] = useState(false)
    const [moduloSeleccionado, setModuloSeleccionado] = useState<Modulo | null>(null)
    const [isEdit, setEdit] = useState(true)
    const { formValuesData } = useFormContext({
        id_empresa: sessionStorage.getItem("id_empresa") || "0"
    });
    const { user } = useAuthContext()
    const { token, id_empresa } = user || {}
    const descripcionRef = useRef<HTMLInputElement>(null)
    const [formValues, setFormValues] = useState({
        id_modulo: 0,
        descripcion: '',
        orden: 0,
    })

    const [search, setSearch] = useState('');
    const [columnFilters, setColumnFilters] = useState({
        id_modulo: '',
        descripcion: '',
        orden: '',
    });

    const handleColumnFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setColumnFilters(prev => ({ ...prev, [name]: value }));
    };

    const columns = [
        { 
            name: 'ID', 
            selector: (row: Modulo) => row.id_modulo, 
            sortable: true,
            width: '80px',
            cell: (row: Modulo) => (
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
                    {row.id_modulo}
                </div>
            )
        },
        { 
            name: 'Descripción', 
            selector: (row: Modulo) => row.descripcion, 
            sortable: true,
            cell: (row: Modulo) => (
                <div style={{ 
                    fontWeight: '500',
                    color: isDark ? '#f3f4f6' : '#1f2937'
                }}>
                    {row.descripcion}
                </div>
            )
        },
        { 
            name: 'Orden', 
            selector: (row: Modulo) => row.orden, 
            sortable: true,
            width: '100px',
            cell: (row: Modulo) => (
                <div style={{ 
                    backgroundColor: isDark ? '#065f46' : '#f0fdf4',
                    color: isDark ? '#34d399' : '#16a34a',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textAlign: 'center',
                    border: isDark ? '1px solid #059669' : '1px solid #22c55e'
                }}>
                    {row.orden}
                </div>
            )
        },
        {
            name: 'Acciones',
            cell: (modulo) => (
                <div className="d-flex gap-2">
                    <Button
                        variant="warning"
                        size="sm"
                        className="d-flex align-items-center"
                        onClick={() => handleEdit(modulo)}
                        style={{
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '12px',
                            fontWeight: '500',
                            border: 'none',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            transition: 'all 0.2s ease'
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
                        Edita
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        className="d-flex align-items-center"
                        onClick={() => handleDelete(modulo)}
                        style={{
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '12px',
                            fontWeight: '500',
                            border: 'none',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            transition: 'all 0.2s ease'
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

    const filteredMenu = modulos.filter((menu) => {
        const s = search.toLowerCase();
        const globalMatch = (
            String(menu.id_modulo).includes(s) ||
            (menu.descripcion?.toLowerCase().includes(s)) ||
            String(menu.orden).includes(s) 
        );

        const columnMatch = (
            String(menu.id_modulo).includes(columnFilters.id_modulo) &&
            (menu.descripcion?.toLowerCase().includes(columnFilters.descripcion.toLowerCase()) || columnFilters.descripcion === '') &&
            String(menu.orden).includes(columnFilters.orden)
        );

        return globalMatch && columnMatch;
    });


    const validateForm = () => {
        const errors: { [key: string]: string } = {};
        if (!formValues.descripcion.trim()) {
            errors.descripcion = "La descripción es obligatoria.";
        }
        if (!formValues.orden) {
            errors.orden = "El orden es obligatorio.";
        }
        return errors;
    };

    const [formErrors, setFormErrors] = useState<{
        descripcion?: string
        orden?: string
    }>({})

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormValues(prev => ({
            ...prev,
            [id]: id === "orden" ? Number(value) : value,
        }))


    }

    const handleCancel = () => {
        setShowDrawer(false)
        setModuloSeleccionado(null)
        setFormErrors({})
    }

    const handleCreate = () => {
        setModuloSeleccionado(null)
        setShowDrawer(true)
        setEdit(false)
        setFormValues({
            id_modulo: 0,
            descripcion: '',
            orden: 0,
        })
        setFormErrors({})
    }

    const handleReload = async () => {
        setLoading(true)
        try {
            await getModulos()
        } catch (error) {
            setError('Error al recargar módulos')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (moduloSeleccionado) {
            setFormValues({
                id_modulo: moduloSeleccionado.id_modulo || 0,
                descripcion: moduloSeleccionado.descripcion || '',
                orden: moduloSeleccionado.orden || 0,
            })
            setFormErrors({})
        }

        const fetchData = async () => {
            await getModulos();
        };
        fetchData();
    }, [moduloSeleccionado, formValuesData])

    // Focus on descripcion field when drawer opens
    useEffect(() => {
        if (showDrawer && descripcionRef.current) {
            // Small delay to ensure the drawer is fully rendered
            const timer = setTimeout(() => {
                descripcionRef.current?.focus();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [showDrawer])

    const getModulos = async () => {
        fetchModulo(token)
            .then(data => setModulos(data))
            .catch(() => setError('Error al cargar módulos'))
            .finally(() => setLoading(false))
    }

    const handleEdit = async (modulo: Modulo) => {
        try {
            const data = await fetchModuloById(modulo.id_modulo!, token);
            setModuloSeleccionado(data);
            setFormErrors({});
            setEdit(true);
            setShowDrawer(true);
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo obtener la información del módulo.',
                icon: 'error',
            });
        }
    }

    const handleGuardar = () => {
        setShowDrawer(true);
        setEdit(false);
    }

    const handleCloseDrawer = () => {
        setShowDrawer(false)
        setModuloSeleccionado(null)
    }

    const handleDelete = (modulo: Modulo) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar el módulo "${modulo.descripcion}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                await deleteModulo(modulo.id_modulo, token);
                await getModulos();
                Swal.fire('Eliminado', 'El módulo ha sido eliminado.', 'success')
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
        if (isEdit) {
            if (!moduloSeleccionado) {
                Swal.fire({
                    title: 'Error',
                    text: 'No se ha seleccionado un módulo para editar.',
                    icon: 'error',
                });
                return;
            }

            const update = await updateModulo({
                id_modulo: moduloSeleccionado.id_modulo,
                descripcion: formValues.descripcion,
                orden: formValues.orden,
            }, token);

            if ((update as any).estado !== false) {
                await getModulos();

                Swal.fire({
                    title: 'Registro Modificado',
                    text: 'Se ha modificado el registro.',
                    icon: 'success',
                });

                setFormValues({
                    id_modulo: 0,
                    descripcion: "",
                    orden: 0,
                });

                setEdit(false);
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'No se ha podido modificar el registro.',
                    icon: 'error',
                });
            }

            setFormErrors({});
            setShowDrawer(false);
        } else {
            const newEntrie = await createModulo({
                descripcion: formValues.descripcion,
                orden: formValues.orden,
            }, token);

            if ((newEntrie as any).estado !== false) {
                await getModulos();

                Swal.fire({
                    title: 'Registro exitoso',
                    text: 'Se ha creado un nuevo registro.',
                    icon: 'success',
                });

                setFormValues({
                    id_modulo: 0,
                    descripcion: "",
                    orden: 0,
                });

                setEdit(false);
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'No se ha podido crear el registro.',
                    icon: 'error',
                });
            }

            setFormErrors({});
            setShowDrawer(false);
        }
    };

    if (loading) return <Spinner animation="border" />
    if (error) return <div>{error}</div>

    return (
        <>
            <PageTitle title="Módulos" />
            <Row>
                <Col xs={12}>
                    <Card>
                        <CardBody>
                            <div className="d-flex align-items-center mb-1">
                                <h4 className="header-title mb-0 me-2">Módulos</h4>
                                <div className="d-flex gap-2">
                                    <Button 
                                        variant="primary" 
                                        size="sm" 
                                        onClick={handleCreate}
                                        style={{
                                            borderRadius: '6px',
                                            padding: '6px 12px',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            border: 'none',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            transition: 'all 0.2s ease'
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
                                        <BiPlus size={16} className="me-1" />
                                        Crear
                                    </Button>
                                    <Button 
                                        variant="outline-secondary" 
                                        size="sm" 
                                        onClick={handleReload}
                                        disabled={loading}
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
                                            if (!loading) {
                                                e.currentTarget.style.backgroundColor = isDark ? '#404040' : '#f3f4f6';
                                                e.currentTarget.style.color = isDark ? '#ffffff' : '#374151';
                                                e.currentTarget.style.borderColor = isDark ? '#525252' : '#9ca3af';
                                                e.currentTarget.style.transform = 'translateY(-1px)';
                                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!loading) {
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
                                            className={`me-1 ${loading ? 'spin' : ''}`} 
                                            style={{
                                                animation: loading ? 'spin 1s linear infinite' : 'none'
                                            }}
                                        />
                                        {loading ? 'Cargando...' : 'Recargar'}
                                    </Button>
                                </div>
                            </div>
                            <p className="text-muted">Gestión de módulos</p>

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
                                        <Col xs={12} md={4} className="mb-2">
                                            <Form.Label className="small text-muted mb-1">ID</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="id_modulo"
                                                placeholder="Filtrar por ID"
                                                value={columnFilters.id_modulo}
                                                onChange={handleColumnFilterChange}
                                                size="sm"
                                                style={{ borderRadius: '6px' }}
                                            />
                                        </Col>
                                        <Col xs={12} md={4} className="mb-2">
                                            <Form.Label className="small text-muted mb-1">Descripción</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="descripcion"
                                                placeholder="Filtrar por Descripción"
                                                value={columnFilters.descripcion}
                                                onChange={handleColumnFilterChange}
                                                size="sm"
                                                style={{ borderRadius: '6px' }}
                                            />
                                        </Col>
                                        <Col xs={12} md={4} className="mb-2">
                                            <Form.Label className="small text-muted mb-1">Orden</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="orden"
                                                placeholder="Filtrar por Orden"
                                                value={columnFilters.orden}
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
                                    data={filteredMenu}
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
                                            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📋</div>
                                            <h5 style={{ fontWeight: '600', marginBottom: '8px', color: isDark ? '#e5e7eb' : '#374151' }}>
                                                No hay datos disponibles
                                            </h5>
                                            <p style={{ fontSize: '14px', margin: 0 }}>
                                                No se encontraron módulos que coincidan con los criterios de búsqueda.
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
                                                        <h3 style={{ 
                                                            margin: 0, 
                                                            fontWeight: '700',
                                                            fontSize: '24px',
                                                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                                                        }}>
                                                            {isEdit ? "Editar Módulo" : "Crear Módulo"}
                                                        </h3>
                                                    </div>
                                                    <p style={{ 
                                                        margin: 0, 
                                                        fontSize: '14px',
                                                        opacity: 0.9,
                                                        fontWeight: '400'
                                                    }}>
                                                        {isEdit 
                                                            ? `Modificando: ${moduloSeleccionado?.descripcion || 'Módulo'}`
                                                            : 'Complete la información del nuevo módulo'
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
                                                        Gestión de Módulos
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
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    {isEdit ? 'EDITANDO' : 'NUEVO'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div style={{ 
                                        flex: 1,
                                        padding: '24px',
                                        overflowY: 'auto'
                                    }}>
                                        <Form onSubmit={submit}>
                                            <Row>
                                                <Col xs={12}>
                                                    <Form.Group className="mb-4">
                                                        <Form.Label style={{
                                                            fontWeight: '600',
                                                            color: isDark ? '#e5e7eb' : '#374151',
                                                            fontSize: '14px',
                                                            marginBottom: '8px'
                                                        }}>
                                                            Descripción *
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            id="descripcion"
                                                            ref={descripcionRef}
                                                            placeholder="Ingrese la descripción del módulo"
                                                            value={formValues.descripcion}
                                                            onChange={handleInputChange}
                                                            style={{
                                                                borderRadius: '8px',
                                                                border: isDark ? '1px solid #404040' : '1px solid #d1d5db',
                                                                backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
                                                                color: isDark ? '#ffffff' : '#000000',
                                                                padding: '12px 16px',
                                                                fontSize: '14px',
                                                                transition: 'all 0.2s ease',
                                                                ...(formErrors.descripcion && {
                                                                    borderColor: '#ef4444',
                                                                    boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)'
                                                                })
                                                            }}
                                                            onFocus={(e) => {
                                                                if (!formErrors.descripcion) {
                                                                    e.target.style.borderColor = '#3b82f6';
                                                                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                                                }
                                                            }}
                                                            onBlur={(e) => {
                                                                if (!formErrors.descripcion) {
                                                                    e.target.style.borderColor = isDark ? '#404040' : '#d1d5db';
                                                                    e.target.style.boxShadow = 'none';
                                                                }
                                                            }}
                                                        />
                                                        {formErrors.descripcion && (
                                                            <div style={{
                                                                color: '#ef4444',
                                                                fontSize: '13px',
                                                                marginTop: '6px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px'
                                                            }}>
                                                                ⚠️ {formErrors.descripcion}
                                                            </div>
                                                        )}
                                                    </Form.Group>
                                                </Col>
                                                <Col xs={12}>
                                                    <Form.Group className="mb-4">
                                                        <Form.Label style={{
                                                            fontWeight: '600',
                                                            color: isDark ? '#e5e7eb' : '#374151',
                                                            fontSize: '14px',
                                                            marginBottom: '8px'
                                                        }}>
                                                            Orden *
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            min={0}
                                                            step={1}
                                                            id="orden"
                                                            placeholder="Ingrese el orden del módulo"
                                                            value={formValues.orden}
                                                            onChange={handleInputChange}
                                                            style={{
                                                                borderRadius: '8px',
                                                                border: isDark ? '1px solid #404040' : '1px solid #d1d5db',
                                                                backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
                                                                color: isDark ? '#ffffff' : '#000000',
                                                                padding: '12px 16px',
                                                                fontSize: '14px',
                                                                transition: 'all 0.2s ease',
                                                                ...(formErrors.orden && {
                                                                    borderColor: '#ef4444',
                                                                    boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)'
                                                                })
                                                            }}
                                                            onFocus={(e) => {
                                                                if (!formErrors.orden) {
                                                                    e.target.style.borderColor = '#3b82f6';
                                                                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                                                }
                                                            }}
                                                            onBlur={(e) => {
                                                                if (!formErrors.orden) {
                                                                    e.target.style.borderColor = isDark ? '#404040' : '#d1d5db';
                                                                    e.target.style.boxShadow = 'none';
                                                                }
                                                            }}
                                                        />
                                                        {formErrors.orden && (
                                                            <div style={{
                                                                color: '#ef4444',
                                                                fontSize: '13px',
                                                                marginTop: '6px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px'
                                                            }}>
                                                                ⚠️ {formErrors.orden}
                                                            </div>
                                                        )}
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Form>
                                    </div>

                                    {/* Footer */}
                                    <div style={{
                                        padding: '16px 24px 24px 24px',
                                        borderTop: isDark ? '1px solid #404040' : '1px solid #e5e7eb',
                                        backgroundColor: isDark ? '#2d2d2d' : '#f8f9fa',
                                    }}>
                                        <div className="d-flex gap-3">
                                            <Button
                                                variant="success"
                                                type="submit"
                                                className="flex-fill"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    const form = e.currentTarget.closest('.custom-drawer').querySelector('form');
                                                    if (form) {
                                                        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                                                        form.dispatchEvent(submitEvent);
                                                    }
                                                }}
                                                style={{
                                                    borderRadius: '8px',
                                                    padding: '12px 24px',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    border: 'none',
                                                    backgroundColor: '#16a34a',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#15803d';
                                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#16a34a';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                                }}
                                            >
                                                {isEdit ? "💾 Actualizar" : "💾 Guardar"}
                                            </Button>
                                            <Button
                                                variant="outline-secondary"
                                                type="button"
                                                className="flex-fill"
                                                onClick={handleCancel}
                                                style={{
                                                    borderRadius: '8px',
                                                    padding: '12px 24px',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    border: isDark ? '1px solid #404040' : '1px solid #d1d5db',
                                                    backgroundColor: 'transparent',
                                                    color: isDark ? '#9ca3af' : '#6b7280',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = isDark ? '#404040' : '#f3f4f6';
                                                    e.currentTarget.style.color = isDark ? '#ffffff' : '#374151';
                                                    e.currentTarget.style.borderColor = isDark ? '#525252' : '#9ca3af';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                    e.currentTarget.style.color = isDark ? '#9ca3af' : '#6b7280';
                                                    e.currentTarget.style.borderColor = isDark ? '#404040' : '#d1d5db';
                                                }}
                                            >
                                                ❌ Cancelar
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

export default ModulosPage
