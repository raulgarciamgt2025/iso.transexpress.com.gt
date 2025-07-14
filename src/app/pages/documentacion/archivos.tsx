import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Row, Spinner, Button, Form, Modal } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { fetchArchivos, fetchPeriodosActivos, Archivo, ArchivosRequest } from '@/servicios/documentacion/archivosProvider'
import { BiRefresh, BiFile, BiDownload } from 'react-icons/bi'
import { FaSearch } from 'react-icons/fa'
import { useAuthContext } from '@/context/useAuthContext'
import DataTable from 'react-data-table-component'
import { useLayoutContext } from '@/context/useLayoutContext'
import Swal from 'sweetalert2'

// Add CSS for spin animation
const spinKeyframes = `
@k                            <Form.Control
                                type="file"
                                onChange={handleFileSelect}
                                accept=".doc,.docx,.xls,.xlsx"
                                style={{
                                    backgroundColor: isDark ? '#374151' : '#ffffff',
                                    borderColor: isDark ? '#404040' : '#ced4da',
                                    color: isDark ? '#ffffff' : '#000000'
                                }}
                            />
                            <Form.Text className="text-muted">
                                Formatos permitidos: DOC, DOCX, XLS, XLSX
                            </Form.Text> {
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

const ArchivosPage = () => {
    const { theme } = useLayoutContext()
    const isDark = theme === 'dark'
    const [archivos, setArchivos] = useState<Archivo[]>([])
    const [periodos, setPeriodos] = useState<any[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [isReloading, setIsReloading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [idPeriodo, setIdPeriodo] = useState(0)
    const [hasSearched, setHasSearched] = useState(false)
    const { user } = useAuthContext()
    const { token, id_empresa, id } = user || {}
    const [search, setSearch] = useState('')
    const [columnFilters, setColumnFilters] = useState({
        id_documento: '',
        area: '',
        proceso: '',
        documento: '',
        estado: '',
    })
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [selectedArchivo, setSelectedArchivo] = useState<Archivo | null>(null)
    const [uploadFile, setUploadFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [showFinalizarModal, setShowFinalizarModal] = useState(false)
    const [finalizarFile, setFinalizarFile] = useState<File | null>(null)
    const [selectedFinalizarArchivo, setSelectedFinalizarArchivo] = useState<Archivo | null>(null)

    const handleColumnFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setColumnFilters(prev => ({ ...prev, [name]: value }));
    };

    // Enhanced filtered data
    const filteredArchivos = archivos.filter((item) => {
        const s = search.toLowerCase();
        const globalMatch = (
            String(item.id_documento).toLowerCase().includes(s) ||
            String(item.area).toLowerCase().includes(s) ||
            String(item.proceso).toLowerCase().includes(s) ||
            String(item.documento).toLowerCase().includes(s) ||
            String(item.estado).toLowerCase().includes(s)
        );

        const columnMatch = (
            String(item.id_documento).toLowerCase().includes(columnFilters.id_documento.toLowerCase()) &&
            String(item.area).toLowerCase().includes(columnFilters.area.toLowerCase()) &&
            String(item.proceso).toLowerCase().includes(columnFilters.proceso.toLowerCase()) &&
            String(item.documento).toLowerCase().includes(columnFilters.documento.toLowerCase()) &&
            String(item.estado).toLowerCase().includes(columnFilters.estado.toLowerCase())
        );

        return globalMatch && columnMatch;
    });

    const columns = [
        {
            name: 'ID Documento',
            selector: (row: Archivo) => row.id_documento,
            sortable: true,
            width: '120px',
            cell: (row: Archivo) => (
                <div style={{ 
                    backgroundColor: isDark ? '#374151' : '#e0f2fe',
                    color: isDark ? '#ffffff' : '#0277bd',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textAlign: 'center'
                }}>
                    {row.id_documento}
                </div>
            )
        },
        {
            name: 'Área',
            selector: (row: Archivo) => row.area,
            sortable: true,
            width: '150px',
            cell: (row: Archivo) => (
                <div style={{ 
                    fontWeight: '500',
                    color: isDark ? '#f3f4f6' : '#1f2937'
                }}>
                    {row.area}
                </div>
            )
        },
        {
            name: 'Proceso',
            selector: (row: Archivo) => row.proceso,
            sortable: true,
            width: '150px',
            cell: (row: Archivo) => (
                <div style={{ 
                    fontWeight: '500',
                    color: isDark ? '#f3f4f6' : '#1f2937'
                }}>
                    {row.proceso}
                </div>
            )
        },
        {
            name: 'Documento',
            selector: (row: Archivo) => row.documento,
            sortable: true,
            cell: (row: Archivo) => (
                <div style={{ 
                    fontWeight: '500',
                    color: isDark ? '#f3f4f6' : '#1f2937'
                }}>
                    {row.documento}
                </div>
            )
        },
        {
            name: 'Estado',
            selector: (row: Archivo) => row.estado,
            sortable: true,
            width: '120px',
            cell: (row: Archivo) => {
                const getEstadoColor = (estado: string) => {
                    switch (estado.toLowerCase()) {
                        case 'editable': return { bg: isDark ? '#b45309' : '#fef3c7', color: isDark ? '#fbbf24' : '#d97706', text: 'Editable' };
                        case 'finalizado': return { bg: isDark ? '#065f46' : '#f0fdf4', color: isDark ? '#34d399' : '#16a34a', text: 'Finalizado' };
                        default: return { bg: isDark ? '#374151' : '#f3f4f6', color: isDark ? '#9ca3af' : '#6b7280', text: estado };
                    }
                };
                
                const estadoStyle = getEstadoColor(row.estado);
                
                return (
                    <div style={{ 
                        backgroundColor: estadoStyle.bg,
                        color: estadoStyle.color,
                        padding: '4px 8px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textAlign: 'center'
                    }}>
                        {estadoStyle.text}
                    </div>
                );
            }
        },
        {
            name: 'Acciones',
            cell: (item: Archivo) => (
                <div className="d-flex gap-1">
                    {item.estado.toLowerCase() === 'finalizado' ? (
                        <>
                            {/* Buttons for Finalizado status */}
                            {item.archivo_final && item.ruta_final && (
                                <Button
                                    size="sm"
                                    className="d-flex align-items-center"
                                    onClick={() => handleDownloadFinalFile(item)}
                                    style={{
                                        backgroundColor: '#198754',
                                        borderColor: '#198754',
                                        color: '#ffffff',
                                        borderRadius: '6px',
                                        padding: '6px 8px',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        marginRight: '4px',
                                        border: '1px solid #198754',
                                        whiteSpace: 'nowrap',
                                        minWidth: 'auto'
                                    }}
                                >
                                    <BiDownload size={14} className="me-1" />
                                    Descargar Final
                                </Button>
                            )}
                            <Button
                                size="sm"
                                className="d-flex align-items-center"
                                onClick={() => handleArchivarFile(item)}
                                style={{
                                    backgroundColor: '#dc3545',
                                    borderColor: '#dc3545',
                                    color: '#ffffff',
                                    borderRadius: '6px',
                                    padding: '6px 8px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    border: '1px solid #dc3545',
                                    whiteSpace: 'nowrap',
                                    minWidth: 'auto'
                                }}
                            >
                                <BiFile size={14} className="me-1" />
                                Archivar(Obsoleto)
                            </Button>
                        </>
                    ) : (
                        <>
                            {/* Buttons for non-Finalizado status */}
                            {item.archivo && item.ruta && (
                                <Button
                                    size="sm"
                                    className="d-flex align-items-center"
                                    onClick={() => handleDownloadFile(item)}
                                    style={{
                                        backgroundColor: '#198754',
                                        borderColor: '#198754',
                                        color: '#ffffff',
                                        borderRadius: '6px',
                                        padding: '6px 8px',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        marginRight: '4px',
                                        border: '1px solid #198754',
                                        whiteSpace: 'nowrap',
                                        minWidth: 'auto'
                                    }}
                                >
                                    <BiDownload size={14} className="me-1" />
                                    Descargar
                                </Button>
                            )}
                            {item.estado.toLowerCase() === 'editable' && (
                                <Button
                                    size="sm"
                                    className="d-flex align-items-center"
                                    onClick={() => handleUploadFile(item)}
                                    style={{
                                        backgroundColor: '#0dcaf0',
                                        borderColor: '#0dcaf0',
                                        color: '#ffffff',
                                        borderRadius: '6px',
                                        padding: '6px 8px',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        border: '1px solid #0dcaf0',
                                        whiteSpace: 'nowrap',
                                        minWidth: 'auto'
                                    }}
                                >
                                    <BiFile size={14} className="me-1" />
                                    Subir
                                </Button>
                            )}
                            {item.archivo && item.ruta && (
                                <Button
                                    size="sm"
                                    className="d-flex align-items-center"
                                    onClick={() => handleFinalizarFile(item)}
                                    style={{
                                        backgroundColor: '#6f42c1',
                                        borderColor: '#6f42c1',
                                        color: '#ffffff',
                                        borderRadius: '6px',
                                        padding: '6px 8px',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        border: '1px solid #6f42c1',
                                        whiteSpace: 'nowrap',
                                        minWidth: 'auto'
                                    }}
                                >
                                    <BiFile size={14} className="me-1" />
                                    Finalizar
                                </Button>
                            )}
                        </>
                    )}
                </div>
            ),
            width: '320px',
            ignoreRowClick: true
        }
    ];

    useEffect(() => {
        if (token && id_empresa) {
            loadPeriodos()
        }
    }, [token, id_empresa])

    const loadPeriodos = async () => {
        setLoading(true)
        try {
            const periodosData = await fetchPeriodosActivos(token, Number(id_empresa))
            setPeriodos(periodosData)
        } catch (error) {
            console.error('Error loading periodos:', error)
            setError('Error al cargar los períodos')
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async () => {
        if (idPeriodo === 0) {
            setError('Por favor seleccione un período')
            return
        }

        setIsReloading(true)
        setError(null)
        
        try {
            const id_usuario_editor = Number(id || sessionStorage.getItem("id_usuario") || "0")
            
            const request: ArchivosRequest = {
                id_empresa: Number(id_empresa),
                id_periodo: idPeriodo,
                id_usuario_editor: id_usuario_editor
            }
            
            const archivosData = await fetchArchivos(request, token)
            setArchivos(archivosData)
            setHasSearched(true)
        } catch (error) {
            console.error('Error loading archivos:', error)
            setError('Error al cargar los archivos')
        } finally {
            setTimeout(() => setIsReloading(false), 500)
        }
    }

    const handleUploadFile = (archivo: Archivo) => {
        setSelectedArchivo(archivo)
        setShowUploadModal(true)
    }

    const handleDownloadFile = (archivo: Archivo) => {
        if (archivo.archivo && archivo.ruta) {
            const downloadUrl = `https://iso.transexpress.com.gt/documentos/${archivo.ruta}/${archivo.archivo}`
            window.open(downloadUrl, '_blank')
        }
    }

    const handleDownloadFinalFile = (archivo: Archivo) => {
        if (archivo.archivo_final && archivo.ruta_final) {
            const downloadUrl = `https://iso.transexpress.com.gt/documentos/${archivo.ruta_final}/${archivo.archivo_final}`
            window.open(downloadUrl, '_blank')
        }
    }

    const handleArchivarFile = (archivo: Archivo) => {
        Swal.fire({
            title: '¿Archivar documento?',
            text: `¿Está seguro que desea archivar el documento "${archivo.documento}"? Esta acción marcará el documento como obsoleto.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, archivar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Show loading state
                    Swal.fire({
                        title: 'Archivando documento...',
                        text: 'Por favor espere mientras se procesa la solicitud',
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading()
                        }
                    })

                    // Get id_usuario from session storage or user context
                    const id_usuario_archivo = id || sessionStorage.getItem("id_usuario") || "0"
                    
                    console.log('Archive params:', {
                        id_documento: archivo.id_documento,
                        id_usuario_archivo: id_usuario_archivo
                    })
                    
                    // Prepare API request for archive
                    const formData = new FormData()
                    formData.append('id_documento', archivo.id_documento.toString())
                    formData.append('id_usuario_archivo', id_usuario_archivo)

                    // Call the archive API endpoint
                    const response = await fetch('https://iso.transexpress.com.gt/webservice/api/documentos/archive', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                        body: formData
                    })

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`)
                    }

                    const result = await response.json()
                    
                    // Show success message
                    Swal.fire({
                        icon: 'success',
                        title: 'Éxito',
                        text: 'El documento ha sido archivado correctamente',
                        timer: 2000,
                        showConfirmButton: false
                    })

                    // Reload the datatable data
                    await handleSearch()

                } catch (error) {
                    console.error('Error archiving document:', error)
                    
                    // Show error message
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error al archivar el documento. Por favor intente nuevamente.',
                    })
                }
            }
        })
    }

    const handleFinalizarFile = (archivo: Archivo) => {
        setSelectedFinalizarArchivo(archivo)
        setShowFinalizarModal(true)
    }

    const handleFinalizarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFinalizarFile(file)
        }
    }

    const handleFinalizarUpload = async () => {
        if (!finalizarFile || !selectedFinalizarArchivo) return

        setIsUploading(true)

        try {
            // Show loading state
            Swal.fire({
                title: 'Finalizando documento...',
                text: 'Por favor espere mientras se procesa el archivo PDF',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading()
                }
            })

            // Convert file to base64
            const base64String = await convertFileToBase64(finalizarFile)
            
            // Get id_usuario from session storage or user context
            const id_usuario_cargo_archivo_final = id || sessionStorage.getItem("id_usuario") || "0"
            
            console.log('Finalizar params:', {
                id_documento: selectedFinalizarArchivo.id_documento,
                id_usuario_cargo_archivo_final: id_usuario_cargo_archivo_final,
                fileSize: finalizarFile.size,
                fileName: finalizarFile.name
            })
            
            // Prepare API request for finalizar
            const formData = new FormData()
            formData.append('base64_string', base64String)
            formData.append('id_documento', selectedFinalizarArchivo.id_documento.toString())
            formData.append('id_usuario_cargo_archivo_final', id_usuario_cargo_archivo_final)

            // Call the correct finalizar API endpoint
            const response = await fetch('https://iso.transexpress.com.gt/webservice/api/documentos/save-image-final', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()
            
            // Close modal and reset state
            setShowFinalizarModal(false)
            setFinalizarFile(null)
            setSelectedFinalizarArchivo(null)
            
            // Show success message
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Documento finalizado correctamente',
                timer: 2000,
                showConfirmButton: false
            })

            // Reload the datatable data
            await handleSearch()

        } catch (error) {
            console.error('Error finalizing document:', error)
            
            // Show error message
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al finalizar el documento. Por favor intente nuevamente.',
            })
        } finally {
            setIsUploading(false)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setUploadFile(file)
        }
    }

    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => {
                const result = reader.result as string
                // Remove the data:image/jpeg;base64, or data:application/...;base64, prefix
                const base64String = result.split(',')[1]
                resolve(base64String)
            }
            reader.onerror = error => reject(error)
        })
    }

    const handleFileUpload = async () => {
        if (!uploadFile || !selectedArchivo) return

        setIsUploading(true)

        try {
            // Show loading state
            Swal.fire({
                title: 'Subiendo archivo...',
                text: 'Por favor espere mientras se procesa el archivo',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading()
                }
            })

            // Convert file to base64
            const base64String = await convertFileToBase64(uploadFile)
            
            // Get id_usuario from session storage or user context
            const id_usuario_cargo = id || sessionStorage.getItem("id_usuario") || "0"
            
            console.log('Upload params:', {
                id_documento: selectedArchivo.id_documento,
                id_usuario_cargo: id_usuario_cargo,
                fileSize: uploadFile.size,
                fileName: uploadFile.name
            })
            
            // Prepare API request
            const formData = new FormData()
            formData.append('base64_string', base64String)
            formData.append('id_documento', selectedArchivo.id_documento.toString())
            formData.append('id_usuario_cargo', id_usuario_cargo)

            // Call the API
            const response = await fetch('https://iso.transexpress.com.gt/webservice/api/documentos/save-image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()
            
            // Close modal and reset state
            setShowUploadModal(false)
            setUploadFile(null)
            setSelectedArchivo(null)
            
            // Show success message
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Archivo subido correctamente',
                timer: 2000,
                showConfirmButton: false
            })

            // Reload the datatable data
            await handleSearch()

        } catch (error) {
            console.error('Error uploading file:', error)
            
            // Show error message
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al subir el archivo. Por favor intente nuevamente.',
            })
        } finally {
            setIsUploading(false)
        }
    }

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
            <PageTitle title="Gestión de Archivos" />

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
                                <Col xs={12} md={6} className="mb-3">
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
                                        <option value={0}>Seleccione un período</option>
                                        {periodos.map(periodo => (
                                            <option key={periodo.id_periodo} value={periodo.id_periodo}>
                                                {periodo.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col xs={12} md={6} className="mb-3">
                                    <Button
                                        variant="primary"
                                        onClick={handleSearch}
                                        disabled={isReloading || idPeriodo === 0}
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
                                        <span>{isReloading ? 'Cargando...' : 'Buscar Archivos'}</span>
                                    </Button>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <div className="d-flex align-items-center justify-content-between mb-1">
                                <div className="d-flex align-items-center">
                                    <h4 className="header-title mb-0 me-2">Gestión de Archivos</h4>
                                    <Button 
                                        variant="outline-secondary" 
                                        size="sm" 
                                        onClick={handleSearch}
                                        disabled={isReloading || idPeriodo === 0}
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
                            <p className="text-muted">Gestión y consulta de archivos de documentos</p>

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
                                            <Form.Label className="small text-muted mb-1">ID Documento</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="id_documento"
                                                placeholder="Filtrar por ID"
                                                value={columnFilters.id_documento}
                                                onChange={handleColumnFilterChange}
                                                size="sm"
                                                style={{ borderRadius: '6px' }}
                                            />
                                        </Col>
                                        <Col xs={12} md={2} className="mb-2">
                                            <Form.Label className="small text-muted mb-1">Área</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="area"
                                                placeholder="Filtrar por área"
                                                value={columnFilters.area}
                                                onChange={handleColumnFilterChange}
                                                size="sm"
                                                style={{ borderRadius: '6px' }}
                                            />
                                        </Col>
                                        <Col xs={12} md={3} className="mb-2">
                                            <Form.Label className="small text-muted mb-1">Proceso</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="proceso"
                                                placeholder="Filtrar por proceso"
                                                value={columnFilters.proceso}
                                                onChange={handleColumnFilterChange}
                                                size="sm"
                                                style={{ borderRadius: '6px' }}
                                            />
                                        </Col>
                                        <Col xs={12} md={3} className="mb-2">
                                            <Form.Label className="small text-muted mb-1">Documento</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="documento"
                                                placeholder="Filtrar por documento"
                                                value={columnFilters.documento}
                                                onChange={handleColumnFilterChange}
                                                size="sm"
                                                style={{ borderRadius: '6px' }}
                                            />
                                        </Col>
                                        <Col xs={12} md={2} className="mb-2">
                                            <Form.Label className="small text-muted mb-1">Estado</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="estado"
                                                placeholder="Filtrar por estado"
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
                                    data={filteredArchivos}
                                    keyField="id_documento"
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
                                                {!hasSearched ? '🔍' : '📄'}
                                            </div>
                                            <h6 style={{
                                                color: isDark ? '#9ca3af' : '#6b7280',
                                                marginBottom: '8px',
                                                fontWeight: '500'
                                            }}>
                                                {!hasSearched 
                                                    ? 'Seleccione un período y busque archivos'
                                                    : 'No hay archivos disponibles'
                                                }
                                            </h6>
                                            <p style={{
                                                color: isDark ? '#6b7280' : '#9ca3af',
                                                fontSize: '14px',
                                                marginBottom: '0'
                                            }}>
                                                {!hasSearched
                                                    ? 'Seleccione un período activo y presione "Buscar Archivos" para ver los documentos disponibles'
                                                    : 'No se encontraron archivos para el período seleccionado'
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

            {/* Upload File Modal */}
            <Modal show={showUploadModal} onHide={() => !isUploading && setShowUploadModal(false)} centered>
                <Modal.Header closeButton={!isUploading} style={{ 
                    backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
                    borderBottom: isDark ? '1px solid #404040' : '1px solid #dee2e6'
                }}>
                    <Modal.Title style={{ color: isDark ? '#ffffff' : '#000000' }}>
                        Subir Archivo - {selectedArchivo?.documento}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ 
                    backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
                    color: isDark ? '#ffffff' : '#000000'
                }}>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Seleccionar archivo</Form.Label>
                            <Form.Control
                                type="file"
                                onChange={handleFileSelect}
                                accept=".doc,.docx,.xls,.xlsx"
                                style={{
                                    backgroundColor: isDark ? '#374151' : '#ffffff',
                                    borderColor: isDark ? '#404040' : '#ced4da',
                                    color: isDark ? '#ffffff' : '#000000'
                                }}
                            />
                            <Form.Text className="text-muted">
                                Formatos permitidos: DOC, DOCX, XLS, XLSX (Solo Word y Excel)
                            </Form.Text>
                        </Form.Group>
                        
                        {uploadFile && (
                            <div className="alert alert-info">
                                <strong>Archivo seleccionado:</strong> {uploadFile.name}
                                <br />
                                <strong>Tamaño:</strong> {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer style={{ 
                    backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
                    borderTop: isDark ? '1px solid #404040' : '1px solid #dee2e6'
                }}>
                    <Button 
                        variant="secondary" 
                        onClick={() => {
                            setShowUploadModal(false)
                            setUploadFile(null)
                            setSelectedArchivo(null)
                            setIsUploading(false)
                        }}
                        disabled={isUploading}
                        style={{
                            backgroundColor: isDark ? '#6b7280' : '#6c757d',
                            borderColor: isDark ? '#6b7280' : '#6c757d'
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleFileUpload}
                        disabled={!uploadFile || isUploading}
                        style={{
                            backgroundColor: '#0d6efd',
                            borderColor: '#0d6efd'
                        }}
                    >
                        {isUploading ? 'Subiendo...' : 'Subir Archivo'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Finalizar File Modal */}
            <Modal show={showFinalizarModal} onHide={() => !isUploading && setShowFinalizarModal(false)} centered>
                <Modal.Header closeButton={!isUploading} style={{ 
                    backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
                    borderBottom: isDark ? '1px solid #404040' : '1px solid #dee2e6'
                }}>
                    <Modal.Title style={{ color: isDark ? '#ffffff' : '#000000' }}>
                        Finalizar Documento - {selectedFinalizarArchivo?.documento}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ 
                    backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
                    color: isDark ? '#ffffff' : '#000000'
                }}>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Seleccionar archivo PDF final</Form.Label>
                            <Form.Control
                                type="file"
                                onChange={handleFinalizarFileSelect}
                                accept=".pdf"
                                style={{
                                    backgroundColor: isDark ? '#374151' : '#ffffff',
                                    borderColor: isDark ? '#404040' : '#ced4da',
                                    color: isDark ? '#ffffff' : '#000000'
                                }}
                            />
                            <Form.Text className="text-muted">
                                Solo se permiten archivos PDF para finalizar el documento
                            </Form.Text>
                        </Form.Group>
                        
                        {finalizarFile && (
                            <div className="alert alert-info">
                                <strong>Archivo seleccionado:</strong> {finalizarFile.name}
                                <br />
                                <strong>Tamaño:</strong> {(finalizarFile.size / 1024 / 1024).toFixed(2)} MB
                                <br />
                                <strong>Tipo:</strong> {finalizarFile.type}
                            </div>
                        )}
                        
                        <div className="alert alert-warning">
                            <strong>⚠️ Importante:</strong> Al finalizar este documento con un archivo PDF, 
                            el proceso será completado y el documento quedará en su estado final.
                        </div>
                    </Form>
                </Modal.Body>
                <Modal.Footer style={{ 
                    backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
                    borderTop: isDark ? '1px solid #404040' : '1px solid #dee2e6'
                }}>
                    <Button 
                        variant="secondary" 
                        onClick={() => {
                            setShowFinalizarModal(false)
                            setFinalizarFile(null)
                            setSelectedFinalizarArchivo(null)
                        }}
                        disabled={isUploading}
                        style={{
                            backgroundColor: isDark ? '#6b7280' : '#6c757d',
                            borderColor: isDark ? '#6b7280' : '#6c757d'
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleFinalizarUpload}
                        disabled={!finalizarFile || isUploading}
                        style={{
                            backgroundColor: '#6f42c1',
                            borderColor: '#6f42c1'
                        }}
                    >
                        {isUploading ? 'Finalizando...' : 'Finalizar Documento'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default ArchivosPage
