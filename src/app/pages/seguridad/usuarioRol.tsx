import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Row, Table, Spinner, Button, Form } from 'react-bootstrap'
import { useEffect, useState, useRef } from 'react'
import { fetchRol } from '@/servicios/rolProvider'
import { fetchRolUsuario, fetchRolUsuarioById, createRolUsuario, updateRolUsuario, deleteRolUsuario, RolUsuario } from '@/servicios/rolUsuarioProvider'
import Swal from 'sweetalert2'
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import { BiEdit, BiPlus, BiTrash, BiRefresh } from 'react-icons/bi'
import { FaSearch, FaFilter, FaChevronRight } from 'react-icons/fa'
import { useFormContext } from "@/utils/formContext.jsx";
import { fetchUsuario } from '@/servicios/usuarioProvider'
import { useAuthContext } from '@/context/useAuthContext'
import DataTable, { TableColumn } from 'react-data-table-component'
import { useLayoutContext } from '@/context/useLayoutContext'

const UsuarioRolPage = () => {
    const { theme, changeTheme } = useLayoutContext()
    const isDark = theme === 'dark'
    const [rolUsuarios, setRolUsuarios] = useState<RolUsuario[]>([])
    const [usuarios, setUsuarios] = useState<{ id_usuario: number, name: string }[]>([]);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [showDrawer, setShowDrawer] = useState(false)
    const [rolUsuarioSeleccionado, setRolUsuarioSeleccionado] = useState<RolUsuario | null>(null)
    const [isEdit, setEdit] = useState(true)
    const [roles, setRoles] = useState<{ id_rol: number, descripcion: string }[]>([])
    const [idRol, setIdRol] = useState(0);
    const [search, setSearch] = useState('')
    const [isReloading, setIsReloading] = useState(false)
    const [columnFilters, setColumnFilters] = useState({
        id_rol_usuario: '',
        rol: '',
        id_usuario: '',
        nombre_usuario: '',
    })
    const usuarioRef = useRef<HTMLSelectElement>(null)
    const { formValuesData } = useFormContext({
        id_empresa: sessionStorage.getItem("id_empresa") || "0"
    });
    const { user } = useAuthContext()
    const { token, id_empresa } = user || {}
    const [formValues, setFormValues] = useState({
        id_rol_usuario: 0,
        id_rol: idRol,
        id_usuario: 0,
        id_empresa: Number(id_empresa) || 0
    });

    // Auto-focus on drawer open
    useEffect(() => {
        if (showDrawer && usuarioRef.current) {
            setTimeout(() => {
                usuarioRef.current?.focus();
            }, 100);
        }
    }, [showDrawer]);

    // Handle reload with animation
    const handleReload = async () => {
        setIsReloading(true);
        await getRolUsuarios();
        setTimeout(() => setIsReloading(false), 1000);
    };

    // Filtered data with per-column search and global search
    const filteredRolUsuarios = rolUsuarios.filter((rolUsuario) => {
        const matchesGlobal = search === '' || 
            String(rolUsuario.id_rol_usuario).toLowerCase().includes(search.toLowerCase()) ||
            (roles.find(r => r.id_rol === rolUsuario.id_rol)?.descripcion?.toLowerCase().includes(search.toLowerCase())) ||
            String(rolUsuario.id_usuario).toLowerCase().includes(search.toLowerCase()) ||
            (rolUsuario.nombre_usuario?.toLowerCase().includes(search.toLowerCase()));
        
        const matchesColumn = 
            (columnFilters.id_rol_usuario === '' || String(rolUsuario.id_rol_usuario).includes(columnFilters.id_rol_usuario)) &&
            (columnFilters.rol === '' || roles.find(r => r.id_rol === rolUsuario.id_rol)?.descripcion?.toLowerCase().includes(columnFilters.rol.toLowerCase())) &&
            (columnFilters.id_usuario === '' || String(rolUsuario.id_usuario).includes(columnFilters.id_usuario)) &&
            (columnFilters.nombre_usuario === '' || rolUsuario.nombre_usuario?.toLowerCase().includes(columnFilters.nombre_usuario.toLowerCase()));
        
        return matchesGlobal && matchesColumn;
    });

    const columns: TableColumn<RolUsuario>[] = [
        {
            name: 'ID',
            selector: (row: RolUsuario) => row.id_rol_usuario,
            sortable: true,
            width: '100px',
            cell: (row: RolUsuario) => (
                <div style={{
                    fontWeight: '500',
                    color: isDark ? '#d1d5db' : '#6b7280',
                    fontSize: '14px'
                }}>
                    {row.id_rol_usuario}
                </div>
            ),
        },
        {
            name: 'Rol',
            selector: (row: RolUsuario) => roles.find(r => r.id_rol === row.id_rol)?.descripcion || String(row.id_rol),
            sortable: true,
            cell: (row: RolUsuario) => (
                <div style={{
                    fontWeight: '500',
                    color: isDark ? '#f3f4f6' : '#1f2937'
                }}>
                    {roles.find(r => r.id_rol === row.id_rol)?.descripcion || `Rol ${row.id_rol}`}
                </div>
            ),
        },
        {
            name: 'ID Usuario',
            selector: (row: RolUsuario) => row.id_usuario,
            sortable: true,
            width: '120px',
            cell: (row: RolUsuario) => (
                <div style={{
                    fontWeight: '500',
                    color: isDark ? '#d1d5db' : '#6b7280',
                    fontSize: '14px'
                }}>
                    {row.id_usuario}
                </div>
            ),
        },
        {
            name: 'Nombre Usuario',
            selector: (row: RolUsuario) => row.nombre_usuario || '',
            sortable: true,
            cell: (row: RolUsuario) => (
                <div style={{
                    fontWeight: '500',
                    color: isDark ? '#f3f4f6' : '#1f2937'
                }}>
                    {row.nombre_usuario || 'Sin nombre'}
                </div>
            ),
        },
        {
            name: 'Acciones',
            cell: (rolUsuario) => (
                <div className="d-flex gap-2">
                    <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleEdit(rolUsuario)}
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
                        onClick={() => handleDelete(rolUsuario)}
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
        if (!formValues.id_usuario || Number(formValues.id_usuario) === 0) {
            errors.id_usuario = "Debe seleccionar un usuario";
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
        const fetchData = async () => {
            try {
                await loadRoles();

                const usuariosData = await fetchUsuario(token);
                setUsuarios(
                    (usuariosData ?? []).map((u: any) => ({
                        id_usuario: u.id_usuario ?? 0,
                        name: u.name ?? '',
                    }))
                );
            } catch (error) {
                console.error("Error loading data:", error);
            }
        };
        fetchData();
    }, [formValuesData]);

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
        setFormErrors({})
    }

    const handleCreate = () => {
        if (idRol === 0) {
            Swal.fire({
                title: 'Advertencia',
                text: 'Debe seleccionar un rol antes de agregar usuarios.',
                icon: 'warning',
            });
            return;
        }
        setShowDrawer(true);
        setEdit(false);
        setFormValues({
            id_rol_usuario: 0,
            id_rol: idRol,
            id_usuario: 0,
            id_empresa: Number(id_empresa || 0)
        });
        setFormErrors({});
    }

    useEffect(() => {
        const fetchData = async () => {
            await getRolUsuarios();
        };
        fetchData();
    }, [formValuesData])

    const getRolUsuarios = async () => {
        setLoading(true);
        try {
            const data = await fetchRolUsuario(idRol, token);
            setRolUsuarios(data);
            setError(null);
        } catch (err) {
            console.error('Error loading rol usuarios:', err);
            setError('Error al cargar usuarios de rol');
            setRolUsuarios([]);
        } finally {
            setLoading(false);
        }
    }

    const handleEdit = async (rolUsuario: RolUsuario) => {
        try {
            const data = await fetchRolUsuarioById(rolUsuario.id_rol_usuario, token);
            if (data && data.length > 0) {
                const rolUsuarioData = data[0];
                setFormValues({
                    id_rol_usuario: rolUsuarioData.id_rol_usuario,
                    id_rol: rolUsuarioData.id_rol,
                    id_usuario: rolUsuarioData.id_usuario,
                    id_empresa: rolUsuarioData.id_empresa
                });
                setFormErrors({});
                setEdit(true);
                setShowDrawer(true);
            } else {
                throw new Error('No se encontraron datos');
            }
        } catch (error) {
            console.error("Error fetching rol usuario by ID:", error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo obtener la información del usuario de rol.',
                icon: 'error',
            });
        }
    }

    const handleCloseDrawer = () => {
        setShowDrawer(false)
    }

    const handleDelete = async (rolUsuario: RolUsuario) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar este usuario del rol?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await deleteRolUsuario(rolUsuario.id_rol_usuario, token);
                    if (response.estado) {
                        await getRolUsuarios();
                        Swal.fire('Eliminado', response.mensaje || 'El usuario del rol ha sido eliminado.', 'success');
                    } else {
                        Swal.fire('Error', response.mensaje || 'No se pudo eliminar el usuario del rol.', 'error');
                    }
                } catch (error) {
                    console.error('Error deleting rol usuario:', error);
                    Swal.fire('Error', 'Error al eliminar el usuario del rol.', 'error');
                }
            }
        });
    }

    const submit = async (e: any) => {
        e.preventDefault();

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            if (isEdit) {
                const response = await updateRolUsuario({
                    id_rol: idRol,
                    id_usuario: formValues.id_usuario,
                    id_empresa: Number(id_empresa || 0)
                }, token);

                if (response.estado) {
                    await getRolUsuarios();
                    Swal.fire({
                        title: 'Registro Modificado',
                        text: response.mensaje || 'Se ha modificado el registro exitosamente.',
                        icon: 'success',
                    });
                    setFormValues({
                        id_rol_usuario: 0,
                        id_rol: idRol,
                        id_usuario: 0,
                        id_empresa: Number(id_empresa || 0)
                    });
                    setEdit(false);
                    setShowDrawer(false);
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: response.mensaje || 'No se ha podido modificar el registro.',
                        icon: 'error',
                    });
                }
            } else {
                const response = await createRolUsuario({
                    id_rol_usuario: formValues.id_rol_usuario,
                    id_rol: idRol,
                    id_usuario: formValues.id_usuario,
                    id_empresa: Number(id_empresa || 0)
                }, token);

                if (response.estado) {
                    await getRolUsuarios();
                    Swal.fire({
                        title: 'Registro exitoso',
                        text: response.mensaje || 'Se ha creado un nuevo registro exitosamente.',
                        icon: 'success',
                    });
                    setFormValues({
                        id_rol_usuario: 0,
                        id_rol: idRol,
                        id_usuario: 0,
                        id_empresa: Number(id_empresa || 0)
                    });
                    setEdit(false);
                    setShowDrawer(false);
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: response.mensaje || 'No se ha podido crear el registro.',
                        icon: 'error',
                    });
                }
            }
            setFormErrors({});
        } catch (error) {
            console.error('Error in submit:', error);
            Swal.fire({
                title: 'Error',
                text: 'Error al procesar la solicitud.',
                icon: 'error',
            });
        }
    };

    const handleSearch = async () => {
        if (idRol === 0) {
            Swal.fire({
                title: 'Advertencia',
                text: 'Debe seleccionar un rol para buscar usuarios.',
                icon: 'warning',
            });
            return;
        }
        await getRolUsuarios();
    }

    if (loading) return (
        <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <div className="mt-2 text-muted">Cargando usuarios...</div>
        </div>
    );

    if (error) return (
        <div className="text-center py-5">
            <div className="text-danger mb-3">{error}</div>
            <Button variant="outline-primary" onClick={handleReload}>
                <BiRefresh className="me-2" />
                Reintentar
            </Button>
        </div>
    );

    return (
        <>
            <PageTitle title="Usuarios por Rol" />

            <Row>
                <Col xs={12}>
                    {/* Rol Selection Card */}
                    <Card className="mb-3">
                        <CardBody>
                            <div className="d-flex align-items-center justify-content-between">
                                <div style={{ flex: '0 0 300px' }}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold text-muted mb-2">
                                            <FaFilter className="me-2" />
                                            Seleccionar Rol
                                        </Form.Label>
                                        <Form.Select
                                            id="id_rol"
                                            value={idRol}
                                            onChange={handleInputChange}
                                            style={{
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0',
                                                padding: '10px 12px',
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
                                    </Form.Group>
                                </div>
                                <Button
                                    variant="primary"
                                    onClick={handleSearch}
                                    disabled={idRol === 0}
                                    style={{
                                        borderRadius: '8px',
                                        padding: '10px 20px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginTop: '24px',
                                        backgroundColor: '#007bff',
                                        borderColor: '#007bff'
                                    }}
                                >
                                    <FaSearch size={14} />
                                    Buscar Usuarios
                                </Button>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Global Search Card */}
                    <Card className="mb-3">
                        <CardBody>
                            <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center gap-3 flex-grow-1">
                                    <div style={{ position: 'relative', maxWidth: '400px', width: '100%' }}>
                                        <FaSearch
                                            style={{
                                                position: 'absolute',
                                                left: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#6b7280',
                                                fontSize: '14px'
                                            }}
                                        />
                                        <Form.Control
                                            type="text"
                                            placeholder="Buscar usuarios..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            style={{
                                                paddingLeft: '40px',
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0',
                                                padding: '10px 12px 10px 40px',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={handleReload}
                                        disabled={isReloading || idRol === 0}
                                        style={{
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <BiRefresh className={isReloading ? 'spin' : ''} size={16} />
                                        {isReloading ? 'Cargando...' : 'Recargar'}
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={handleCreate}
                                        disabled={idRol === 0}
                                        style={{
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            backgroundColor: '#007bff',
                                            borderColor: '#007bff'
                                        }}
                                    >
                                        <BiPlus size={16} />
                                        Nuevo Usuario
                                    </Button>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Column Filters Card */}
                    <Card className="mb-3">
                        <CardBody>
                            <div className="d-flex align-items-center mb-3">
                                <FaFilter className="me-2 text-primary" />
                                <h6 className="mb-0 fw-semibold">Filtros por Columna</h6>
                            </div>
                            <Row>
                                <Col md={3}>
                                    <Form.Group className="mb-0">
                                        <Form.Label className="small text-muted">ID</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="id_rol_usuario"
                                            placeholder="Filtrar por ID..."
                                            value={columnFilters.id_rol_usuario}
                                            onChange={handleColumnFilterChange}
                                            size="sm"
                                            style={{ borderRadius: '6px' }}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-0">
                                        <Form.Label className="small text-muted">Rol</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="rol"
                                            placeholder="Filtrar por rol..."
                                            value={columnFilters.rol}
                                            onChange={handleColumnFilterChange}
                                            size="sm"
                                            style={{ borderRadius: '6px' }}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-0">
                                        <Form.Label className="small text-muted">ID Usuario</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="id_usuario"
                                            placeholder="Filtrar por ID usuario..."
                                            value={columnFilters.id_usuario}
                                            onChange={handleColumnFilterChange}
                                            size="sm"
                                            style={{ borderRadius: '6px' }}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-0">
                                        <Form.Label className="small text-muted">Nombre Usuario</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="nombre_usuario"
                                            placeholder="Filtrar por nombre..."
                                            value={columnFilters.nombre_usuario}
                                            onChange={handleColumnFilterChange}
                                            size="sm"
                                            style={{ borderRadius: '6px' }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>

                    {/* Main Data Table Card */}
                    <Card>
                        <CardBody>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div>
                                    <h4 className="header-title mb-1">Usuarios por Rol</h4>
                                    <p className="text-muted mb-0 small">
                                        {idRol === 0 
                                            ? 'Seleccione un rol para ver los usuarios asignados' 
                                            : `Gestión de usuarios para el rol: ${roles.find(r => r.id_rol === idRol)?.descripcion || 'Desconocido'}`
                                        }
                                    </p>
                                </div>
                                <div className="text-muted small">
                                    {filteredRolUsuarios.length} de {rolUsuarios.length} registros
                                </div>
                            </div>

                            <DataTable
                                columns={columns}
                                data={filteredRolUsuarios}
                                pagination
                                paginationPerPage={10}
                                paginationRowsPerPageOptions={[5, 10, 25, 50]}
                                highlightOnHover
                                pointerOnHover
                                responsive
                                striped
                                noDataComponent={
                                    <div className="text-center py-5">
                                        <div className="text-muted">
                                            {idRol === 0 
                                                ? 'Seleccione un rol para ver los usuarios'
                                                : search || Object.values(columnFilters).some(f => f !== '')
                                                    ? 'No se encontraron usuarios que coincidan con los filtros aplicados'
                                                    : 'No hay usuarios asignados a este rol'
                                            }
                                        </div>
                                    </div>
                                }
                                customStyles={{
                                    table: {
                                        style: {
                                            borderRadius: '8px',
                                            overflow: 'hidden'
                                        }
                                    },
                                    headRow: {
                                        style: {
                                            backgroundColor: isDark ? '#374151' : '#f8fafc',
                                            borderBottom: `1px solid ${isDark ? '#4b5563' : '#e2e8f0'}`,
                                            minHeight: '52px'
                                        }
                                    },
                                    headCells: {
                                        style: {
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: isDark ? '#f3f4f6' : '#374151',
                                            paddingLeft: '16px',
                                            paddingRight: '16px'
                                        }
                                    },
                                    rows: {
                                        style: {
                                            fontSize: '14px',
                                            minHeight: '48px',
                                            borderBottom: `1px solid ${isDark ? '#374151' : '#f1f5f9'}`,
                                            '&:hover': {
                                                backgroundColor: isDark ? '#374151' : '#f8fafc',
                                                transition: 'background-color 0.2s'
                                            }
                                        }
                                    },
                                    cells: {
                                        style: {
                                            paddingLeft: '16px',
                                            paddingRight: '16px'
                                        }
                                    }
                                }}
                            />

                            {/* Modern Drawer */}
                            <Drawer
                                open={showDrawer}
                                onClose={handleCloseDrawer}
                                direction='right'
                                size={420}
                                style={{
                                    top: '70px',
                                    height: 'calc(100vh - 70px)',
                                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                    color: isDark ? '#f3f4f6' : '#1f2937',
                                }}
                            >
                                {/* Modern Header */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    padding: '24px',
                                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {/* Decorative elements */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '-50%',
                                        right: '-20%',
                                        width: '200px',
                                        height: '200px',
                                        borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.1)',
                                        filter: 'blur(1px)'
                                    }} />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-30%',
                                        left: '-10%',
                                        width: '150px',
                                        height: '150px',
                                        borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.05)',
                                        filter: 'blur(1px)'
                                    }} />
                                    
                                    {/* Content */}
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div className="d-flex align-items-center text-white mb-2">
                                            <span style={{ fontSize: '18px', fontWeight: '600' }}>
                                                {isEdit ? 'Editar Usuario del Rol' : 'Agregar Usuario al Rol'}
                                            </span>
                                        </div>
                                        
                                        {/* Breadcrumb */}
                                        <div className="d-flex align-items-center text-white" style={{ opacity: 0.9, fontSize: '14px' }}>
                                            <span>Seguridad</span>
                                            <FaChevronRight className="mx-2" size={12} />
                                            <span>Usuarios por Rol</span>
                                            <FaChevronRight className="mx-2" size={12} />
                                            <span>{isEdit ? 'Editar' : 'Nuevo'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Content */}
                                <div style={{ padding: '24px' }}>
                                    <Form onSubmit={submit}>
                                        <div className="mb-4 text-center">
                                            <p className="text-muted mb-0 small">
                                                Complete los campos requeridos para continuar
                                            </p>
                                        </div>

                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-semibold mb-2">
                                                Usuario <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Form.Select
                                                ref={usuarioRef}
                                                id="id_usuario"
                                                value={formValues.id_usuario}
                                                onChange={handleInputChange}
                                                isInvalid={!!formErrors.id_usuario}
                                                style={{
                                                    borderRadius: '8px',
                                                    border: formErrors.id_usuario ? '1px solid #dc3545' : '1px solid #e2e8f0',
                                                    padding: '12px',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                <option value="">Seleccione un Usuario</option>
                                                {usuarios.map((usuario) => (
                                                    <option key={usuario.id_usuario} value={usuario.id_usuario}>
                                                        {usuario.name}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                            {formErrors.id_usuario && (
                                                <div className="text-danger small mt-1">{formErrors.id_usuario}</div>
                                            )}
                                        </Form.Group>

                                        <div className="d-grid gap-2 mt-4">
                                            <Button
                                                variant="primary"
                                                type="submit"
                                                style={{
                                                    borderRadius: '8px',
                                                    padding: '12px',
                                                    fontSize: '14px',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                {isEdit ? 'Actualizar Usuario' : 'Agregar Usuario'}
                                            </Button>
                                            <Button
                                                variant="outline-secondary"
                                                type="button"
                                                onClick={handleCancel}
                                                style={{
                                                    borderRadius: '8px',
                                                    padding: '12px',
                                                    fontSize: '14px',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                Cancelar
                                            </Button>
                                        </div>
                                    </Form>
                                </div>
                            </Drawer>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            <style>
                {`
                    .spin {
                        animation: spin 1s linear infinite;
                    }
                    
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}
            </style>
        </>
    )
}

export default UsuarioRolPage
