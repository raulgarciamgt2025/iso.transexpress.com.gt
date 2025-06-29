import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Row, Table, Spinner, Button, Form } from 'react-bootstrap'
import { useEffect, useState, useRef } from 'react'
import { fetchRol, fetchRolById, createRol, updateRol, deleteRol, Rol } from '@/servicios/rolProvider'
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


const RolPage = () => {
    const { theme, changeTheme } = useLayoutContext()
    const isDark = theme === 'dark'
    const [roles, setRoles] = useState<Rol[]>([])
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [showDrawer, setShowDrawer] = useState(false)
    const [rolSeleccionado, setRolSeleccionado] = useState<Rol | null>(null)
    const [isEdit, setEdit] = useState(true)
    const { user } = useAuthContext()
    const { token, id_empresa } = user || {}
    const [search, setSearch] = useState('')
    const descripcionRef = useRef<HTMLInputElement>(null)
    const [isReloading, setIsReloading] = useState(false)
    const [columnFilters, setColumnFilters] = useState({
        id_rol: '',
        descripcion: '',
    })
    const [formValues, setFormValues] = useState({
        id_rol: 0,
        descripcion: '',
        id_empresa: Number(id_empresa) || 0,
    })
    const validateForm = () => {
        const errors: { [key: string]: string } = {};
        if (!formValues.descripcion.trim()) {
            errors.descripcion = "La descripción del rol es obligatoria.";
        }
        return errors;
    };

    // Auto-focus on drawer open
    useEffect(() => {
        if (showDrawer && descripcionRef.current) {
            setTimeout(() => {
                descripcionRef.current?.focus();
            }, 100);
        }
    }, [showDrawer]);

    // Handle reload with animation
    const handleReload = async () => {
        setIsReloading(true);
        await getRoles();
        setTimeout(() => setIsReloading(false), 1000);
    };

    // Filtered data with per-column search
    const filteredRoles = roles.filter((rol) => {
        const matchesGlobal = search === '' || 
            String(rol.id_rol).toLowerCase().includes(search.toLowerCase()) ||
            (rol.descripcion?.toLowerCase().includes(search.toLowerCase()));
        
        const matchesColumn = 
            (columnFilters.id_rol === '' || String(rol.id_rol).includes(columnFilters.id_rol)) &&
            (columnFilters.descripcion === '' || rol.descripcion?.toLowerCase().includes(columnFilters.descripcion.toLowerCase()));
        
        return matchesGlobal && matchesColumn;
    });

    const columns: TableColumn<Rol>[] = [
        {
            name: 'ID',
            selector: (row: Rol) => row.id_rol,
            sortable: true,
            width: '100px',
            cell: (row: Rol) => (
                <div style={{
                    fontWeight: '500',
                    color: isDark ? '#d1d5db' : '#6b7280',
                    fontSize: '14px'
                }}>
                    {row.id_rol}
                </div>
            ),
        },
        {
            name: 'Descripción',
            selector: (row: Rol) => row.descripcion,
            sortable: true,
            cell: (row: Rol) => (
                <div style={{
                    fontWeight: '500',
                    color: isDark ? '#f3f4f6' : '#1f2937'
                }}>
                    {row.descripcion}
                </div>
            ),
        },
        {
            name: 'Acciones',
            cell: (rol) => (
                <div className="d-flex gap-2">
                    <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleEdit(rol)}
                        style={{
                            borderRadius: '6px',
                            padding: '6px 10px',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: '500'
                        }}
                    >
                        <BiEdit size={14} />
                        Editar
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(rol)}
                        style={{
                            borderRadius: '6px',
                            padding: '6px 10px',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: '500'
                        }}
                    >
                        <BiTrash size={14} />
                        Eliminar
                    </Button>
                </div>
            ),
            ignoreRowClick: true,
            width: '200px'
        },
    ];

    useEffect(() => {
        if (rolSeleccionado) {
            setFormValues({
                id_rol: rolSeleccionado.id_rol,
                descripcion: rolSeleccionado.descripcion || '',
                id_empresa: rolSeleccionado.id_empresa,
            })
            setFormErrors({})
        }
    }, [rolSeleccionado])

    const handleColumnFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setColumnFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormValues(prev => ({
            ...prev,
            [id]: value,
        }))
    }

    const handleCancel = () => {
        setShowDrawer(false)
        setRolSeleccionado(null)
        setFormErrors({})
    }

    const handleCreate = () => {
        setRolSeleccionado(null)
        setShowDrawer(true)
        setEdit(false)
        setFormValues({
            id_rol: 0,
            descripcion: '',
            id_empresa: Number(id_empresa) || 0,
        })
        setFormErrors({})
    }

    useEffect(() => {
        const fetchData = async () => {
            await getRoles();
        };
        fetchData();
    }, [])

    const getRoles = async () => {
        fetchRol(token, id_empresa)
            .then(data => setRoles(data))
            .catch(() => setError('Error al cargar roles'))
            .finally(() => setLoading(false))
    }

    const handleEdit = async (rol: Rol) => {
        try {
            const data = await fetchRolById(rol.id_rol, token);
            setRolSeleccionado(data[0]);
            setFormErrors({});
            setEdit(true);
            setShowDrawer(true);
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo obtener la información del rol.',
                icon: 'error',
            });
        }
    }

    const handleCloseDrawer = () => {
        setShowDrawer(false)
        setRolSeleccionado(null)
    }

    const handleDelete = (rol: Rol) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar el rol "${rol.descripcion}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const deleteResult = await deleteRol(rol.id_rol, token);
                    if (deleteResult.estado === false) {
                        Swal.fire('Error', deleteResult.mensaje || 'No se pudo eliminar el rol.', 'error');
                    } else {
                        await getRoles();
                        Swal.fire('Eliminado', 'El rol ha sido eliminado.', 'success');
                    }
                } catch (error) {
                    Swal.fire('Error', 'Ocurrió un error al eliminar el rol.', 'error');
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
                if (!rolSeleccionado) {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se ha seleccionado un rol para editar.',
                        icon: 'error',
                    });
                    return;
                }

                const update = await updateRol({
                    id_rol: rolSeleccionado.id_rol,
                    ...formValues,
                }, token);

                if (update?.estado !== false) {
                    await getRoles();
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
                const newEntry = await createRol({
                    descripcion: formValues.descripcion,
                    id_empresa: formValues.id_empresa,
                }, token);

                if (newEntry?.estado !== false) {
                    await getRoles();
                    Swal.fire({
                        title: 'Registro exitoso',
                        text: newEntry?.mensaje || 'Se ha creado un nuevo registro exitosamente.',
                        icon: 'success',
                    });
                    setShowDrawer(false);
                    setFormErrors({});
                    // Reset form
                    setFormValues({
                        id_rol: 0,
                        descripcion: "",
                        id_empresa: Number(id_empresa) || 0,
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
                text: 'Ocurrió un error inesperado.',
                icon: 'error',
            });
        }
    };

    const handleSubmit = async () => {
        const fakeEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
        await submit(fakeEvent);
    };

    if (loading) return <Spinner animation="border" />
    if (error) return <div>{error}</div>

    return (
        <>
            <PageTitle title="Roles" />
            <Row>
                <Col xs={12}>
                    <Card style={{
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: isDark ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.07)',
                        backgroundColor: isDark ? '#1f2937' : '#ffffff'
                    }}>
                        <CardBody style={{ padding: '24px' }}>
                            {/* Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '24px',
                                paddingBottom: '16px',
                                borderBottom: isDark ? '1px solid #374151' : '1px solid #e5e7eb'
                            }}>
                                <div>
                                    <h4 style={{
                                        margin: '0 0 4px 0',
                                        fontWeight: '700',
                                        fontSize: '24px',
                                        color: isDark ? '#f9fafb' : '#111827'
                                    }}>
                                        🛡️ Gestión de Roles
                                    </h4>
                                    <p style={{
                                        margin: 0,
                                        color: isDark ? '#9ca3af' : '#6b7280',
                                        fontSize: '14px'
                                    }}>
                                        Administra los roles del sistema
                                    </p>
                                </div>
                                <div className="d-flex gap-2">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={handleReload}
                                        disabled={isReloading}
                                        style={{
                                            borderRadius: '8px',
                                            padding: '8px 16px',
                                            border: isDark ? '2px solid #3b82f6' : '2px solid #3b82f6',
                                            backgroundColor: 'transparent',
                                            color: isDark ? '#60a5fa' : '#3b82f6',
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <BiRefresh 
                                            size={16} 
                                            className={isReloading ? 'spin' : ''} 
                                        />
                                        {isReloading ? 'Recargando...' : 'Recargar'}
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={handleCreate}
                                        style={{
                                            borderRadius: '8px',
                                            padding: '8px 16px',
                                            border: 'none',
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <BiPlus size={16} />
                                        Nuevo Rol
                                    </Button>
                                </div>
                            </div>

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
                                        <Col xs={12} md={6} className="mb-2">
                                            <Form.Label className="small text-muted mb-1">ID</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="id_rol"
                                                placeholder="Filtrar por ID"
                                                value={columnFilters.id_rol}
                                                onChange={handleColumnFilterChange}
                                                size="sm"
                                                style={{ borderRadius: '6px' }}
                                            />
                                        </Col>
                                        <Col xs={12} md={6} className="mb-2">
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
                                    data={filteredRoles}
                                    pagination
                                    responsive
                                    striped
                                    highlightOnHover
                                    paginationPerPage={10}
                                    paginationRowsPerPageOptions={[5, 10, 15, 20, 25]}
                                    noDataComponent={
                                        <div style={{
                                            padding: '40px',
                                            textAlign: 'center',
                                            color: isDark ? '#9ca3af' : '#6b7280'
                                        }}>
                                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                                            <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                                                No hay roles registrados
                                            </div>
                                            <div style={{ fontSize: '14px' }}>
                                                Comienza creando tu primer rol
                                            </div>
                                        </div>
                                    }
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
                                        table: {
                                            style: {
                                                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                            },
                                        },
                                        headRow: {
                                            style: {
                                                backgroundColor: isDark ? '#374151' : '#f8f9fa',
                                                borderBottom: isDark ? '1px solid #4b5563' : '1px solid #dee2e6',
                                                minHeight: '48px',
                                            },
                                        },
                                        rows: {
                                            style: {
                                                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                                borderBottom: isDark ? '1px solid #374151' : '1px solid #f1f5f9',
                                                minHeight: '56px',
                                                '&:hover': {
                                                    backgroundColor: isDark ? '#374151' : '#f8fafc',
                                                    transition: 'all 0.2s ease',
                                                },
                                            },
                                        },
                                        pagination: {
                                            style: {
                                                backgroundColor: isDark ? '#374151' : '#f8f9fa',
                                                borderTop: isDark ? '1px solid #4b5563' : '1px solid #dee2e6',
                                                color: isDark ? '#e5e7eb' : '#374151',
                                            },
                                        },
                                    }}
                                />
                            </div>


                            {/* Modern Drawer */}
                            <Drawer
                                open={showDrawer}
                                onClose={handleCloseDrawer}
                                direction='right'
                                size={500}
                                style={{
                                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                    color: isDark ? '#f9fafb' : '#111827',
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
                                    backgroundColor: isDark ? '#1f2937' : '#ffffff'
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
                                                        {isEdit ? "Editar Rol" : "Crear Rol"}
                                                    </h3>
                                                </div>
                                                <p style={{ 
                                                    margin: 0, 
                                                    fontSize: '14px',
                                                    opacity: 0.9,
                                                    fontWeight: '400'
                                                }}>
                                                    {isEdit 
                                                        ? `Modificando: ${rolSeleccionado?.descripcion || 'Rol'}`
                                                        : 'Complete la información del nuevo rol'
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
                                        <span style={{ opacity: 0.7 }}>Roles</span>
                                        <span style={{ margin: '0 8px', opacity: 0.5 }}>→</span>
                                        <span style={{ color: isDark ? '#60a5fa' : '#1d4ed8' }}>
                                            {isEdit ? 'Editar' : 'Crear'}
                                        </span>
                                    </div>

                                {/* Form Content */}
                                <div style={{ 
                                    flex: 1, 
                                    padding: '24px', 
                                    overflowY: 'auto',
                                    backgroundColor: isDark ? '#1a1a1a' : '#ffffff'
                                }}>
                                        {(rolSeleccionado || !isEdit) && (
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
                                                                placeholder="Ingrese la descripción del rol"
                                                                value={formValues.descripcion}
                                                                onChange={handleInputChange}
                                                                ref={descripcionRef}
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
                                                onClick={handleSubmit}
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

export default RolPage
