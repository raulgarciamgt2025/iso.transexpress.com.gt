import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Row, Table, Spinner, Button, Form } from 'react-bootstrap'
import { useEffect, useState, useRef } from 'react'
import { fetchPeriodoAreaProceso, fetchPeriodoAreaProcesoById, createPeriodoAreaProceso, updatePeriodoAreaProceso, deletePeriodoAreaProceso, PeriodoAreaProceso } from '@/servicios/documentacion/periodoareaprocesoProvider'
import { fetchPeriodo, Periodo } from '@/servicios/documentacion/periodoProvider'
import { fetchArea, Area } from '@/servicios/documentacion/areaProvider'
import { fetchProceso, Proceso } from '@/servicios/documentacion/procesoProvider'
import Swal from 'sweetalert2'
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import { BiEdit, BiPlus, BiTrash, BiRefresh } from 'react-icons/bi'
import { FaSearch } from 'react-icons/fa'
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

const PeriodoAreaProcesoPage = () => {
    const { theme, changeTheme } = useLayoutContext()
    const isDark = theme === 'dark'
    const [periodoAreaProcesos, setPeriodoAreaProcesos] = useState<any[]>([])
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [showDrawer, setShowDrawer] = useState(false)
    const [periodoAreaProcesoSeleccionado, setPeriodoAreaProcesoSeleccionado] = useState<any | null>(null)
    const [isEdit, setEdit] = useState(true)
    const [periodos, setPeriodos] = useState<Periodo[]>([])
    const [areas, setAreas] = useState<Area[]>([])
    const [procesos, setProcesos] = useState<Proceso[]>([])
    const [idPeriodo, setIdPeriodo] = useState(0);
    const [idArea, setIdArea] = useState(0);
    const { user } = useAuthContext()
    const { token, id_empresa } = user || {}
    const { formValuesData } = useFormContext({
        id_empresa: sessionStorage.getItem("id_empresa") || "0"
    });
    const [search, setSearch] = useState('');
    const idProcesoRef = useRef<HTMLSelectElement>(null)
    const [isReloading, setIsReloading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false) // Add flag to track if user has searched
    const [columnFilters, setColumnFilters] = useState({
        id_configuracion: '',
        id_proceso: '',
        descripcion_proceso: '',
    });

    const handleColumnFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setColumnFilters(prev => ({ ...prev, [name]: value }));
    };

    // Enhanced filtered data with proceso information
    // Only show data if user has clicked "Buscar Configuraciones" and filters are selected
    const filteredPeriodoAreaProcesos = (!hasSearched || idPeriodo === 0 || idArea === 0) ? [] : periodoAreaProcesos.filter((item) => {
        // Filter by selected periodo and area first
        if (item.id_periodo !== idPeriodo || item.id_area !== idArea) {
            return false;
        }

        const proceso = procesos.find(p => p.id_proceso === item.id_proceso);
        const s = search.toLowerCase();
        const globalMatch = (
            String(item.id_configuracion).includes(s) ||
            String(item.id_proceso).includes(s) ||
            (proceso?.descripcion?.toLowerCase().includes(s))
        );

        const columnMatch = (
            String(item.id_configuracion).includes(columnFilters.id_configuracion) &&
            String(item.id_proceso).includes(columnFilters.id_proceso) &&
            (proceso?.descripcion?.toLowerCase().includes(columnFilters.descripcion_proceso.toLowerCase()) || columnFilters.descripcion_proceso === '')
        );

        return globalMatch && columnMatch;
    });

    const columns = [
        {
            name: 'ID Config',
            selector: (row: any) => row.id_configuracion,
            sortable: true,
            width: '100px',
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
                    {row.id_configuracion}
                </div>
            )
        },
        {
            name: 'ID Proceso',
            selector: (row: any) => row.id_proceso,
            sortable: true,
            width: '110px',
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
                    {row.id_proceso}
                </div>
            )
        },
        {
            name: 'Descripción del Proceso',
            selector: (row: any) => {
                const proceso = procesos.find(p => p.id_proceso === row.id_proceso);
                return proceso?.descripcion || 'No encontrado';
            },
            sortable: true,
            cell: (row: any) => {
                const proceso = procesos.find(p => p.id_proceso === row.id_proceso);
                return (
                    <div style={{ 
                        fontWeight: '500',
                        color: isDark ? '#f3f4f6' : '#1f2937'
                    }}>
                        {proceso?.descripcion || 'No encontrado'}
                    </div>
                );
            }
        },
        {
            name: 'Acciones',
            cell: (item) => (
                <div className="d-flex gap-1">
                    <Button
                        variant="danger"
                        size="sm"
                        className="d-flex align-items-center"
                        onClick={() => handleDelete(item.id_configuracion)}
                        style={{
                            borderRadius: '6px',
                            padding: '6px 8px',
                            fontSize: '12px',
                            fontWeight: '500',
                            border: 'none',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap',
                            minWidth: 'auto'
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
            width: '100px',
            ignoreRowClick: true,
            allowOverflow: true,
            button: true
        }
    ];

    useEffect(() => {
        if (token && id_empresa) {
            loadData()
        }
    }, [token, id_empresa])

    const loadData = async () => {
        setLoading(true)
        try {
            // Load periodos, areas, procesos, and periodo-area-proceso data
            const [periodosData, areasData, procesosData, itemsData] = await Promise.all([
                fetchPeriodo(token, Number(id_empresa)),
                fetchArea(token, Number(id_empresa)),
                fetchProceso(token, Number(id_empresa)),
                fetchPeriodoAreaProceso(token, Number(id_empresa))
            ]);
            
            setPeriodos(periodosData)
            setAreas(areasData)
            setProcesos(procesosData)
            setPeriodoAreaProcesos(itemsData)
        } catch (error) {
            console.error('Error loading data:', error)
            setError('Error al cargar los datos')
        } finally {
            setLoading(false)
        }
    }

    const handleReload = async () => {
        setIsReloading(true)
        try {
            // Only reload periodo-area-proceso data
            const itemsData = await fetchPeriodoAreaProceso(token, Number(id_empresa))
            setPeriodoAreaProcesos(itemsData)
            setHasSearched(true) // Set search flag when reloading/searching
        } catch (error) {
            console.error('Error reloading data:', error)
            setError('Error al recargar los datos')
        } finally {
            setTimeout(() => setIsReloading(false), 500)
        }
    }

    const validateForm = (data: any) => {
        const errors: { [key: string]: string } = {};
        
        if (!data.id_proceso || data.id_proceso === 0) {
            errors.id_proceso = 'Proceso es requerido';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreate = () => {
        // Validate that filters are selected
        if (idPeriodo === 0) {
            Swal.fire('Atención', 'Por favor seleccione un período antes de crear una configuración', 'warning');
            return;
        }
        if (idArea === 0) {
            Swal.fire('Atención', 'Por favor seleccione un área antes de crear una configuración', 'warning');
            return;
        }

        setPeriodoAreaProcesoSeleccionado({
            id_configuracion: 0,
            id_periodo: idPeriodo,
            id_area: idArea,
            id_proceso: 0,
            id_empresa: Number(id_empresa)
        })
        setEdit(false)
        setFormErrors({});
        setShowDrawer(true)
        // Focus on the proceso select after drawer opens
        setTimeout(() => {
            if (idProcesoRef.current) {
                idProcesoRef.current.focus();
            }
        }, 100);
    }

    const handleSave = async () => {
        if (!validateForm(periodoAreaProcesoSeleccionado)) {
            return;
        }

        try {
            const id_usuario_asigno = sessionStorage.getItem("id_usuario") || "0";
            const itemData = {
                ...periodoAreaProcesoSeleccionado,
                id_usuario_asigno: Number(id_usuario_asigno)
            };

            // Since we removed edit functionality, only create new items
            const { id_configuracion, ...createData } = itemData;
            const result = await createPeriodoAreaProceso(createData, token)

            if (result.estado) {
                Swal.fire({
                    title: 'Éxito',
                    text: result.mensaje,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                })
                setShowDrawer(false)
                handleReload() // Use the optimized reload function
            } else {
                Swal.fire('Error', result.mensaje, 'error')
            }
        } catch (error) {
            console.error('Error saving item:', error)
            Swal.fire('Error', 'Error al guardar el item', 'error')
        }
    }

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'No podrás revertir esta acción',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        })

        if (result.isConfirmed) {            try {
                const deleteResult = await deletePeriodoAreaProceso(id, token)
                if (deleteResult.estado) {
                    Swal.fire({
                        title: 'Eliminado',
                        text: deleteResult.mensaje,
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    })
                    handleReload() // Use the optimized reload function
                } else {
                    Swal.fire('Error', deleteResult.mensaje, 'error')
                }
            } catch (error) {
                console.error('Error deleting item:', error)
                Swal.fire('Error', 'Error al eliminar el item', 'error')
            }
        }
    }

    // Filter areas based on selected periodo
    const filteredAreas = areas.filter(area => {
        if (idPeriodo === 0) return true;
        // You might need to implement additional filtering logic here
        // based on your business rules for periodo-area relationships
        return true;
    });

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </Spinner>
            </div>
        )
    }

    if (error) {
        return (
            <div className="alert alert-danger" role="alert">
                {error}
            </div>
        )
    }

    return (
        <>
            <PageTitle title="Período Área Proceso" />

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
                                        📅 Período *
                                    </Form.Label>
                                    <Form.Select
                                        value={idPeriodo}
                                        onChange={(e) => setIdPeriodo(Number(e.target.value))}
                                        style={{
                                            borderRadius: '8px',
                                            border: isDark ? '1px solid #404040' : '1px solid #d1d5db',
                                            backgroundColor: isDark ? '#374151' : '#ffffff',
                                            color: isDark ? '#ffffff' : '#000000',
                                            padding: '10px 12px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value={0}>Todos los períodos</option>
                                        {periodos.map(periodo => (
                                            <option key={periodo.id_periodo} value={periodo.id_periodo}>
                                                {periodo.label}
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
                                        🏢 Área *
                                    </Form.Label>
                                    <Form.Select
                                        value={idArea}
                                        onChange={(e) => setIdArea(Number(e.target.value))}
                                        style={{
                                            borderRadius: '8px',
                                            border: isDark ? '1px solid #404040' : '1px solid #d1d5db',
                                            backgroundColor: isDark ? '#374151' : '#ffffff',
                                            color: isDark ? '#ffffff' : '#000000',
                                            padding: '10px 12px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value={0}>Todas las áreas</option>
                                        {filteredAreas.map(area => (
                                            <option key={area.id_area} value={area.id_area}>
                                                {area.descripcion}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col xs={12} md={4} className="mb-3">
                                    <Button
                                        variant="primary"
                                        onClick={handleReload}
                                        disabled={isReloading}
                                        className="w-100 d-flex align-items-center justify-content-center"
                                        style={{
                                            borderRadius: '8px',
                                            padding: '10px 16px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            border: 'none',
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                            color: '#ffffff',
                                            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <FaSearch className="me-2" />
                                        <span>{isReloading ? 'Cargando...' : 'Buscar Configuraciones'}</span>
                                    </Button>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <div className="d-flex align-items-center justify-content-between mb-1">
                                <div className="d-flex align-items-center">
                                    <h4 className="header-title mb-0 me-2">Período Área Proceso</h4>
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
                            <p className="text-muted">Gestión de configuraciones período-área-proceso</p>

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
                                            <Form.Label className="small text-muted mb-1">ID Config</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="id_configuracion"
                                                placeholder="Filtrar por ID Config"
                                                value={columnFilters.id_configuracion}
                                                onChange={handleColumnFilterChange}
                                                size="sm"
                                                style={{ borderRadius: '6px' }}
                                            />
                                        </Col>
                                        <Col xs={12} md={4} className="mb-2">
                                            <Form.Label className="small text-muted mb-1">ID Proceso</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="id_proceso"
                                                placeholder="Filtrar por ID Proceso"
                                                value={columnFilters.id_proceso}
                                                onChange={handleColumnFilterChange}
                                                size="sm"
                                                style={{ borderRadius: '6px' }}
                                            />
                                        </Col>
                                        <Col xs={12} md={4} className="mb-2">
                                            <Form.Label className="small text-muted mb-1">Descripción</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="descripcion_proceso"
                                                placeholder="Filtrar por Descripción"
                                                value={columnFilters.descripcion_proceso}
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
                                    data={filteredPeriodoAreaProcesos}
                                    keyField="id_configuracion"
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
                                                borderBottom: isDark ? '1px solid #404040' : '1px solid #f1f5f9',
                                                color: isDark ? '#ffffff' : '#000000',
                                                fontSize: '14px',
                                                '&:hover': {
                                                    backgroundColor: isDark ? '#2d2d2d' : '#f8f9fa',
                                                    transform: 'scale(1.01)',
                                                    boxShadow: isDark 
                                                        ? '0 4px 8px rgba(0, 0, 0, 0.3)' 
                                                        : '0 4px 8px rgba(0, 0, 0, 0.1)',
                                                },
                                                minHeight: '60px',
                                                paddingTop: '12px',
                                                paddingBottom: '12px',
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
                                                color: isDark ? '#ffffff' : '#000000',
                                                borderTop: isDark ? '1px solid #404040' : '1px solid #dee2e6',
                                                borderBottomLeftRadius: '12px',
                                                borderBottomRightRadius: '12px',
                                                minHeight: '56px'
                                            },
                                        },
                                    }}
                                    noDataComponent={
                                        <div className="text-center py-5">
                                            <div style={{
                                                fontSize: '48px',
                                                color: isDark ? '#6b7280' : '#9ca3af',
                                                marginBottom: '16px'
                                            }}>
                                                {!hasSearched ? '🔍' : (idPeriodo === 0 || idArea === 0) ? '🔍' : '⚙️'}
                                            </div>
                                            <h6 style={{
                                                color: isDark ? '#9ca3af' : '#6b7280',
                                                marginBottom: '8px',
                                                fontWeight: '500'
                                            }}>
                                                {!hasSearched 
                                                    ? 'Busca configuraciones para mostrar resultados'
                                                    : (idPeriodo === 0 || idArea === 0) 
                                                        ? 'Selecciona filtros para ver configuraciones'
                                                        : 'No hay configuraciones disponibles'
                                                }
                                            </h6>
                                            <p style={{
                                                color: isDark ? '#6b7280' : '#9ca3af',
                                                fontSize: '14px',
                                                marginBottom: '0'
                                            }}>
                                                {!hasSearched
                                                    ? 'Selecciona un período y área, luego presiona "Buscar Configuraciones" para ver los datos'
                                                    : (idPeriodo === 0 || idArea === 0)
                                                        ? 'Por favor selecciona un período y área para visualizar las configuraciones existentes'
                                                        : 'Selecciona un período y área, luego presiona crear para agregar configuraciones'
                                                }
                                            </p>
                                        </div>
                                    }
                                />
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Drawer for Create/Edit */}
            <Drawer
                open={showDrawer}
                onClose={() => setShowDrawer(false)}
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
                                            ➕
                                        </div>
                                        <h3 style={{ 
                                            margin: 0, 
                                            fontWeight: '700',
                                            fontSize: '24px',
                                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                                        }}>
                                            Crear Configuración
                                        </h3>
                                    </div>
                                    <p style={{ 
                                        margin: 0, 
                                        fontSize: '14px',
                                        opacity: 0.9,
                                        fontWeight: '400'
                                    }}>
                                        Complete la información de la nueva configuración
                                    </p>
                                </div>
                                <Button
                                    variant="outline-light"
                                    size="sm"
                                    onClick={() => setShowDrawer(false)}
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
                            <span style={{ opacity: 0.7 }}>📍 Documentación</span>
                            <span style={{ margin: '0 8px', opacity: 0.5 }}>→</span>
                            <span style={{ opacity: 0.7 }}>Período Área Proceso</span>
                            <span style={{ margin: '0 8px', opacity: 0.5 }}>→</span>
                            <span style={{ color: isDark ? '#60a5fa' : '#1d4ed8' }}>
                                Crear
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
                        {(periodoAreaProcesoSeleccionado || !isEdit) && (
                            <Form>
                                <Row>
                                    <Col xs={12}>
                                        <Form.Group className="mb-4">
                                            <Form.Label style={{
                                                fontWeight: '600',
                                                color: isDark ? '#e5e7eb' : '#374151',
                                                fontSize: '14px',
                                                marginBottom: '8px'
                                            }}>
                                                Proceso *
                                            </Form.Label>
                                            <Form.Select
                                                ref={idProcesoRef}
                                                value={periodoAreaProcesoSeleccionado?.id_proceso || 0}
                                                onChange={(e) => setPeriodoAreaProcesoSeleccionado({
                                                    ...periodoAreaProcesoSeleccionado,
                                                    id_proceso: Number(e.target.value)
                                                })}
                                                style={{
                                                    borderRadius: '8px',
                                                    border: isDark ? '1px solid #404040' : '1px solid #d1d5db',
                                                    backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
                                                    color: isDark ? '#ffffff' : '#000000',
                                                    padding: '12px 16px',
                                                    fontSize: '14px',
                                                    transition: 'all 0.2s ease',
                                                    ...(formErrors.id_proceso && {
                                                        borderColor: '#ef4444',
                                                        boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)'
                                                    })
                                                }}
                                            >
                                                <option value={0}>Seleccionar proceso</option>
                                                {procesos.map(proceso => (
                                                    <option key={proceso.id_proceso} value={proceso.id_proceso}>
                                                        {proceso.descripcion}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                            {formErrors.id_proceso && (
                                                <div style={{
                                                    color: '#ef4444',
                                                    fontSize: '13px',
                                                    marginTop: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    ⚠️ {formErrors.id_proceso}
                                                </div>
                                            )}
                                        </Form.Group>
                                    </Col>

                                    {/* Display selected periodo and area as read-only info */}
                                    <Col xs={12}>
                                        <div style={{
                                            backgroundColor: isDark ? '#2d2d2d' : '#f8f9fa',
                                            border: isDark ? '1px solid #404040' : '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            padding: '16px',
                                            marginBottom: '16px'
                                        }}>
                                            <h6 style={{
                                                color: isDark ? '#e5e7eb' : '#374151',
                                                marginBottom: '12px',
                                                fontSize: '14px',
                                                fontWeight: '600'
                                            }}>
                                                📍 Información de Contexto
                                            </h6>
                                            <div style={{ display: 'grid', gap: '8px' }}>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <span style={{
                                                        color: isDark ? '#9ca3af' : '#6b7280',
                                                        fontSize: '13px'
                                                    }}>
                                                        📅 Período:
                                                    </span>
                                                    <span style={{
                                                        color: isDark ? '#f3f4f6' : '#1f2937',
                                                        fontSize: '13px',
                                                        fontWeight: '500'
                                                    }}>
                                                        {periodos.find(p => p.id_periodo === periodoAreaProcesoSeleccionado?.id_periodo || idPeriodo)?.label || 'N/A'}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <span style={{
                                                        color: isDark ? '#9ca3af' : '#6b7280',
                                                        fontSize: '13px'
                                                    }}>
                                                        🏢 Área:
                                                    </span>
                                                    <span style={{
                                                        color: isDark ? '#f3f4f6' : '#1f2937',
                                                        fontSize: '13px',
                                                        fontWeight: '500'
                                                    }}>
                                                        {areas.find(a => a.id_area === periodoAreaProcesoSeleccionado?.id_area || idArea)?.descripcion || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
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
                                onClick={handleSave}
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
                                💾 Guardar
                            </Button>
                            <Button
                                variant="outline-secondary"
                                type="button"
                                className="flex-fill"
                                onClick={() => setShowDrawer(false)}
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
        </>
    )
}

export default PeriodoAreaProcesoPage
