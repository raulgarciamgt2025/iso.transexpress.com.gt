import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Row, Table, Spinner, Button, Form } from 'react-bootstrap'
import { useEffect, useState, useRef } from 'react'
import { fetchEmpresas, deleteEmpresa, fetchEmpresaById, createEmpresa, updateEmpresas, Empresa } from '@/servicios/empresaProvider'
import Swal from 'sweetalert2'
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import { useAuthContext } from '@/context/useAuthContext'
import DataTable, { TableColumn } from 'react-data-table-component'
import { BiEdit, BiPlus, BiTrash, BiRefresh } from 'react-icons/bi'
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

const EmpresasPage = () => {
    const { theme, changeTheme } = useLayoutContext()
    const isDark = theme === 'dark'
    const [empresas, setEmpresas] = useState<Empresa[]>([])
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [showDrawer, setShowDrawer] = useState(false)
    const [empresaSeleccionada, setEmpresaSeleccionada] = useState<Empresa | null>(null)
    const [isEdit, setEdit] = useState(true)
    const { user } = useAuthContext()
    const { token } = user || {}
    const [search, setSearch] = useState('')
    const nombreRef = useRef<HTMLInputElement>(null)
    const [isReloading, setIsReloading] = useState(false)
    const [columnFilters, setColumnFilters] = useState({
        id_empresa: '',
        nombre: '',
        direccion: '',
        contacto: '',
    });

    const handleColumnFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setColumnFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredEmpresas = empresas.filter((empresa) => {
        const s = search.toLowerCase();
        const globalMatch = (
            String(empresa.id_empresa).includes(s) ||
            (empresa.nombre?.toLowerCase().includes(s)) ||
            (empresa.direccion?.toLowerCase().includes(s)) ||
            (empresa.contacto?.toLowerCase().includes(s))
        );

        const columnMatch = (
            String(empresa.id_empresa).includes(columnFilters.id_empresa) &&
            (empresa.nombre?.toLowerCase().includes(columnFilters.nombre.toLowerCase()) || columnFilters.nombre === '') &&
            (empresa.direccion?.toLowerCase().includes(columnFilters.direccion.toLowerCase()) || columnFilters.direccion === '') &&
            (empresa.contacto?.toLowerCase().includes(columnFilters.contacto.toLowerCase()) || columnFilters.contacto === '')
        );

        return globalMatch && columnMatch;
    });

    const [formValues, setFormValues] = useState({
        id_empresa: 0,
        nombre: '',
        direccion: '',
        contacto: '',
    })

    const columns: TableColumn<Empresa>[] = [
        {
            name: 'ID',
            selector: row => row.id_empresa,
            sortable: true,
            width: '80px',
            cell: (row: Empresa) => (
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
                    {row.id_empresa}
                </div>
            )
        },
        {
            name: 'Nombre',
            selector: row => row.nombre,
            sortable: true,
            cell: (row: Empresa) => (
                <div style={{ 
                    fontWeight: '500',
                    color: isDark ? '#f3f4f6' : '#1f2937'
                }}>
                    {row.nombre}
                </div>
            )
        },
        {
            name: 'Dirección',
            selector: row => row.direccion,
            sortable: true,
            cell: (row: Empresa) => (
                <div style={{ 
                    fontWeight: '400',
                    color: isDark ? '#d1d5db' : '#374151',
                    fontSize: '14px'
                }}>
                    {row.direccion}
                </div>
            )
        },
        {
            name: 'Contacto',
            selector: row => row.contacto,
            sortable: true,
            cell: (row: Empresa) => (
                <div style={{ 
                    backgroundColor: isDark ? '#065f46' : '#f0fdf4',
                    color: isDark ? '#34d399' : '#16a34a',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500'
                }}>
                    {row.contacto}
                </div>
            )
        },
        {
            name: 'Acciones',
            cell: (empresa) => (
                <div className="d-flex gap-2">
                    <Button
                        variant="warning"
                        size="sm"
                        className="d-flex align-items-center"
                        onClick={() => handleEdit(empresa)}
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
                        onClick={() => handleDelete(empresa)}
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
        }
    ];

    const validateForm = () => {
        const errors: { [key: string]: string } = {};

        if (!formValues.nombre.trim()) {
            errors.nombre = "El nombre de la empresa es obligatorio.";
        }
        if (!formValues.direccion.trim()) {
            errors.direccion = "La dirección es obligatoria.";
        }
        if (!formValues.contacto.trim()) {
            errors.contacto = "El contacto es obligatorio.";
        }

        return errors;
    };

    useEffect(() => {
        if (empresaSeleccionada) {
            setFormValues({
                id_empresa: empresaSeleccionada.id_empresa,
                nombre: empresaSeleccionada.nombre || '',
                direccion: empresaSeleccionada.direccion || '',
                contacto: empresaSeleccionada.contacto || '',
            })
            setFormErrors({})
        }
    }, [empresaSeleccionada])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormValues(prev => ({
            ...prev,
            [id]: value,
        }))
    }

    const handleCancel = () => {
        setShowDrawer(false)
        setEmpresaSeleccionada(null)
        setFormErrors({})
    }

    const handleCreate = () => {
        setEmpresaSeleccionada(null)
        setShowDrawer(true)
        setEdit(false)
        setFormValues({
            id_empresa: 0,
            nombre: '',
            direccion: '',
            contacto: '',
        })
        setFormErrors({})
    }

    // Auto-focus when drawer opens
    useEffect(() => {
        if (showDrawer && nombreRef.current) {
            setTimeout(() => {
                nombreRef.current?.focus();
            }, 100);
        }
    }, [showDrawer]);

    useEffect(() => {
        const fetchData = async () => {
            await getEmpresas();
        };
        fetchData();
    }, [])

    const getEmpresas = async () => {
        fetchEmpresas(token)
            .then(data => setEmpresas(data))
            .catch(() => setError('Error al cargar empresas'))
            .finally(() => setLoading(false))
    }

    const handleReload = async () => {
        setIsReloading(true);
        try {
            await getEmpresas();
        } catch (error) {
            console.error('Error reloading data:', error);
        } finally {
            setIsReloading(false);
        }
    };

    const handleEdit = async (empresa: Empresa) => {
        try {
            const data = await fetchEmpresaById(empresa.id_empresa, token);
            setEmpresaSeleccionada(data[0]);
            setFormErrors({});
            setEdit(true);
            setShowDrawer(true);
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo obtener la información de la empresa.',
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
        setEmpresaSeleccionada(null)
    }

    const handleDelete = (empresa: Empresa) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar la empresa "${empresa.nombre}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const deleteResult = await deleteEmpresa(empresa.id_empresa, token);
                    if (deleteResult.estado === false) {
                        Swal.fire('Error', deleteResult.mensaje || 'No se pudo eliminar la empresa.', 'error');
                    } else {
                        await getEmpresas();
                        Swal.fire('Eliminado', 'La empresa ha sido eliminada.', 'success');
                    }
                } catch (error) {
                    Swal.fire('Error', 'Ocurrió un error al eliminar la empresa.', 'error');
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
                if (!empresaSeleccionada) {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se ha seleccionado una empresa para editar.',
                        icon: 'error',
                    });
                    return;
                }

                const update = await updateEmpresas({
                    id_empresa: empresaSeleccionada.id_empresa,
                    ...formValues,
                }, token);

                if (update?.estado !== false) {
                    await getEmpresas();
                    Swal.fire({
                        title: 'Registro Modificado',
                        text: update?.mensaje || 'Se ha modificado el registro exitosamente.',
                        icon: 'success',
                    });
                    setShowDrawer(false);
                    setFormErrors({});
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: update?.mensaje || 'No se ha podido modificar el registro.',
                        icon: 'error',
                    });
                }
            } else {
                const newEntry = await createEmpresa({
                    nombre: formValues.nombre,
                    direccion: formValues.direccion,
                    contacto: formValues.contacto,
                }, token);

                if (newEntry?.estado !== false) {
                    await getEmpresas();
                    Swal.fire({
                        title: 'Registro exitoso',
                        text: newEntry?.mensaje || 'Se ha creado un nuevo registro exitosamente.',
                        icon: 'success',
                    });
                    setShowDrawer(false);
                    setFormErrors({});
                    // Reset form
                    setFormValues({
                        id_empresa: 0,
                        nombre: "",
                        direccion: "",
                        contacto: "",
                    });
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: newEntry?.mensaje || 'No se ha podido crear el registro.',
                        icon: 'error',
                    });
                }
            }
        } catch (error) {
            console.error('Error in submit:', error);
            Swal.fire({
                title: 'Error',
                text: 'Ocurrió un error inesperado. Por favor, intente de nuevo.',
                icon: 'error',
            });
        }
    };

    if (loading) return <Spinner animation="border" />
    if (error) return <div>{error}</div>

    return (
        <>
            <PageTitle title="Empresas" />
            <Row>
                <Col xs={12}>
                    <Card>
                        <CardBody>
                            <div className="d-flex align-items-center justify-content-between mb-1">
                                <div className="d-flex align-items-center">
                                    <h4 className="header-title mb-0 me-2">Empresas</h4>
                                    <Button variant="primary" size="sm" onClick={handleCreate} className="me-2">
                                        <BiPlus size={20} className="me-1" />
                                        Crear
                                    </Button>
                                    <Button 
                                        variant="outline-secondary" 
                                        size="sm" 
                                        onClick={handleReload}
                                        disabled={isReloading}
                                        className="d-flex align-items-center"
                                    >
                                        <BiRefresh 
                                            size={16} 
                                            className={`me-1 ${isReloading ? 'spin' : ''}`} 
                                        />
                                        {isReloading ? 'Cargando...' : 'Recargar'}
                                    </Button>
                                </div>
                            </div>
                            <p className="text-muted">Gestión de empresas</p>

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
                                        <Col xs={12} md={3} className="mb-2">
                                            <Form.Label className="small text-muted mb-1">ID</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="id_empresa"
                                                placeholder="Filtrar por ID"
                                                value={columnFilters.id_empresa}
                                                onChange={handleColumnFilterChange}
                                                size="sm"
                                                style={{ borderRadius: '6px' }}
                                            />
                                        </Col>
                                        <Col xs={12} md={3} className="mb-2">
                                            <Form.Label className="small text-muted mb-1">Nombre</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="nombre"
                                                placeholder="Filtrar por Nombre"
                                                value={columnFilters.nombre}
                                                onChange={handleColumnFilterChange}
                                                size="sm"
                                                style={{ borderRadius: '6px' }}
                                            />
                                        </Col>
                                        <Col xs={12} md={3} className="mb-2">
                                            <Form.Label className="small text-muted mb-1">Dirección</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="direccion"
                                                placeholder="Filtrar por Dirección"
                                                value={columnFilters.direccion}
                                                onChange={handleColumnFilterChange}
                                                size="sm"
                                                style={{ borderRadius: '6px' }}
                                            />
                                        </Col>
                                        <Col xs={12} md={3} className="mb-2">
                                            <Form.Label className="small text-muted mb-1">Contacto</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="contacto"
                                                placeholder="Filtrar por Contacto"
                                                value={columnFilters.contacto}
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
                                    data={filteredEmpresas}
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
                                                color: isDark ? '#e5e7eb' : '#374151',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                paddingLeft: '16px',
                                                paddingRight: '16px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            },
                                        },
                                        rows: {
                                            style: {
                                                backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                                                color: isDark ? '#e5e7eb' : '#374151',
                                                fontSize: '14px',
                                                borderBottom: isDark ? '1px solid #404040' : '1px solid #f1f5f9',
                                                minHeight: '60px',
                                                '&:hover': {
                                                    backgroundColor: isDark ? '#2d2d2d' : '#f8fafc',
                                                    transform: 'scale(1.001)',
                                                    boxShadow: isDark 
                                                        ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
                                                        : '0 2px 8px rgba(0, 0, 0, 0.08)',
                                                },
                                                transition: 'all 0.2s ease'
                                            },
                                        },
                                        cells: {
                                            style: {
                                                paddingLeft: '16px',
                                                paddingRight: '16px',
                                            },
                                        },
                                        pagination: {
                                            style: {
                                                backgroundColor: isDark ? '#2d2d2d' : '#f8f9fa',
                                                color: isDark ? '#e5e7eb' : '#374151',
                                                borderTop: isDark ? '1px solid #404040' : '1px solid #dee2e6',
                                                borderBottomLeftRadius: '12px',
                                                borderBottomRightRadius: '12px',
                                                minHeight: '56px'
                                            },
                                        },
                                    }}
                                    noDataComponent={
                                        <div style={{
                                            padding: '60px 20px',
                                            textAlign: 'center',
                                            color: isDark ? '#9ca3af' : '#6b7280',
                                            backgroundColor: isDark ? '#1a1a1a' : '#ffffff'
                                        }}>
                                            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>
                                                🏢
                                            </div>
                                            <h5 style={{ 
                                                margin: '0 0 8px 0', 
                                                color: isDark ? '#e5e7eb' : '#374151',
                                                fontWeight: '600'
                                            }}>
                                                No hay empresas disponibles
                                            </h5>
                                            <p style={{ 
                                                margin: 0, 
                                                fontSize: '14px',
                                                opacity: 0.8
                                            }}>
                                                Crea tu primera empresa para comenzar
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
                                    top: '70px',
                                    height: 'calc(100vh - 70px)',
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
                                                            {isEdit ? "Editar Empresa" : "Crear Empresa"}
                                                        </h3>
                                                    </div>
                                                    <p style={{ 
                                                        margin: 0, 
                                                        fontSize: '14px',
                                                        opacity: 0.9,
                                                        fontWeight: '400'
                                                    }}>
                                                        {isEdit 
                                                            ? `Modificando: ${empresaSeleccionada?.nombre || 'Empresa'}`
                                                            : 'Complete la información de la nueva empresa'
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
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    ✕
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Status/Breadcrumb Bar */}
                                        <div style={{
                                            padding: '12px 24px',
                                            backgroundColor: isDark ? '#374151' : '#e0f2fe',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            color: isDark ? '#d1d5db' : '#0f172a',
                                            borderBottom: isDark ? '1px solid #4b5563' : '1px solid #bae6fd'
                                        }}>
                                            <span style={{ opacity: 0.7 }}>📍 Seguridad</span>
                                            <span style={{ margin: '0 8px', opacity: 0.5 }}>→</span>
                                            <span style={{ opacity: 0.7 }}>Empresas</span>
                                            <span style={{ margin: '0 8px', opacity: 0.5 }}>→</span>
                                            <span style={{ color: isDark ? '#60a5fa' : '#1d4ed8' }}>
                                                {isEdit ? 'Editar' : 'Crear'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Form Content */}
                                    <div style={{ 
                                        flex: 1, 
                                        padding: '24px', 
                                        overflowY: 'auto',
                                        backgroundColor: isDark ? '#1a1a1a' : '#ffffff'
                                    }}>
                                        {(empresaSeleccionada || !isEdit) && (
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
                                                                Nombre *
                                                            </Form.Label>
                                                            <Form.Control
                                                                ref={nombreRef}
                                                                type="text"
                                                                id="nombre"
                                                                placeholder="Ingrese el nombre de la empresa"
                                                                value={formValues.nombre}
                                                                onChange={handleInputChange}
                                                                style={{
                                                                    borderRadius: '8px',
                                                                    border: isDark ? '1px solid #404040' : '1px solid #d1d5db',
                                                                    backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
                                                                    color: isDark ? '#ffffff' : '#000000',
                                                                    padding: '12px 16px',
                                                                    fontSize: '14px',
                                                                    transition: 'all 0.2s ease',
                                                                    ...(formErrors.nombre && {
                                                                        borderColor: '#ef4444',
                                                                        boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)'
                                                                    })
                                                                }}
                                                            />
                                                            {formErrors.nombre && (
                                                                <div style={{
                                                                    color: '#ef4444',
                                                                    fontSize: '13px',
                                                                    marginTop: '6px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}>
                                                                    ⚠️ {formErrors.nombre}
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
                                                                Dirección *
                                                            </Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                id="direccion"
                                                                placeholder="Ingrese la dirección"
                                                                value={formValues.direccion}
                                                                onChange={handleInputChange}
                                                                style={{
                                                                    borderRadius: '8px',
                                                                    border: isDark ? '1px solid #404040' : '1px solid #d1d5db',
                                                                    backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
                                                                    color: isDark ? '#ffffff' : '#000000',
                                                                    padding: '12px 16px',
                                                                    fontSize: '14px',
                                                                    transition: 'all 0.2s ease',
                                                                    ...(formErrors.direccion && {
                                                                        borderColor: '#ef4444',
                                                                        boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)'
                                                                    })
                                                                }}
                                                            />
                                                            {formErrors.direccion && (
                                                                <div style={{
                                                                    color: '#ef4444',
                                                                    fontSize: '13px',
                                                                    marginTop: '6px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}>
                                                                    ⚠️ {formErrors.direccion}
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
                                                                Contacto *
                                                            </Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                id="contacto"
                                                                placeholder="Ingrese el contacto"
                                                                value={formValues.contacto}
                                                                onChange={handleInputChange}
                                                                style={{
                                                                    borderRadius: '8px',
                                                                    border: isDark ? '1px solid #404040' : '1px solid #d1d5db',
                                                                    backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
                                                                    color: isDark ? '#ffffff' : '#000000',
                                                                    padding: '12px 16px',
                                                                    fontSize: '14px',
                                                                    transition: 'all 0.2s ease',
                                                                    ...(formErrors.contacto && {
                                                                        borderColor: '#ef4444',
                                                                        boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)'
                                                                    })
                                                                }}
                                                            />
                                                            {formErrors.contacto && (
                                                                <div style={{
                                                                    color: '#ef4444',
                                                                    fontSize: '13px',
                                                                    marginTop: '6px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}>
                                                                    ⚠️ {formErrors.contacto}
                                                                </div>
                                                            )}
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            </Form>
                                        )}
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
                                                style={{
                                                    borderRadius: '8px',
                                                    padding: '12px 16px',
                                                    fontWeight: '600',
                                                    fontSize: '14px',
                                                    border: 'none',
                                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                                                    transition: 'all 0.2s ease'
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
                                                    padding: '12px 16px',
                                                    fontWeight: '600',
                                                    fontSize: '14px',
                                                    border: isDark ? '2px solid #6b7280' : '2px solid #d1d5db',
                                                    backgroundColor: 'transparent',
                                                    color: isDark ? '#e5e7eb' : '#374151',
                                                    transition: 'all 0.2s ease'
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

export default EmpresasPage