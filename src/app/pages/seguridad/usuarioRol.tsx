import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Row, Table, Spinner, Button, Form } from 'react-bootstrap'
import { useEffect, useState, useRef } from 'react'
import { fetchRol } from '@/servicios/rolProvider'
import { fetchRolUsuario, fetchRolUsuarioById, createRolUsuario, updateRolUsuario, deleteRolUsuario, RolUsuario } from '@/servicios/rolUsuarioProvider'
import Swal from 'sweetalert2'
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import { BiEdit, BiPlus, BiTrash, BiRefresh } from 'react-icons/bi'
import { FaSearch, FaChevronRight } from 'react-icons/fa'
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
    const [usuariosLoading, setUsuariosLoading] = useState<boolean>(true);
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
        const usuario = usuarios.find(u => u.id_usuario === rolUsuario.id_usuario);
        const userName = usuario?.name || rolUsuario.nombre_usuario || '';
        
        const matchesGlobal = search === '' || 
            String(rolUsuario.id_rol_usuario).toLowerCase().includes(search.toLowerCase()) ||
            (roles.find(r => r.id_rol === rolUsuario.id_rol)?.descripcion?.toLowerCase().includes(search.toLowerCase())) ||
            String(rolUsuario.id_usuario).toLowerCase().includes(search.toLowerCase()) ||
            userName.toLowerCase().includes(search.toLowerCase());
        
        const matchesColumn = 
            (columnFilters.id_rol_usuario === '' || String(rolUsuario.id_rol_usuario).includes(columnFilters.id_rol_usuario)) &&
            (columnFilters.rol === '' || roles.find(r => r.id_rol === rolUsuario.id_rol)?.descripcion?.toLowerCase().includes(columnFilters.rol.toLowerCase())) &&
            (columnFilters.id_usuario === '' || String(rolUsuario.id_usuario).includes(columnFilters.id_usuario)) &&
            (columnFilters.nombre_usuario === '' || userName.toLowerCase().includes(columnFilters.nombre_usuario.toLowerCase()));
        
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
            selector: (row: RolUsuario) => {
                const usuario = usuarios.find(u => u.id_usuario === row.id_usuario);
                return usuario?.name || row.nombre_usuario || '';
            },
            sortable: true,
            cell: (row: RolUsuario) => {
                const usuario = usuarios.find(u => u.id_usuario === row.id_usuario);
                const userName = usuario?.name || row.nombre_usuario || 'Sin nombre';
                return (
                    <div style={{
                        fontWeight: '500',
                        color: isDark ? '#f3f4f6' : '#1f2937'
                    }}>
                        {userName}
                    </div>
                );
            },
        },
        {
            name: 'Acciones',
            cell: (rolUsuario) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(rolUsuario)}
                        style={{
                            borderRadius: '6px',
                            padding: '6px 12px',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <BiTrash size={14} />
                        Eliminar
                    </Button>
                </div>
            ),
            ignoreRowClick: true,
            width: '120px'
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
                setUsuariosLoading(true);
                await loadRoles();

                console.log('Loading usuarios...');
                const usuariosData = await fetchUsuario(token);
                console.log('Usuarios data received:', usuariosData);
                
                // Ensure unique usuarios by id_usuario and filter out invalid entries
                const uniqueUsuarios = (usuariosData ?? [])
                    .map((u: any) => ({
                        id_usuario: u.id_usuario ?? u.id ?? 0,
                        name: u.name ?? u.nombre_usuario ?? u.nombre ?? '',
                    }))
                    .filter((usuario, index, self) => {
                        // Filter out users without valid id_usuario
                        if (!usuario.id_usuario || usuario.id_usuario === 0) {
                            console.warn('Usuario record missing id_usuario:', usuario);
                            return false;
                        }
                        
                        // Keep only the first occurrence of each id_usuario
                        return self.findIndex(other => other.id_usuario === usuario.id_usuario) === index;
                    });

                console.log('Processed usuarios:', uniqueUsuarios);
                setUsuarios(uniqueUsuarios);
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setUsuariosLoading(false);
            }
        };
        fetchData();
    }, [formValuesData, token]);

    const loadRoles = async () => {
        try {
            const data = await fetchRol(token, id_empresa);
            
            // Ensure unique roles by id_rol and filter out invalid entries
            const uniqueRoles = (data ?? [])
                .map((rol: any) => ({
                    id_rol: rol.id_rol ?? 0,
                    descripcion: rol.descripcion ?? '',
                }))
                .filter((rol, index, self) => {
                    // Filter out roles without valid id_rol
                    if (!rol.id_rol || rol.id_rol === 0) {
                        console.warn('Rol record missing id_rol:', rol);
                        return false;
                    }
                    
                    // Keep only the first occurrence of each id_rol
                    return self.findIndex(other => other.id_rol === rol.id_rol) === index;
                });

            setRoles(uniqueRoles);
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
            if (idRol > 0) {
                await getRolUsuarios();
            } else {
                // Clear data when no role is selected
                setRolUsuarios([]);
                setLoading(false);
            }
        };
        fetchData();
    }, [idRol])

    const getRolUsuarios = async () => {
        if (idRol === 0) {
            setRolUsuarios([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const data = await fetchRolUsuario(idRol, token);
            
            // Ensure unique records by id_rol_usuario and filter out invalid entries
            const uniqueData = data.filter((item, index, self) => {
                // Filter out items without valid id_rol_usuario
                if (!item.id_rol_usuario || item.id_rol_usuario === 0) {
                    console.warn('RolUsuario record missing id_rol_usuario:', item);
                    return false;
                }
                
                // Keep only the first occurrence of each id_rol_usuario
                return self.findIndex(other => other.id_rol_usuario === item.id_rol_usuario) === index;
            });

            if (data.length !== uniqueData.length) {
                console.warn(`Filtered ${data.length - uniqueData.length} duplicate or invalid RolUsuario records`);
            }

            setRolUsuarios(uniqueData);
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

                console.log('Update response:', response);

                // Always refresh the data to get the latest state
                await getRolUsuarios();

                // Check if the operation was successful based on multiple indicators
                const wasUpdated = response.estado === true || 
                                 response.estado === 1 || 
                                 (response.status && response.status >= 200 && response.status < 300);

                if (wasUpdated) {
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

                console.log('Create response:', response);

                // Always refresh the data to get the latest state
                await getRolUsuarios();
                
                // Check if the operation was successful based on multiple indicators
                const wasCreated = response.estado === true || 
                                 response.estado === 1 || 
                                 response.id_rol_usuario || 
                                 response.data?.id_rol_usuario ||
                                 (response.status && response.status >= 200 && response.status < 300);

                if (wasCreated) {
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
                    // Since the record might still be created despite response.estado being false,
                    // check if we can find a record with this user ID in the refreshed data
                    const existingRecord = rolUsuarios.find(ru => ru.id_usuario === formValues.id_usuario && ru.id_rol === idRol);
                    
                    if (existingRecord) {
                        // Record was actually created successfully
                        Swal.fire({
                            title: 'Registro exitoso',
                            text: 'Se ha creado el registro exitosamente.',
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
                        // Record was not created
                        Swal.fire({
                            title: 'Error',
                            text: response.mensaje || 'No se ha podido crear el registro.',
                            icon: 'error',
                        });
                    }
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
        
        setLoading(true);
        try {
            const data = await fetchRolUsuario(idRol, token);
            
            // Ensure unique records by id_rol_usuario and filter out invalid entries
            const uniqueData = data.filter((item, index, self) => {
                // Filter out items without valid id_rol_usuario
                if (!item.id_rol_usuario || item.id_rol_usuario === 0) {
                    console.warn('RolUsuario record missing id_rol_usuario:', item);
                    return false;
                }
                
                // Keep only the first occurrence of each id_rol_usuario
                return self.findIndex(other => other.id_rol_usuario === item.id_rol_usuario) === index;
            });

            setRolUsuarios(uniqueData);
            setError(null);
        } catch (err) {
            console.error('Error searching rol usuarios:', err);
            setError('Error al buscar usuarios de rol');
            setRolUsuarios([]);
        } finally {
            setLoading(false);
        }
    }

    if (loading || usuariosLoading) return (
        <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <div className="mt-2 text-muted">
                {usuariosLoading ? 'Cargando usuarios...' : 'Cargando datos...'}
            </div>
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
                    <Card style={{
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: isDark ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.07)',
                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        marginBottom: '20px'
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
                                        👥 Seleccionar Rol
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
                                        👥 Usuarios por Rol
                                    </h4>
                                    <p style={{
                                        margin: 0,
                                        color: isDark ? '#9ca3af' : '#6b7280',
                                        fontSize: '14px'
                                    }}>
                                        Gestiona los usuarios asignados a cada rol
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
                                        Nuevo Usuario
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
                                                name="id_rol_usuario"
                                                placeholder="Filtrar por ID"
                                                value={columnFilters.id_rol_usuario}
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
                                            <Form.Label className="small text-muted mb-1">ID Usuario</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="id_usuario"
                                                placeholder="Filtrar por ID Usuario"
                                                value={columnFilters.id_usuario}
                                                onChange={handleColumnFilterChange}
                                                size="sm"
                                                style={{ borderRadius: '6px' }}
                                            />
                                        </Col>
                                        <Col xs={12} md={3} className="mb-2">
                                            <Form.Label className="small text-muted mb-1">Nombre Usuario</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="nombre_usuario"
                                                placeholder="Filtrar por Nombre"
                                                value={columnFilters.nombre_usuario}
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
                                    data={filteredRolUsuarios}
                                    keyField="id_rol_usuario"
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
                                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                                            <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                                                {idRol === 0 
                                                    ? 'Selecciona un rol para ver los usuarios'
                                                    : 'No hay usuarios asignados a este rol'
                                                }
                                            </div>
                                            <div style={{ fontSize: '14px' }}>
                                                {idRol === 0 
                                                    ? 'Elige un rol del menú desplegable para comenzar'
                                                    : 'Comienza asignando usuarios a este rol'
                                                }
                                            </div>
                                        </div>
                                    }
                                    customStyles={{
                                        table: {
                                            style: {
                                                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                                color: isDark ? '#f3f4f6' : '#1f2937'
                                            }
                                        },
                                        headRow: {
                                            style: {
                                                backgroundColor: isDark ? '#374151' : '#f8fafc',
                                                borderBottom: isDark ? '1px solid #4b5563' : '1px solid #e2e8f0',
                                                minHeight: '48px',
                                                fontSize: '14px',
                                                fontWeight: '600'
                                            }
                                        },
                                        headCells: {
                                            style: {
                                                color: isDark ? '#f3f4f6' : '#374151',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                paddingLeft: '16px',
                                                paddingRight: '16px'
                                            }
                                        },
                                        rows: {
                                            style: {
                                                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                                borderBottom: isDark ? '1px solid #374151' : '1px solid #f1f5f9',
                                                minHeight: '52px',
                                                fontSize: '14px',
                                                '&:nth-of-type(odd)': {
                                                    backgroundColor: isDark ? '#2d3748' : '#f8fafc'
                                                },
                                                '&:hover': {
                                                    backgroundColor: isDark ? '#374151' : '#f1f5f9',
                                                    transform: 'scale(1.001)',
                                                    transition: 'all 0.2s ease-in-out'
                                                }
                                            }
                                        },
                                        cells: {
                                            style: {
                                                color: isDark ? '#f3f4f6' : '#1f2937',
                                                paddingLeft: '16px',
                                                paddingRight: '16px'
                                            }
                                        },
                                        pagination: {
                                            style: {
                                                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                                borderTop: isDark ? '1px solid #374151' : '1px solid #e2e8f0',
                                                color: isDark ? '#f3f4f6' : '#1f2937'
                                            }
                                        }
                                    }}
                                />
                            </div>

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
