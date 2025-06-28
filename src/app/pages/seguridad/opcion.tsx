import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Row, Table, Spinner, Button, Form } from 'react-bootstrap'
import { useEffect, useState, useRef } from 'react'
import { fetchOpcion, fetchOpcionMenu, fetchOpcionById, createOpcion, updateOpcion, deleteOpcion } from '@/servicios/opcionProvider'
import { fetchModulo } from '@/servicios/moduloProvider'
import Swal from 'sweetalert2'
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import { BiEdit, BiPlus, BiTrash, BiRefresh } from 'react-icons/bi'
import { FaSearch } from 'react-icons/fa'
import { useFormContext } from "@/utils/formContext.jsx";
import { useAuthContext } from '@/context/useAuthContext'
import { fetchMenuModulo } from '@/servicios/menuProvider'
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

const OpcionPage = () => {
    const { theme, changeTheme } = useLayoutContext()
    const isDark = theme === 'dark'
    const [opciones, setOpciones] = useState<any[]>([])
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [showDrawer, setShowDrawer] = useState(false)
    const [opcionSeleccionada, setOpcionSeleccionada] = useState<any | null>(null)
    const [isEdit, setEdit] = useState(true)
    const [modulos, setModulos] = useState<{ id_modulo: number, descripcion: string }[]>([])
    const [idModulo, setIdModulo] = useState(0);
    const [idMenu, setIdMenu] = useState(0);
    const { user } = useAuthContext()
    const { token, id_empresa } = user || {}
    const { formValuesData } = useFormContext({
        id_empresa: sessionStorage.getItem("id_empresa") || "0"
    });
    const [menu, setMenu] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const descripcionRef = useRef<HTMLInputElement>(null)
    const [isReloading, setIsReloading] = useState(false)
    const [columnFilters, setColumnFilters] = useState({
        id_opcion: '',
        descripcion: '',
        ruta: '',
        orden: '',
        id_menu: '',
    });

    const handleColumnFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setColumnFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredOpciones = opciones.filter((opcion) => {
        const s = search.toLowerCase();
        const globalMatch = (
            String(opcion.id_opcion).includes(s) ||
            (opcion.descripcion?.toLowerCase().includes(s)) ||
            (opcion.ruta?.toLowerCase().includes(s)) ||
            String(opcion.orden).includes(s) ||
            String(opcion.id_menu).includes(s) ||
            String(opcion.id_empresa).includes(s)
        );

        const columnMatch = (
            String(opcion.id_opcion).includes(columnFilters.id_opcion) &&
            (opcion.descripcion?.toLowerCase().includes(columnFilters.descripcion.toLowerCase()) || columnFilters.descripcion === '') &&
            (opcion.ruta?.toLowerCase().includes(columnFilters.ruta.toLowerCase()) || columnFilters.ruta === '') &&
            String(opcion.orden).includes(columnFilters.orden) &&
            String(opcion.id_menu).includes(columnFilters.id_menu)
        );

        return globalMatch && columnMatch;
    });


    const columns = [
        {
            name: 'ID',
            selector: (row: any) => row.id_opcion,
            sortable: true,
            width: '80px',
            cell: (row: any) => (
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
                    {row.id_opcion}
                </div>
            )
        },
        {
            name: 'Descripción',
            selector: (row: any) => row.descripcion,
            sortable: true,
            cell: (row: any) => (
                <div style={{ 
                    fontWeight: '500',
                    color: isDark ? '#f3f4f6' : '#1f2937'
                }}>
                    {row.descripcion}
                </div>
            )
        },
        {
            name: 'Ruta',
            selector: (row: any) => row.ruta,
            sortable: true,
            cell: (row: any) => (
                <div style={{ 
                    fontFamily: 'monospace',
                    backgroundColor: isDark ? '#4c1d95' : '#ede9fe',
                    color: isDark ? '#c4b5fd' : '#7c3aed',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500'
                }}>
                    {row.ruta}
                </div>
            )
        },
        {
            name: 'Orden',
            selector: (row: any) => row.orden,
            sortable: true,
            width: '100px',
            cell: (row: any) => (
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
            cell: (opcion) => (
                <div className="d-flex gap-2">
                    <Button
                        variant="warning"
                        size="sm"
                        className="d-flex align-items-center"
                        onClick={() => handleEdit(opcion)}
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
                        Editar
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        className="d-flex align-items-center"
                        onClick={() => handleDelete(opcion)}
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
            allowOverflow: true,
            button: true,
            width: '200px'
        },
    ];


    const [formValues, setFormValues] = useState({
        id_opcion: "",
        descripcion: "",
        orden: "",
        ruta: "",
        id_modulo: idModulo,
        id_empresa: id_empresa || 0
    });

    const validateForm = () => {
        const errors: { [key: string]: string } = {};

        if (!formValues.descripcion || formValues.descripcion.trim() === "") {
            errors.descripcion = "La descripción es obligatoria";
        }

        if (!formValues.orden || isNaN(Number(formValues.orden)) || Number(formValues.orden) <= 0) {
            errors.orden = "El orden es obligatorio y debe ser un número mayor a 0";
        }

        if (!formValues.id_empresa || isNaN(Number(formValues.id_empresa)) || Number(formValues.id_empresa) <= 0) {
            errors.id_empresa = "El ID de empresa es obligatorio";
        }

        if (!formValues.ruta || formValues.ruta.trim() === "") {
            errors.ruta = "La ruta es obligatoria";
        }

        if (!idMenu || idMenu <= 0) {
            errors.id_menu = "Debe seleccionar un menú";
        }

        return errors;
    };

    useEffect(() => {
        if (opcionSeleccionada) {
            setFormValues({
                id_opcion: String(opcionSeleccionada.id_opcion),
                descripcion: opcionSeleccionada.descripcion,
                orden: String(opcionSeleccionada.orden),
                id_modulo: opcionSeleccionada.id_modulo ?? 0,
                id_empresa: id_empresa || 0,
                ruta: opcionSeleccionada.ruta || ''
            })
            setFormErrors({})
        }

        const fetchData = async () => {
            if (id_empresa !== "0") {
                try {
                    await loadModulos();
                } catch (error) {
                    console.error("Error loading data:", error);
                }
            }
        };
        fetchData();
    }, [formValuesData, opcionSeleccionada]);





    const loadModulos = async () => {
        try {
            const data = await fetchModulo(token,);
            setModulos(
                (data ?? []).map((modulo: any) => ({
                    id_modulo: modulo.id_modulo ?? 0,
                    descripcion: modulo.descripcion ?? '',
                }))
            );
        } catch (error) {
            console.error("Error loading modulos:", error);
        }
    };

    const cargarModulo = async (idModuloSelected) => {
        try {
            const data = await fetchMenuModulo(idModuloSelected, token);
            setMenu(data);
        } catch (error) {
            setMenu([]);
        }
    };

    const handleInputChange = (e: any) => {
        const { id, value } = e.target
        setFormValues(prev => ({
            ...prev,
            [id]: value,
        }))

        if (id === "id_modulo") {
            setIdModulo(Number(value))
            cargarModulo(Number(value));
        }

        if (id === "id_menu") {
            setIdMenu(Number(value));
        }
    }

    const handleCancel = () => {
        setShowDrawer(false)
        setOpcionSeleccionada(null)
        setFormErrors({})
    }

    const handleCreate = () => {
        setOpcionSeleccionada(null)
        setShowDrawer(true)
        setEdit(false)
        setFormValues({
            id_opcion: "",
            descripcion: "",
            orden: "",
            id_modulo: idModulo,
            id_empresa: id_empresa || 0,
            ruta: ""
        })
        setFormErrors({})
        // Ensure a menu is selected
        if (idMenu <= 0) {
            Swal.fire({
                title: 'Seleccionar Menú',
                text: 'Debe seleccionar un módulo y menú antes de crear una opción.',
                icon: 'warning',
            });
            return;
        }
    }

    // Auto-focus when drawer opens
    useEffect(() => {
        if (showDrawer && descripcionRef.current) {
            setTimeout(() => {
                descripcionRef.current?.focus();
            }, 100);
        }
    }, [showDrawer]);

    useEffect(() => {
        const fetchData = async () => {
            await getOpciones();
        };
        fetchData();
    }, [])

    const getOpciones = async () => {
        fetchOpcionMenu(idMenu, token)
            .then(data => setOpciones(data))
            .catch(() => setError('Error al cargar opciones'))
            .finally(() => setLoading(false))
    }

    const handleReload = async () => {
        setIsReloading(true);
        try {
            await getOpciones();
        } catch (error) {
            console.error('Error reloading data:', error);
        } finally {
            setIsReloading(false);
        }
    };

    const handleEdit = async (opcion: any) => {
        try {
            const data = await fetchOpcionById(opcion.id_opcion, token);
            setOpcionSeleccionada(data[0]);
            setFormErrors({});
            setEdit(true);
            setShowDrawer(true);
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo obtener la información de la opción.',
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
        setOpcionSeleccionada(null)
    }

    const handleDelete = (opcion: any) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar la opción ${opcion.descripcion}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const deleteResult = await deleteOpcion(opcion.id_opcion, token);
                    if (deleteResult.estado === false) {
                        Swal.fire('Error', deleteResult.mensaje || 'No se pudo eliminar la opción.', 'error');
                    } else {
                        await opcionesMenuFetch();
                        Swal.fire('Eliminado', 'La opción ha sido eliminada.', 'success');
                    }
                } catch (error) {
                    Swal.fire('Error', 'Ocurrió un error al eliminar la opción.', 'error');
                }
            }
        })
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
                if (!opcionSeleccionada) {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se ha seleccionado una opción para editar.',
                        icon: 'error',
                    });
                    return;
                }

                const update = await updateOpcion({
                    id_opcion: Number(opcionSeleccionada.id_opcion),
                    descripcion: formValues.descripcion,
                    orden: Number(formValues.orden),
                    id_empresa: Number(id_empresa) || 0,
                    ruta: formValues.ruta,
                    id_menu: idMenu
                }, token);

                if (update?.estado !== false) {
                    await opcionesMenuFetch();
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
                const newEntry = await createOpcion({
                    id_empresa: Number(id_empresa),
                    orden: Number(formValues.orden),
                    descripcion: formValues.descripcion,
                    id_opcion: formValues.id_opcion ? Number(formValues.id_opcion) : 0,
                    ruta: formValues.ruta,
                    id_menu: idMenu
                }, token);

                if (newEntry?.estado !== false) {
                    await opcionesMenuFetch();
                    Swal.fire({
                        title: 'Registro exitoso',
                        text: newEntry?.mensaje || 'Se ha creado un nuevo registro exitosamente.',
                        icon: 'success',
                    });
                    setShowDrawer(false);
                    setFormErrors({});
                    // Reset form
                    setFormValues({
                        id_opcion: "",
                        descripcion: "",
                        orden: "",
                        id_modulo: idModulo,
                        id_empresa: id_empresa || 0,
                        ruta: ""
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

    const handleSearch = async () => {
        setLoading(true)
        try {
            opcionesMenuFetch();
        } catch {
            setError('Error al buscar opciones')
        } finally {
            setLoading(false)
        }
    }

    const opcionesMenuFetch = async () => {
        const data = await fetchOpcionMenu(idMenu, token)
        setOpciones(data)
    }

    if (loading) return <Spinner animation="border" />
    if (error) return <div>{error}</div>

    return (
        <>
            <PageTitle title="Opciones" />

            <Row>
                <Col xs={12}>
                    <Card className="mb-4" style={{ 
                        backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
                        border: isDark ? '1px solid #404040' : '1px solid #e5e7eb',
                        borderRadius: '12px',
                        boxShadow: isDark 
                            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
                            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                        <CardBody className="p-4">
                            <h6 className="mb-3" style={{ 
                                color: isDark ? '#e5e7eb' : '#374151',
                                fontWeight: '600' 
                            }}>
                                🔍 Filtros de Búsqueda
                            </h6>
                            <Row className="align-items-end">
                                <Col xs={12} md={4} className="mb-3">
                                    <Form.Label style={{
                                        fontWeight: '500',
                                        color: isDark ? '#d1d5db' : '#374151',
                                        fontSize: '14px',
                                        marginBottom: '8px'
                                    }}>
                                        📂 Módulo *
                                    </Form.Label>
                                    <Form.Select
                                        id="id_modulo"
                                        value={idModulo}
                                        onChange={handleInputChange}
                                        style={{
                                            borderRadius: '8px',
                                            border: isDark ? '1px solid #404040' : '1px solid #d1d5db',
                                            backgroundColor: isDark ? '#374151' : '#ffffff',
                                            color: isDark ? '#ffffff' : '#000000',
                                            padding: '10px 12px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value={0}>Seleccione un Módulo</option>
                                        {modulos.map((modulo) => (
                                            <option key={modulo.id_modulo} value={modulo.id_modulo}>
                                                {modulo.descripcion}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col xs={12} md={4} className="mb-3">
                                    <Form.Label style={{
                                        fontWeight: '500',
                                        color: isDark ? '#d1d5db' : '#374151',
                                        fontSize: '14px',
                                        marginBottom: '8px'
                                    }}>
                                        📋 Menú *
                                    </Form.Label>
                                    <Form.Select
                                        id="id_menu"
                                        value={idMenu}
                                        disabled={idModulo === 0}
                                        onChange={handleInputChange}
                                        style={{
                                            borderRadius: '8px',
                                            border: isDark ? '1px solid #404040' : '1px solid #d1d5db',
                                            backgroundColor: idModulo === 0 
                                                ? (isDark ? '#1f2937' : '#f3f4f6')
                                                : (isDark ? '#374151' : '#ffffff'),
                                            color: idModulo === 0 
                                                ? (isDark ? '#6b7280' : '#9ca3af')
                                                : (isDark ? '#ffffff' : '#000000'),
                                            padding: '10px 12px',
                                            fontSize: '14px',
                                            cursor: idModulo === 0 ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        <option value={0}>
                                            {idModulo === 0 ? 'Primero seleccione un módulo' : 'Seleccione un Menú'}
                                        </option>
                                        {menu.map((menuItem) => (
                                            <option key={menuItem.id_menu} value={menuItem.id_menu}>
                                                {menuItem.descripcion}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col xs={12} md={4} className="mb-3">
                                    <Button
                                        variant="primary"
                                        onClick={handleSearch}
                                        disabled={idMenu <= 0}
                                        className="w-100 d-flex align-items-center justify-content-center"
                                        style={{
                                            borderRadius: '8px',
                                            padding: '10px 16px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            border: 'none',
                                            background: idMenu <= 0 
                                                ? (isDark ? '#374151' : '#d1d5db')
                                                : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                            color: idMenu <= 0 
                                                ? (isDark ? '#6b7280' : '#9ca3af')
                                                : '#ffffff',
                                            cursor: idMenu <= 0 ? 'not-allowed' : 'pointer',
                                            boxShadow: idMenu > 0 ? '0 2px 4px rgba(59, 130, 246, 0.2)' : 'none',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <FaSearch className="me-2" />
                                        <span>Buscar Opciones</span>
                                    </Button>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <div className="d-flex align-items-center justify-content-between mb-1">
                                <div className="d-flex align-items-center">
                                    <h4 className="header-title mb-0 me-2">Opciones</h4>
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
                            <p className="text-muted">Gestión de opciones</p>

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
                                                name="id_opcion"
                                                placeholder="Filtrar por ID"
                                                value={columnFilters.id_opcion}
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
                                        <Col xs={12} md={3} className="mb-2">
                                            <Form.Label className="small text-muted mb-1">Ruta</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="ruta"
                                                placeholder="Filtrar por Ruta"
                                                value={columnFilters.ruta}
                                                onChange={handleColumnFilterChange}
                                                size="sm"
                                                style={{ borderRadius: '6px' }}
                                            />
                                        </Col>
                                        <Col xs={12} md={2} className="mb-2">
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
                                        <Col xs={12} md={2} className="mb-2">
                                            <Form.Label className="small text-muted mb-1">Menú</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="id_menu"
                                                placeholder="Filtrar por Menú"
                                                value={columnFilters.id_menu}
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
                                    data={filteredOpciones}
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
                                                ⚙️
                                            </div>
                                            <h5 style={{ 
                                                margin: '0 0 8px 0', 
                                                color: isDark ? '#e5e7eb' : '#374151',
                                                fontWeight: '600'
                                            }}>
                                                No hay opciones disponibles
                                            </h5>
                                            <p style={{ 
                                                margin: 0, 
                                                fontSize: '14px',
                                                opacity: 0.8
                                            }}>
                                                Selecciona un menú y presiona buscar para ver las opciones
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
                                                            {isEdit ? "Editar Opción" : "Crear Opción"}
                                                        </h3>
                                                    </div>
                                                    <p style={{ 
                                                        margin: 0, 
                                                        fontSize: '14px',
                                                        opacity: 0.9,
                                                        fontWeight: '400'
                                                    }}>
                                                        {isEdit 
                                                            ? `Modificando: ${opcionSeleccionada?.descripcion || 'Opción'}`
                                                            : 'Complete la información de la nueva opción'
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
                                            <span style={{ opacity: 0.7 }}>Opciones</span>
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
                                        {(opcionSeleccionada || !isEdit) && (
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
                                                                ref={descripcionRef}
                                                                type="text"
                                                                id="descripcion"
                                                                placeholder="Ingrese la descripción de la opción"
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
                                                                Ruta *
                                                            </Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                id="ruta"
                                                                placeholder="Ingrese la ruta (ej: /dashboard, /usuarios)"
                                                                value={formValues.ruta}
                                                                onChange={handleInputChange}
                                                                style={{
                                                                    borderRadius: '8px',
                                                                    border: isDark ? '1px solid #404040' : '1px solid #d1d5db',
                                                                    backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
                                                                    color: isDark ? '#ffffff' : '#000000',
                                                                    padding: '12px 16px',
                                                                    fontSize: '14px',
                                                                    fontFamily: 'monospace',
                                                                    transition: 'all 0.2s ease',
                                                                    ...(formErrors.ruta && {
                                                                        borderColor: '#ef4444',
                                                                        boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)'
                                                                    })
                                                                }}
                                                            />
                                                            {formErrors.ruta && (
                                                                <div style={{
                                                                    color: '#ef4444',
                                                                    fontSize: '13px',
                                                                    marginTop: '6px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}>
                                                                    ⚠️ {formErrors.ruta}
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
                                                                placeholder="Ingrese el orden"
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
                                                onClick={submit}
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

export default OpcionPage
