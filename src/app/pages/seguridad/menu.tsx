import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Row, Table, Spinner, Button, Form } from 'react-bootstrap'
import { useEffect, useState, useRef } from 'react'
import { fetchMenuModulo, fetchMenuById, createMenu, updateMenu, deleteMenu, Menu } from '@/servicios/menuProvider'
import Swal from 'sweetalert2'
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import { FaSearch } from 'react-icons/fa'
import { fetchModulo } from '@/servicios/moduloProvider'
import { useFormContext } from "@/utils/formContext.jsx";
import { useAuthContext } from '@/context/useAuthContext'
import DataTable from 'react-data-table-component'
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


const MenuPage = () => {
    const { theme, changeTheme } = useLayoutContext()
    const isDark = theme === 'dark'
    const [menus, setMenus] = useState<Menu[]>([])
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [showDrawer, setShowDrawer] = useState(false)
    const [menuSeleccionado, setMenuSeleccionado] = useState<Menu | null>(null)
    const [isEdit, setEdit] = useState(true)
    const [modulos, setModulos] = useState<Menu[]>([])
    const [idModulo, setIdModulo] = useState(0);
    const { formValuesData } = useFormContext({
        id_empresa: sessionStorage.getItem("id_empresa") || "0"
    });
    const { user } = useAuthContext()
    const { token, id_empresa } = user || {}
    const [search, setSearch] = useState('')
    const descripcionRef = useRef<HTMLInputElement>(null)
    const [isReloading, setIsReloading] = useState(false)
    const [columnFilters, setColumnFilters] = useState({
        id_menu: '',
        descripcion: '',
        orden: '',
        icono: '',
    });

    const handleColumnFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setColumnFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredMenu = menus.filter((menu) => {
        const s = search.toLowerCase();
        const globalMatch = (
            String(menu.id_menu).includes(s) ||
            (menu.descripcion?.toLowerCase().includes(s)) ||
            String(menu.orden).includes(s) ||
            (menu.icono?.toLowerCase().includes(s)) ||
            String(menu.id_empresa).includes(s)
        );

        const columnMatch = (
            String(menu.id_menu).includes(columnFilters.id_menu) &&
            (menu.descripcion?.toLowerCase().includes(columnFilters.descripcion.toLowerCase()) || columnFilters.descripcion === '') &&
            String(menu.orden).includes(columnFilters.orden) &&
            (menu.icono?.toLowerCase().includes(columnFilters.icono.toLowerCase()) || columnFilters.icono === '')
        );

        return globalMatch && columnMatch;
    });




    const columns = [
        {
            name: 'ID',
            selector: (row: any) => row.id_menu,
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
                    {row.id_menu}
                </div>
            )
        },
        {
            name: 'Nombre',
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
            name: 'Icono',
            selector: (row: any) => row.icono,
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
                    {row.icono}
                </div>
            )
        },
        {
            name: 'Acciones',
            cell: (menu) => (
                <div className="d-flex gap-2">
                    <Button
                        variant="warning"
                        size="sm"
                        className="d-flex align-items-center"
                        onClick={() => handleEdit(menu)}
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
                        onClick={() => handleDelete(menu)}
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

    const [formValues, setFormValues] = useState({
        id_menu: "",
        descripcion: "",
        orden: "",
        icono: "",
        id_modulo: idModulo,
        id_empresa: id_empresa
    });

    const validateForm = () => {
        const errors: { [key: string]: string } = {};

        if (!formValues.descripcion || formValues.descripcion.trim() === "") {
            errors.descripcion = "La descripción es obligatoria";
        }

        if (!formValues.orden || isNaN(Number(formValues.orden)) || Number(formValues.orden) <= 0) {
            errors.orden = "El orden es obligatorio y debe ser un número mayor a 0";
        }

        if (!formValues.id_modulo || Number(formValues.id_modulo) === 0) {
            errors.id_modulo = "Debe seleccionar un módulo";
        }

        if (!formValues.id_empresa || isNaN(Number(formValues.id_empresa)) || Number(formValues.id_empresa) <= 0) {
            errors.id_empresa = "El ID de empresa es obligatorio";
        }

        if (!formValues.icono || formValues.icono.trim() === "") {
            errors.icono = "El icono es obligatorio";
        }

        console.log("Form errors:", errors);
        return errors;
    };

    useEffect(() => {
        if (menuSeleccionado) {
            setFormValues({
                id_menu: String(menuSeleccionado.id_menu),
                descripcion: menuSeleccionado.descripcion,
                orden: String(menuSeleccionado.orden),
                id_modulo: idModulo,
                id_empresa: id_empresa,
                icono: menuSeleccionado.icono || ''
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
    }, [formValuesData, menuSeleccionado]);


    const loadModulos = async () => {
        try {
            const data = await fetchModulo(token);
            setModulos(
                (data ?? []).map((modulo: any) => ({
                    id_menu: modulo.id_menu ?? 0,
                    id_modulo: modulo.id_modulo ?? 0,
                    descripcion: modulo.descripcion ?? '',
                    orden: modulo.orden ?? 0,
                    icono: modulo.icono ?? '',
                    ruta: modulo.ruta ?? '',
                    id_empresa: modulo.id_empresa ?? 0
                }))
            );
        } catch (error) {
            console.error("Error loading modulos:", error);
        }
    };

    const handleInputChange = (
        e: any
    ) => {
        const { id, value } = e.target
        setFormValues(prev => ({
            ...prev,
            [id]: value,
        }))

        if (id === "id_modulo") {
            setIdModulo(Number(value))
        }
    }

    const handleCancel = () => {
        setShowDrawer(false)
        setMenuSeleccionado(null)
        setFormErrors({})
    }

    const handleCreate = () => {
        setMenuSeleccionado(null)
        setShowDrawer(true)
        setEdit(false)
        setFormValues({
            id_menu: "",
            descripcion: "",
            orden: "",
            id_modulo: idModulo,
            id_empresa: id_empresa,
            icono: ""
        })
        setFormErrors({})
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
            await getMenus();
        };
        fetchData();
    }, [])

    const getMenus = async () => {
        fetchMenuModulo(idModulo, token)
            .then(data => setMenus(data))
            .catch(() => setError('Error al cargar menús'))
            .finally(() => setLoading(false))
    }

    const handleReload = async () => {
        setIsReloading(true);
        try {
            await getMenus();
        } catch (error) {
            console.error('Error reloading data:', error);
        } finally {
            setIsReloading(false);
        }
    };

    const handleEdit = async (menu: Menu) => {
        try {
            const data = await fetchMenuById(menu.id_menu, token);
            setMenuSeleccionado(data[0]);
            setFormErrors({});
            setEdit(true);
            setShowDrawer(true);
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo obtener la información del menú.',
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
        setMenuSeleccionado(null)
    }

    const handleDelete = (menu: Menu) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar el menú ""?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                await deleteMenu(menu.id_menu, token);
                await getMenus();
                Swal.fire('Eliminado', 'El menú ha sido eliminado.', 'success')
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

        if (isEdit) {
            if (!menuSeleccionado) {
                Swal.fire({
                    title: 'Error',
                    text: 'No se ha seleccionado un menú para editar.',
                    icon: 'error',
                });
                return;
            }

            const update = await updateMenu({
                id_menu: Number(menuSeleccionado.id_menu),
                descripcion: formValues.descripcion,
                orden: Number(formValues.orden),
                id_modulo: idModulo,
                id_empresa: Number(id_empresa),
                icono: formValues.icono
            }, token);

            if ((update as any).estado !== false) {
                await getMenus();

                Swal.fire({
                    title: 'Registro Modificado',
                    text: 'Se ha modificado el registro.',
                    icon: 'success',
                });

                setFormValues({
                    id_menu: "",
                    descripcion: "",
                    orden: "",
                    id_modulo: idModulo,
                    id_empresa: id_empresa,
                    icono: ""
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
            const newEntrie = await createMenu({
                id_empresa: Number(id_empresa) || 0,
                icono: formValues.icono,
                orden: Number(formValues.orden),
                id_modulo: idModulo,
                descripcion: formValues.descripcion,
            }, token);

            if ((newEntrie as any).estado !== false) {
                await getMenus();

                Swal.fire({
                    title: 'Registro exitoso',
                    text: 'Se ha creado un nuevo registro.',
                    icon: 'success',
                });

                setFormValues({
                    id_menu: "",
                    descripcion: "",
                    orden: "",
                    id_modulo: idModulo,
                    id_empresa: id_empresa,
                    icono: ""
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

    const handleSearch = async () => {
        setLoading(true)
        try {
            const data = await fetchMenuModulo(idModulo, token)
            setMenus(data)
            setError(null)
        } catch {
            setError('Error al buscar menús')
        } finally {
            setLoading(false)
        }
    }


    if (loading) return <Spinner animation="border" />
    if (error) return <div>{error}</div>

    return (
        <>
            <PageTitle title="Menús" />

            <Row>
                <Col xs={12}>
                    <div className="transition-content grid grid-cols-1 grid-rows-[auto_auto_1fr] px-3 py-4 bg-white rounded-md border border-gray-300 mb-3">
                        <div className="flex w-full items-end">
                            <div className="flex-1 min-w-0" style={{ maxWidth: 350 }}>
                                <label htmlFor="id_modulo" className="block text-sm font-medium text-gray-700 mb-10">
                                    Módulo
                                </label>
                                <select
                                    id="id_modulo"
                                    className="form-select mt-1 w-full"
                                    value={idModulo}
                                    onChange={handleInputChange}
                                >
                                    <option value={0}>Seleccione un Módulo</option>
                                    {modulos.map((modulo) => (
                                        <option key={modulo.id_modulo} value={modulo.id_modulo}>
                                            {modulo.descripcion}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Button
                                className="h-8 space-x-1.5 rounded-md px-3 text-xs d-flex align-items-center ms-auto"
                                variant="primary"
                                onClick={handleSearch}
                                style={{ marginLeft: 16 }}
                            >
                                <FaSearch className="me-2" />
                                <span>Buscar</span>
                            </Button>
                        </div>
                    </div>

                    <Card>
                        <CardBody>
                            <div className="d-flex align-items-center justify-content-between mb-1">
                                <div className="d-flex align-items-center">
                                    <h4 className="header-title mb-0 me-2">Menús</h4>
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
                            <p className="text-muted">Gestión de menús</p>

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
                                                name="id_menu"
                                                placeholder="Filtrar por ID"
                                                value={columnFilters.id_menu}
                                                onChange={handleColumnFilterChange}
                                                size="sm"
                                                style={{ borderRadius: '6px' }}
                                            />
                                        </Col>
                                        <Col xs={12} md={3} className="mb-2">
                                            <Form.Label className="small text-muted mb-1">Nombre</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="descripcion"
                                                placeholder="Filtrar por Nombre"
                                                value={columnFilters.descripcion}
                                                onChange={handleColumnFilterChange}
                                                size="sm"
                                                style={{ borderRadius: '6px' }}
                                            />
                                        </Col>
                                        <Col xs={12} md={3} className="mb-2">
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
                                        <Col xs={12} md={3} className="mb-2">
                                            <Form.Label className="small text-muted mb-1">Icono</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="icono"
                                                placeholder="Filtrar por Icono"
                                                value={columnFilters.icono}
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
                                                📋
                                            </div>
                                            <h5 style={{ 
                                                margin: '0 0 8px 0', 
                                                color: isDark ? '#e5e7eb' : '#374151',
                                                fontWeight: '600'
                                            }}>
                                                No hay menús disponibles
                                            </h5>
                                            <p style={{ 
                                                margin: 0, 
                                                fontSize: '14px',
                                                opacity: 0.8
                                            }}>
                                                Selecciona un módulo y presiona buscar para ver los menús
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
                                                            {isEdit ? "Editar Menú" : "Crear Menú"}
                                                        </h3>
                                                    </div>
                                                    <p style={{ 
                                                        margin: 0, 
                                                        fontSize: '14px',
                                                        opacity: 0.9,
                                                        fontWeight: '400'
                                                    }}>
                                                        {isEdit 
                                                            ? `Modificando: ${menuSeleccionado?.descripcion || 'Menú'}`
                                                            : 'Complete la información del nuevo menú'
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
                                            <span style={{ opacity: 0.7 }}>Menús</span>
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
                                        {(menuSeleccionado || !isEdit) && (
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
                                                                ref={descripcionRef}
                                                                type="text"
                                                                id="descripcion"
                                                                placeholder="Ingrese el nombre del menú"
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
                                                    <Col xs={12} md={6}>
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
                                                    <Col xs={12} md={6}>
                                                        <Form.Group className="mb-4">
                                                            <Form.Label style={{
                                                                fontWeight: '600',
                                                                color: isDark ? '#e5e7eb' : '#374151',
                                                                fontSize: '14px',
                                                                marginBottom: '8px'
                                                            }}>
                                                                Icono *
                                                            </Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                id="icono"
                                                                placeholder="Ingrese el icono"
                                                                value={formValues.icono}
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
                                                                    ...(formErrors.icono && {
                                                                        borderColor: '#ef4444',
                                                                        boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)'
                                                                    })
                                                                }}
                                                            />
                                                            {formErrors.icono && (
                                                                <div style={{
                                                                    color: '#ef4444',
                                                                    fontSize: '13px',
                                                                    marginTop: '6px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}>
                                                                    ⚠️ {formErrors.icono}
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

export default MenuPage
