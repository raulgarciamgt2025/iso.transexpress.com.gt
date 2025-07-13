import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Row, Table, Spinner, Button, Form } from 'react-bootstrap'
import { useEffect, useState, useRef } from 'react'
import { fetchRol } from '@/servicios/rolProvider'
import { fetchRolOpcion, fetchRolOpcionById, createRolOpcion, updateRolOpcion, deleteRolOpcion, RolOpcion } from '@/servicios/rolOpcionProvider'
import Swal from 'sweetalert2'
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import { BiEdit, BiPlus, BiTrash, BiRefresh } from 'react-icons/bi'
import { FaSearch } from 'react-icons/fa'
import { useFormContext } from "@/utils/formContext.jsx";
import { fetchOpcion } from '@/servicios/opcionProvider'
import { useAuthContext } from '@/context/useAuthContext'
import DataTable, { TableColumn } from 'react-data-table-component'
import { useLayoutContext } from '@/context/useLayoutContext'


const RolOpcionPage = () => {
    const { theme, changeTheme } = useLayoutContext()
    const isDark = theme === 'dark'
    const [rolOpciones, setRolOpciones] = useState<RolOpcion[]>([])
    const [opciones, setOpciones] = useState<{ id_opcion: number, descripcion: string }[]>([]);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [showDrawer, setShowDrawer] = useState(false)
    const [rolOpcionSeleccionado, setRolOpcionSeleccionado] = useState<RolOpcion | null>(null)
    const [isEdit, setEdit] = useState(true)
    const [roles, setRoles] = useState<{ id_rol: number, descripcion: string }[]>([])
    const [idRol, setIdRol] = useState(0);
    const [search, setSearch] = useState('')
    const [isReloading, setIsReloading] = useState(false)
    const [columnFilters, setColumnFilters] = useState({
        id_rol_opcion: '',
        rol: '',
        opcion: '',
        descripcion: '',
    })
    const opcionRef = useRef<HTMLSelectElement>(null)
    const { formValuesData } = useFormContext({
        id_empresa: sessionStorage.getItem("id_empresa") || "0"
    });
    const { user } = useAuthContext()
    const { token, id_empresa } = user || {}
    const [formValues, setFormValues] = useState({
        id_rol_opcion: 0,
        id_rol: idRol,
        id_opcion: 0,
        id_empresa: Number(id_empresa) || 0
    });


    // Auto-focus on drawer open
    useEffect(() => {
        if (showDrawer && opcionRef.current) {
            setTimeout(() => {
                opcionRef.current?.focus();
            }, 100);
        }
    }, [showDrawer]);

    // Handle reload with animation
    const handleReload = async () => {
        setIsReloading(true);
        await getRolOpciones();
        setTimeout(() => setIsReloading(false), 1000);
    };

    // Filtered data with per-column search and global search
    const filteredRolOpciones = rolOpciones.filter((rolOpcion) => {
        const matchesGlobal = search === '' || 
            String(rolOpcion.id_rol_opcion).toLowerCase().includes(search.toLowerCase()) ||
            (roles.find(r => r.id_rol === rolOpcion.id_rol)?.descripcion?.toLowerCase().includes(search.toLowerCase())) ||
            String(rolOpcion.id_opcion).toLowerCase().includes(search.toLowerCase()) ||
            (rolOpcion.opcion?.toLowerCase().includes(search.toLowerCase()));
        
        const matchesColumn = 
            (columnFilters.id_rol_opcion === '' || String(rolOpcion.id_rol_opcion).includes(columnFilters.id_rol_opcion)) &&
            (columnFilters.rol === '' || roles.find(r => r.id_rol === rolOpcion.id_rol)?.descripcion?.toLowerCase().includes(columnFilters.rol.toLowerCase())) &&
            (columnFilters.opcion === '' || String(rolOpcion.id_opcion).includes(columnFilters.opcion)) &&
            (columnFilters.descripcion === '' || rolOpcion.opcion?.toLowerCase().includes(columnFilters.descripcion.toLowerCase()));
        
        return matchesGlobal && matchesColumn;
    });

    const columns: TableColumn<RolOpcion>[] = [
        {
            name: 'ID',
            selector: (row: RolOpcion) => row.id_rol_opcion,
            sortable: true,
            width: '100px',
            cell: (row: RolOpcion) => (
                <div style={{
                    fontWeight: '500',
                    color: isDark ? '#d1d5db' : '#6b7280',
                    fontSize: '14px'
                }}>
                    {row.id_rol_opcion}
                </div>
            ),
        },
        {
            name: 'Rol',
            selector: (row: RolOpcion) => roles.find(r => r.id_rol === row.id_rol)?.descripcion || String(row.id_rol),
            sortable: true,
            cell: (row: RolOpcion) => (
                <div style={{
                    fontWeight: '500',
                    color: isDark ? '#f3f4f6' : '#1f2937'
                }}>
                    {roles.find(r => r.id_rol === row.id_rol)?.descripcion || `Rol ${row.id_rol}`}
                </div>
            ),
        },
        {
            name: 'ID Opción',
            selector: (row: RolOpcion) => row.id_opcion,
            sortable: true,
            width: '120px',
            cell: (row: RolOpcion) => (
                <div style={{
                    fontWeight: '500',
                    color: isDark ? '#d1d5db' : '#6b7280',
                    fontSize: '14px'
                }}>
                    {row.id_opcion}
                </div>
            ),
        },
        {
            name: 'Descripción',
            selector: (row: RolOpcion) => row.opcion || '',
            sortable: true,
            cell: (row: RolOpcion) => (
                <div style={{
                    fontWeight: '500',
                    color: isDark ? '#f3f4f6' : '#1f2937'
                }}>
                    {row.opcion || 'Sin descripción'}
                </div>
            ),
        },
        {
            name: 'Acciones',
            cell: (rolOpcion) => (
                <div className="d-flex gap-2">
                    <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleEdit(rolOpcion)}
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
                        onClick={() => handleDelete(rolOpcion)}
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


    const validateForm = () => {
        const errors: { [key: string]: string } = {};
        if (!formValues.id_rol || Number(formValues.id_rol) === 0) {
            errors.id_rol = "Debe seleccionar un rol";
        }
        if (!formValues.id_opcion || Number(formValues.id_opcion) === 0) {
            errors.id_opcion = "La opción es obligatoria";
        }
        return errors;
    };

    const handleColumnFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setColumnFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    useEffect(() => {
        if (rolOpcionSeleccionado) {
            setFormValues({
                id_rol_opcion: rolOpcionSeleccionado.id_rol_opcion,
                id_rol: idRol,
                id_opcion: rolOpcionSeleccionado.id_opcion,
                id_empresa: Number(id_empresa)
            })
            setFormErrors({})
        }
        const fetchData = async () => {
            try {
                await loadRoles();
            } catch (error) {
                console.error("Error loading data:", error);
            }
        };
        fetchData();

        const cargarOpciones = async () => {
            try {
                const data = await fetchOpcion(token);
                setOpciones(
                    (data ?? []).map((op: any) => ({
                        id_opcion: op.id_opcion ?? 0,
                        descripcion: op.descripcion ?? '',
                    }))
                );
            } catch (error) {
                console.error("Error cargando opciones:", error);
            }
        };
        cargarOpciones();
    }, [rolOpcionSeleccionado, formValuesData]);

    const loadRoles = async () => {
        try {
            const data = await fetchRol(token, id_empresa);
            setRoles(
                (data ?? []).map((rol: any) => ({
                    id_rol: rol.id_rol ?? 0,
                    descripcion: rol.descripcion ?? '',
                }))
            );
        } catch (error) {
            console.error("Error loading roles:", error);
        }
    };

    const handleInputChange = (e: any) => {
        const { id, value } = e.target
        setFormValues(prev => ({
            ...prev,
            [id]: value,
        }))
        if (id === "id_rol") {
            setIdRol(Number(value))
        }
    }

    const handleCancel = () => {
        setShowDrawer(false)
        setRolOpcionSeleccionado(null)
        setFormErrors({})
    }

    const handleCreate = () => {
        setRolOpcionSeleccionado(null)
        setShowDrawer(true)
        setEdit(false)
        setFormValues({
            id_rol_opcion: 0,
            id_rol: idRol,
            id_opcion: 0,
            id_empresa: Number(id_empresa) || 0
        })
        setFormErrors({})
    }

    useEffect(() => {
        const fetchData = async () => {
            await getRolOpciones();
        };
        fetchData();
    }, [])

    const getRolOpciones = async () => {
        fetchRolOpcion(idRol, token)
            .then(data => setRolOpciones(data))
            .catch(() => setError('Error al cargar opciones de rol'))
            .finally(() => setLoading(false))
    }

    const handleEdit = async (rolOpcion: RolOpcion) => {
        try {
            const data = await fetchRolOpcionById(rolOpcion.id_rol_opcion, token);
            setRolOpcionSeleccionado(data[0]);
            setFormErrors({});
            setEdit(true);
            setShowDrawer(true);
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo obtener la información de la opción de rol.',
                icon: 'error',
            });
        }
    }

    const handleCloseDrawer = () => {
        setShowDrawer(false)
        setRolOpcionSeleccionado(null)
    }

    const handleDelete = (rolOpcion: RolOpcion) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar la opción de rol?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const deleteResult = await deleteRolOpcion(rolOpcion.id_rol_opcion, token);
                    if (deleteResult.estado === false) {
                        Swal.fire('Error', deleteResult.mensaje || 'No se pudo eliminar la opción de rol.', 'error');
                    } else {
                        await getRolOpciones();
                        Swal.fire('Eliminado', 'La opción de rol ha sido eliminada.', 'success');
                    }
                } catch (error) {
                    Swal.fire('Error', 'Ocurrió un error al eliminar la opción de rol.', 'error');
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
                if (!rolOpcionSeleccionado) {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se ha seleccionado una opción de rol para editar.',
                        icon: 'error',
                    });
                    return;
                }

                const update = await updateRolOpcion({
                    id_rol_opcion: formValues.id_rol_opcion,
                    id_rol: idRol,
                    id_opcion: formValues.id_opcion,
                    id_empresa: Number(id_empresa)
                }, token);

                if (update?.estado !== false) {
                    await getRolOpciones();
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
                const newEntry = await createRolOpcion({
                    id_rol_opcion: formValues.id_rol_opcion,
                    id_rol: idRol,
                    id_opcion: formValues.id_opcion,
                    id_empresa: Number(id_empresa)
                }, token);

                if (newEntry?.estado !== false) {
                    await getRolOpciones();
                    Swal.fire({
                        title: 'Registro exitoso',
                        text: newEntry?.mensaje || 'Se ha creado un nuevo registro exitosamente.',
                        icon: 'success',
                    });
                    setShowDrawer(false);
                    setFormErrors({});
                    // Reset form
                    setFormValues({
                        id_rol_opcion: 0,
                        id_rol: idRol,
                        id_opcion: 0,
                        id_empresa: Number(id_empresa) || 0
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

    const handleSearch = async () => {
        setLoading(true)
        try {
            const data = await fetchRolOpcion(idRol, token)
            setRolOpciones(data)
            setError(null)
        } catch {
            setError('Error al buscar opciones de rol')
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <Spinner animation="border" />
    if (error) return <div>{error}</div>

    return (
        <>
            <PageTitle title="Opciones de Rol" />
            <Row>
                <Col xs={12}>
                    {/* Search Section */}
                    <Card style={{
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: isDark ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.07)',
                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        marginBottom: '24px'
                    }}>
                        <CardBody style={{ padding: '24px' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                flexWrap: 'wrap'
                            }}>
                                <div style={{ flex: '1', minWidth: '250px' }}>
                                    <Form.Label style={{
                                        fontWeight: '600',
                                        color: isDark ? '#e5e7eb' : '#374151',
                                        fontSize: '14px',
                                        marginBottom: '8px'
                                    }}>
                                        🏷️ Seleccionar Rol
                                    </Form.Label>
                                    <Form.Select
                                        id="id_rol"
                                        value={idRol}
                                        onChange={handleInputChange}
                                        style={{
                                            borderRadius: '8px',
                                            border: isDark ? '1px solid #404040' : '1px solid #d1d5db',
                                            backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
                                            color: isDark ? '#ffffff' : '#000000',
                                            padding: '12px 16px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value={0}>Seleccione un Rol</option>
                                        {roles.map((rol) => (
                                            <option key={rol.id_rol} value={rol.id_rol}>
                                                {rol.descripcion}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'end', gap: '8px' }}>
                                    <Button
                                        variant="primary"
                                        onClick={handleSearch}
                                        style={{
                                            borderRadius: '8px',
                                            padding: '12px 20px',
                                            border: 'none',
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
                                        }}
                                    >
                                        <FaSearch size={14} />
                                        Buscar
                                    </Button>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Main Content */}
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
                                        🔐 Opciones de Rol
                                    </h4>
                                    <p style={{
                                        margin: 0,
                                        color: isDark ? '#9ca3af' : '#6b7280',
                                        fontSize: '14px'
                                    }}>
                                        Gestiona las opciones asignadas a cada rol
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
                                        Nueva Opción
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
                                        <Col xs={12} md={3} className="mb-2">
                                            <Form.Label className="small text-muted mb-1">ID</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="id_rol_opcion"
                                                placeholder="Filtrar por ID"
                                                value={columnFilters.id_rol_opcion}
                                                onChange={handleColumnFilterChange}
                                                size="sm"
                                                style={{ borderRadius: '6px' }}
                                            />
                                        </Col>
                                        <Col xs={12} md={3} className="mb-2">
                                            <Form.Label className="small text-muted mb-1">Rol</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="rol"
                                                placeholder="Filtrar por Rol"
                                                value={columnFilters.rol}
                                                onChange={handleColumnFilterChange}
                                                size="sm"
                                                style={{ borderRadius: '6px' }}
                                            />
                                        </Col>
                                        <Col xs={12} md={3} className="mb-2">
                                            <Form.Label className="small text-muted mb-1">ID Opción</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="opcion"
                                                placeholder="Filtrar por ID Opción"
                                                value={columnFilters.opcion}
                                                onChange={handleColumnFilterChange}
                                                size="sm"
                                                style={{ borderRadius: '6px' }}
                                            />
                                        </Col>
                                        <Col xs={12} md={3} className="mb-2">
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
                                    data={filteredRolOpciones}
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
                                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
                                            <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                                                No hay opciones de rol registradas
                                            </div>
                                            <div style={{ fontSize: '14px' }}>
                                                Selecciona un rol y comienza asignando opciones
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
                                                        {isEdit ? "Editar Opción de Rol" : "Crear Opción de Rol"}
                                                    </h3>
                                                </div>
                                                <p style={{ 
                                                    margin: 0, 
                                                    fontSize: '14px',
                                                    opacity: 0.9,
                                                    fontWeight: '400'
                                                }}>
                                                    {isEdit 
                                                        ? `Modificando opción del rol`
                                                        : 'Complete la información de la nueva opción de rol'
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
                                        <span style={{ opacity: 0.7 }}>Opciones de Rol</span>
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
                                        {(rolOpcionSeleccionado || !isEdit) && (
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
                                                                Opción *
                                                            </Form.Label>
                                                            <Form.Select
                                                                id="id_opcion"
                                                                value={formValues.id_opcion}
                                                                onChange={handleInputChange}
                                                                ref={opcionRef}
                                                                style={{
                                                                    borderRadius: '8px',
                                                                    border: isDark ? '1px solid #404040' : '1px solid #d1d5db',
                                                                    backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
                                                                    color: isDark ? '#ffffff' : '#000000',
                                                                    padding: '12px 16px',
                                                                    fontSize: '14px',
                                                                    transition: 'all 0.2s ease',
                                                                    ...(formErrors.id_opcion && {
                                                                        borderColor: '#ef4444',
                                                                        boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)'
                                                                    })
                                                                }}
                                                            >
                                                                <option value={0}>Seleccione una Opción</option>
                                                                {opciones.map((op) => (
                                                                    <option key={op.id_opcion} value={op.id_opcion}>
                                                                        {op.descripcion}
                                                                    </option>
                                                                ))}
                                                            </Form.Select>
                                                            {formErrors.id_opcion && (
                                                                <div style={{
                                                                    color: '#ef4444',
                                                                    fontSize: '13px',
                                                                    marginTop: '6px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}>
                                                                    ⚠️ {formErrors.id_opcion}
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

export default RolOpcionPage
