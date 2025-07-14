import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Row, Table, Spinner, Button, Form, Modal } from 'react-bootstrap'
import { useEffect, useState, useRef } from 'react'
import { fetchPeriodoAreaProceso, fetchPeriodoAreaProcesoById, createPeriodoAreaProceso, updatePeriodoAreaProceso, deletePeriodoAreaProceso, PeriodoAreaProceso } from '@/servicios/documentacion/periodoareaprocesoProvider'
import { fetchPeriodo, Periodo } from '@/servicios/documentacion/periodoProvider'
import { fetchArea, Area } from '@/servicios/documentacion/areaProvider'
import { fetchProceso, Proceso } from '@/servicios/documentacion/procesoProvider'
import { fetchDocumentosPorConfiguracion, fetchUsuarios, createDocumentoConfiguracion, updateDocumentoConfiguracion, deleteDocumentoConfiguracion, DocumentoConfiguracion, Usuario } from '@/servicios/documentacion/documentoConfiguracionProvider'
import Swal from 'sweetalert2'
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import { BiEdit, BiPlus, BiTrash, BiRefresh, BiFile } from 'react-icons/bi'
import { FaSearch } from 'react-icons/fa'
import { useFormContext } from "@/utils/formContext.jsx";
import { useAuthContext } from '@/context/useAuthContext'
import DataTable from 'react-data-table-component'
import { useLayoutContext } from '@/context/useLayoutContext'

// Add CSS for spin animation and modal layering
const spinKeyframes = `
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.spin {
  animation: spin 1s linear infinite;
}

.document-form-backdrop {
  z-index: 10040 !important;
}

.modal-backdrop.document-form-backdrop {
  z-index: 10040 !important;
  background-color: rgba(0, 0, 0, 0.6);
}

/* Fix for modal focus management */
.modal[aria-hidden="true"] {
  display: none !important;
}

.modal[aria-hidden="false"] {
  display: block !important;
}

/* Ensure proper focus management */
.modal.fade:not(.show) {
  display: none !important;
}

/* Force button visibility */
.btn-documentos {
  display: inline-flex !important;
  visibility: visible !important;
  opacity: 1 !important;
  background-color: #0dcaf0 !important;
  color: #ffffff !important;
  border: none !important;
}

.btn-documentos:hover {
  background-color: #0aa2c0 !important;
  color: #ffffff !important;
}

/* Ensure action column buttons are visible */
.action-buttons-container {
  display: flex !important;
  gap: 0.25rem !important;
  align-items: center !important;
  justify-content: flex-start !important;
  min-width: 200px !important;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = spinKeyframes;
  document.head.appendChild(style);
}

// DocumentosComponent - New component for the modal
const DocumentosComponent = ({ selectedItem, periodos, areas, procesos, isDark, token }: {
    selectedItem: any;
    periodos: Periodo[];
    areas: Area[];
    procesos: Proceso[];
    isDark: boolean;
    token: string;
}) => {
    const [documentos, setDocumentos] = useState<DocumentoConfiguracion[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // CRUD States
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [editingDocument, setEditingDocument] = useState<DocumentoConfiguracion | null>(null);
    const [formData, setFormData] = useState({
        descripcion: '',
        estado: 'E',
        id_usuario_editor: 0,
        id_usuario_responsable: 0
    });
    const [saving, setSaving] = useState(false);

    const periodo = periodos.find(p => p.id_periodo === selectedItem?.id_periodo);
    const area = areas.find(a => a.id_area === selectedItem?.id_area);
    const proceso = procesos.find(p => p.id_proceso === selectedItem?.id_proceso);

    useEffect(() => {
        const loadDocumentos = async () => {
            if (!selectedItem?.id_configuracion) return;
            
            setLoading(true);
            try {
                const [documentosData, usuariosData] = await Promise.all([
                    fetchDocumentosPorConfiguracion(selectedItem.id_configuracion, token),
                    fetchUsuarios(token)
                ]);
                
                setDocumentos(documentosData);
                setUsuarios(usuariosData);
            } catch (error) {
                console.error('Error loading documentos:', error);
                setError('Error al cargar los documentos');
            } finally {
                setLoading(false);
            }
        };

        loadDocumentos();
    }, [selectedItem?.id_configuracion, token]);

    // Focus management for accessibility
    useEffect(() => {
        if (showDocumentModal) {
            // Small delay to ensure modal is rendered
            const timer = setTimeout(() => {
                const modal = document.getElementById('document-form-modal-title');
                if (modal) {
                    modal.focus();
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [showDocumentModal]);

    const getUserName = (userId: number) => {
        const user = usuarios.find(u => u.id === userId);
        return user ? user.name : 'N/A';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // CRUD Functions
    const handleCreateDocument = () => {
        setEditingDocument(null);
        setFormData({
            descripcion: '',
            estado: 'E',
            id_usuario_editor: Number(sessionStorage.getItem('id_usuario')) || 0,
            id_usuario_responsable: Number(sessionStorage.getItem('id_usuario')) || 0
        });
        setShowDocumentModal(true);
    };

    const handleEditDocument = (documento: DocumentoConfiguracion) => {
        setEditingDocument(documento);
        setFormData({
            descripcion: documento.descripcion,
            estado: documento.estado,
            id_usuario_editor: documento.id_usuario_editor,
            id_usuario_responsable: documento.id_usuario_responsable
        });
        setShowDocumentModal(true);
    };

    const handleDeleteDocument = async (documento: DocumentoConfiguracion) => {
        const result = await Swal.fire({
            title: '¿Eliminar documento?',
            text: `¿Está seguro de eliminar el documento "${documento.descripcion}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            background: isDark ? '#2d2d2d' : '#ffffff',
            color: isDark ? '#ffffff' : '#000000'
        });

        if (result.isConfirmed) {
            try {
                await deleteDocumentoConfiguracion(documento.id_documento, token);
                setDocumentos(documentos.filter(d => d.id_documento !== documento.id_documento));
                
                Swal.fire({
                    title: 'Eliminado',
                    text: 'El documento ha sido eliminado correctamente',
                    icon: 'success',
                    background: isDark ? '#2d2d2d' : '#ffffff',
                    color: isDark ? '#ffffff' : '#000000'
                });
            } catch (error) {
                console.error('Error deleting document:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo eliminar el documento',
                    icon: 'error',
                    background: isDark ? '#2d2d2d' : '#ffffff',
                    color: isDark ? '#ffffff' : '#000000'
                });
            }
        }
    };

    const handleSaveDocument = async () => {
        if (!formData.descripcion.trim()) {
            Swal.fire({
                title: 'Error',
                text: 'La descripción es requerida',
                icon: 'error',
                background: isDark ? '#2d2d2d' : '#ffffff',
                color: isDark ? '#ffffff' : '#000000'
            });
            return;
        }

        setSaving(true);
        try {
            const documentData = {
                ...formData,
                id_configuracion: selectedItem.id_configuracion,
                id_empresa: Number(sessionStorage.getItem('id_empresa')) || 1,
                id_usuario_grabo: Number(sessionStorage.getItem('id_usuario')) || 0
            };

            if (editingDocument) {
                // Update existing document
                await updateDocumentoConfiguracion(
                    editingDocument.id_documento,
                    documentData,
                    token
                );
                
                // Refresh the entire document list from server after update
                setLoading(true);
                const refreshedDocuments = await fetchDocumentosPorConfiguracion(selectedItem.id_configuracion, token);
                setDocumentos(refreshedDocuments);
                setLoading(false);
            } else {
                // Create new document
                await createDocumentoConfiguracion(documentData, token);
                
                // Refresh the entire document list from server after create
                setLoading(true);
                const refreshedDocuments = await fetchDocumentosPorConfiguracion(selectedItem.id_configuracion, token);
                setDocumentos(refreshedDocuments);
                setLoading(false);
            }

            setShowDocumentModal(false);
            Swal.fire({
                title: 'Éxito',
                text: `Documento ${editingDocument ? 'actualizado' : 'creado'} correctamente`,
                icon: 'success',
                background: isDark ? '#2d2d2d' : '#ffffff',
                color: isDark ? '#ffffff' : '#000000'
            });
        } catch (error) {
            console.error('Error saving document:', error);
            Swal.fire({
                title: 'Error',
                text: `No se pudo ${editingDocument ? 'actualizar' : 'crear'} el documento`,
                icon: 'error',
                background: isDark ? '#2d2d2d' : '#ffffff',
                color: isDark ? '#ffffff' : '#000000'
            });
        } finally {
            setSaving(false);
        }
    };

    const getEstadoLabel = (estado: string) => {
        switch (estado) {
            case 'E': return 'Elaborado';
            case 'R': return 'Revisado';
            case 'A': return 'Aprobado';
            default: return estado;
        }
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'E': return { bg: isDark ? '#065f46' : '#fef3c7', color: isDark ? '#34d399' : '#92400e' };
            case 'R': return { bg: isDark ? '#1e40af' : '#dbeafe', color: isDark ? '#60a5fa' : '#1e40af' };
            case 'A': return { bg: isDark ? '#15803d' : '#dcfce7', color: isDark ? '#4ade80' : '#15803d' };
            default: return { bg: isDark ? '#374151' : '#f3f4f6', color: isDark ? '#d1d5db' : '#6b7280' };
        }
    };

    const documentosColumns = [
        {
            name: 'ID',
            selector: (row: DocumentoConfiguracion) => row.id_documento,
            sortable: true,
            width: '80px',
            cell: (row: DocumentoConfiguracion) => (
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
            name: 'Descripción',
            selector: (row: DocumentoConfiguracion) => row.descripcion,
            sortable: true,
            cell: (row: DocumentoConfiguracion) => (
                <div style={{
                    fontWeight: '500',
                    color: isDark ? '#f3f4f6' : '#1f2937'
                }}>
                    {row.descripcion}
                </div>
            )
        },
        {
            name: 'Estado',
            selector: (row: DocumentoConfiguracion) => row.estado,
            sortable: true,
            width: '100px',
            cell: (row: DocumentoConfiguracion) => {
                const colors = getEstadoColor(row.estado);
                return (
                    <div style={{
                        backgroundColor: colors.bg,
                        color: colors.color,
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textAlign: 'center',
                        border: `1px solid ${colors.color}40`
                    }}>
                        {getEstadoLabel(row.estado)}
                    </div>
                );
            }
        },
        {
            name: 'Usuario Grabó',
            selector: (row: DocumentoConfiguracion) => getUserName(row.id_usuario_grabo),
            sortable: true,
            width: '150px'
        },
        {
            name: 'Usuario Editor',
            selector: (row: DocumentoConfiguracion) => getUserName(row.id_usuario_editor),
            sortable: true,
            width: '150px'
        },
        {
            name: 'Usuario Responsable',
            selector: (row: DocumentoConfiguracion) => getUserName(row.id_usuario_responsable),
            sortable: true,
            width: '150px'
        },
        {
            name: 'Fecha Grabación',
            selector: (row: DocumentoConfiguracion) => row.fecha_grabo,
            sortable: true,
            width: '140px',
            cell: (row: DocumentoConfiguracion) => (
                <div style={{
                    fontSize: '12px',
                    color: isDark ? '#d1d5db' : '#6b7280'
                }}>
                    {formatDate(row.fecha_grabo)}
                </div>
            )
        },
        {
            name: 'Acciones',
            width: '120px',
            cell: (row: DocumentoConfiguracion) => (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button
                        onClick={() => handleEditDocument(row)}
                        style={{
                            backgroundColor: isDark ? '#1e40af' : '#3b82f6',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDark ? '#1d4ed8' : '#2563eb';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = isDark ? '#1e40af' : '#3b82f6';
                        }}
                        title="Editar documento"
                    >
                        <BiEdit />
                    </button>
                    <button
                        onClick={() => handleDeleteDocument(row)}
                        style={{
                            backgroundColor: isDark ? '#dc2626' : '#ef4444',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDark ? '#b91c1c' : '#dc2626';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = isDark ? '#dc2626' : '#ef4444';
                        }}
                        title="Eliminar documento"
                    >
                        <BiTrash />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div style={{
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
            color: isDark ? '#ffffff' : '#000000',
            minHeight: '400px'
        }}>
            {/* Header with context information */}
            <div style={{
                background: `linear-gradient(135deg, ${isDark ? '#374151' : '#3b82f6'} 0%, ${isDark ? '#4b5563' : '#1d4ed8'} 100%)`,
                color: '#ffffff',
                padding: '24px',
                borderRadius: '8px',
                marginBottom: '24px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background decorative elements */}
                <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '80px',
                    height: '80px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                }}></div>
                <div style={{
                    position: 'absolute',
                    bottom: '-10px',
                    left: '-10px',
                    width: '50px',
                    height: '50px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '50%',
                }}></div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div className="d-flex align-items-center mb-3">
                        <div style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            padding: '8px',
                            marginRight: '12px',
                            fontSize: '20px'
                        }}>
                            📄
                        </div>
                        <h4 style={{
                            margin: 0,
                            fontWeight: '700',
                            fontSize: '24px',
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                        }}>
                            Documentos de Configuración #{selectedItem?.id_configuracion}
                        </h4>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                        marginTop: '16px'
                    }}>
                        <div style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            padding: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}>
                            <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>📅 Período</div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>
                                {periodo?.label || 'N/A'}
                            </div>
                        </div>

                        <div style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            padding: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}>
                            <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>🏢 Área</div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>
                                {area?.descripcion || 'N/A'}
                            </div>
                        </div>

                        <div style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            padding: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}>
                            <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>⚙️ Proceso</div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>
                                {proceso?.descripcion || 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Documents DataTable */}
            <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 style={{
                        margin: 0,
                        fontWeight: '600',
                        color: isDark ? '#e5e7eb' : '#374151'
                    }}>
                        📋 Lista de Documentos
                    </h5>
                    <div style={{
                        backgroundColor: isDark ? '#374151' : '#f3f4f6',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: isDark ? '#d1d5db' : '#6b7280'
                    }}>
                        {documentos.length} documento(s)
                    </div>
                </div>

                {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                        <Spinner animation="border" role="status" style={{ color: isDark ? '#60a5fa' : '#3b82f6' }}>
                            <span className="visually-hidden">Cargando...</span>
                        </Spinner>
                    </div>
                ) : error ? (
                    <div style={{
                        backgroundColor: isDark ? '#7f1d1d' : '#fee2e2',
                        border: isDark ? '1px solid #dc2626' : '1px solid #fecaca',
                        borderRadius: '8px',
                        padding: '16px',
                        textAlign: 'center',
                        color: isDark ? '#fca5a5' : '#dc2626'
                    }}>
                        ⚠️ {error}
                    </div>
                ) : (
                    <>
                        {/* Documents Header with Create Button */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px',
                            padding: '16px 20px',
                            backgroundColor: isDark ? '#2d2d2d' : '#f8f9fa',
                            borderRadius: '8px',
                            border: isDark ? '1px solid #404040' : '1px solid #e5e7eb'
                        }}>
                            <h5 style={{
                                margin: 0,
                                color: isDark ? '#ffffff' : '#1f2937',
                                fontWeight: '600'
                            }}>
                                Documentos de Configuración
                            </h5>
                            <button
                                onClick={handleCreateDocument}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    backgroundColor: isDark ? '#059669' : '#10b981',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '8px 16px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = isDark ? '#047857' : '#059669';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = isDark ? '#059669' : '#10b981';
                                }}
                            >
                                <BiPlus /> Nuevo Documento
                            </button>
                        </div>

                        {/* DataTable Container */}
                        <div style={{
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: isDark
                                ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
                                : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            border: isDark ? '1px solid #404040' : '1px solid #e5e7eb'
                        }}>
                            <DataTable
                            columns={documentosColumns}
                            data={documentos}
                            keyField="id_documento"
                            pagination
                            responsive
                            highlightOnHover
                            striped
                            paginationPerPage={5}
                            paginationRowsPerPageOptions={[5, 10, 15]}
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
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        paddingLeft: '12px',
                                        paddingRight: '12px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    },
                                },
                                rows: {
                                    style: {
                                        backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                                        borderBottom: isDark ? '1px solid #404040' : '1px solid #f1f5f9',
                                        color: isDark ? '#ffffff' : '#000000',
                                        fontSize: '13px',
                                        '&:hover': {
                                            backgroundColor: isDark ? '#2d2d2d' : '#f8f9fa',
                                        },
                                        minHeight: '48px',
                                        paddingTop: '8px',
                                        paddingBottom: '8px',
                                    },
                                },
                                cells: {
                                    style: {
                                        paddingLeft: '12px',
                                        paddingRight: '12px',
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
                                <div className="text-center py-4">
                                    <div style={{
                                        fontSize: '48px',
                                        color: isDark ? '#6b7280' : '#9ca3af',
                                        marginBottom: '16px'
                                    }}>
                                        📄
                                    </div>
                                    <h6 style={{
                                        color: isDark ? '#9ca3af' : '#6b7280',
                                        marginBottom: '8px',
                                        fontWeight: '500'
                                    }}>
                                        No hay documentos disponibles
                                    </h6>
                                    <p style={{
                                        color: isDark ? '#6b7280' : '#9ca3af',
                                        fontSize: '14px',
                                        marginBottom: '0'
                                    }}>
                                        Esta configuración no tiene documentos asociados
                                    </p>
                                </div>
                            }
                        />
                        </div>
                    </>
                )}
            </div>

            {/* Document Form Modal */}
            <Modal 
                show={showDocumentModal} 
                onHide={() => setShowDocumentModal(false)}
                size="lg"
                backdrop={true}
                keyboard={true}
                centered
                autoFocus={true}
                enforceFocus={true}
                restoreFocus={true}
                style={{ zIndex: 10050 }}
                backdropClassName="document-form-backdrop"
                aria-labelledby="document-form-modal-title"
                aria-describedby="document-form-modal-body"
            >
                <Modal.Header 
                    closeButton
                    style={{
                        backgroundColor: isDark ? '#2d2d2d' : '#f8f9fa',
                        borderBottom: isDark ? '1px solid #404040' : '1px solid #dee2e6',
                        color: isDark ? '#ffffff' : '#000000'
                    }}
                >
                    <Modal.Title id="document-form-modal-title">
                        {editingDocument ? 'Editar Documento' : 'Crear Nuevo Documento'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body
                    id="document-form-modal-body"
                    style={{
                        backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                        color: isDark ? '#ffffff' : '#000000'
                    }}
                >
                    <Form>
                        <Row>
                            <Col md={12} className="mb-3">
                                <Form.Group>
                                    <Form.Label style={{ fontWeight: '600' }}>
                                        Descripción <span style={{ color: '#dc2626' }}>*</span>
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                                        placeholder="Ingrese la descripción del documento"
                                        style={{
                                            backgroundColor: isDark ? '#374151' : '#ffffff',
                                            borderColor: isDark ? '#4b5563' : '#d1d5db',
                                            color: isDark ? '#ffffff' : '#000000'
                                        }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4} className="mb-3">
                                <Form.Group>
                                    <Form.Label style={{ fontWeight: '600' }}>Estado</Form.Label>
                                    <Form.Select
                                        value={formData.estado}
                                        onChange={(e) => setFormData({...formData, estado: e.target.value})}
                                        style={{
                                            backgroundColor: isDark ? '#374151' : '#ffffff',
                                            borderColor: isDark ? '#4b5563' : '#d1d5db',
                                            color: isDark ? '#ffffff' : '#000000'
                                        }}
                                    >
                                        <option value="E">En Proceso</option>
                                        <option value="R">Revisión</option>
                                        <option value="A">Aprobado</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4} className="mb-3">
                                <Form.Group>
                                    <Form.Label style={{ fontWeight: '600' }}>Usuario Editor</Form.Label>
                                    <Form.Select
                                        value={formData.id_usuario_editor}
                                        onChange={(e) => setFormData({...formData, id_usuario_editor: Number(e.target.value)})}
                                        style={{
                                            backgroundColor: isDark ? '#374151' : '#ffffff',
                                            borderColor: isDark ? '#4b5563' : '#d1d5db',
                                            color: isDark ? '#ffffff' : '#000000'
                                        }}
                                    >
                                        <option value={0}>Seleccionar usuario</option>
                                        {usuarios.map(usuario => (
                                            <option key={usuario.id} value={usuario.id}>
                                                {usuario.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4} className="mb-3">
                                <Form.Group>
                                    <Form.Label style={{ fontWeight: '600' }}>Usuario Responsable</Form.Label>
                                    <Form.Select
                                        value={formData.id_usuario_responsable}
                                        onChange={(e) => setFormData({...formData, id_usuario_responsable: Number(e.target.value)})}
                                        style={{
                                            backgroundColor: isDark ? '#374151' : '#ffffff',
                                            borderColor: isDark ? '#4b5563' : '#d1d5db',
                                            color: isDark ? '#ffffff' : '#000000'
                                        }}
                                    >
                                        <option value={0}>Seleccionar usuario</option>
                                        {usuarios.map(usuario => (
                                            <option key={usuario.id} value={usuario.id}>
                                                {usuario.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer
                    style={{
                        backgroundColor: isDark ? '#2d2d2d' : '#f8f9fa',
                        borderTop: isDark ? '1px solid #404040' : '1px solid #dee2e6'
                    }}
                >
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowDocumentModal(false)}
                        style={{
                            backgroundColor: isDark ? '#6b7280' : '#6c757d',
                            borderColor: isDark ? '#6b7280' : '#6c757d'
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleSaveDocument}
                        disabled={saving}
                        style={{
                            backgroundColor: isDark ? '#3b82f6' : '#0d6efd',
                            borderColor: isDark ? '#3b82f6' : '#0d6efd'
                        }}
                    >
                        {saving ? (
                            <>
                                <Spinner size="sm" className="me-2" />
                                Guardando...
                            </>
                        ) : (
                            editingDocument ? 'Actualizar' : 'Crear'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

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
    const [showDocumentosModal, setShowDocumentosModal] = useState(false) // Modal state
    const [selectedItemForDocs, setSelectedItemForDocs] = useState<any>(null) // Selected item for documents
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
                <div className="d-flex gap-1" style={{ minWidth: '220px' }}>
                    <Button
                        size="sm"
                        className="d-flex align-items-center"
                        onClick={() => handleDocumentos(item)}
                        style={{
                            backgroundColor: '#0dcaf0',
                            borderColor: '#0dcaf0',
                            color: '#ffffff',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            marginRight: '8px',
                            border: '1px solid #0dcaf0'
                        }}
                    >
                        <BiFile size={14} className="me-1" />
                        Documentos
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        className="d-flex align-items-center"
                        onClick={() => handleDelete(item.id_configuracion)}
                        style={{
                            borderRadius: '6px',
                            padding: '6px 8px',
                            fontSize: '12px',
                            fontWeight: '500'
                        }}
                    >
                        <BiTrash size={14} className="me-1" />
                        Eliminar
                    </Button>
                </div>
            ),
            width: '250px',
            ignoreRowClick: true
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
            const result = await createPeriodoAreaProceso(createData, token);

            // Check if result has id_configuracion (successful creation) or estado property
            if (result && (result.id_configuracion || result.estado)) {
                // Close drawer first
                setShowDrawer(false);
                
                // Show success message
                await Swal.fire({
                    title: 'Éxito',
                    text: result.mensaje || 'Configuración creada correctamente',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                
                // Reload data after successful save
                await handleReload();
            } else {
                Swal.fire({
                    title: 'Error',
                    text: result?.mensaje || 'Error al crear la configuración',
                    icon: 'error'
                });
            }
        } catch (error) {
            console.error('Error saving item:', error);
            Swal.fire({
                title: 'Error',
                text: 'Error al guardar la configuración',
                icon: 'error'
            });
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

    const handleDocumentos = (item: any) => {
        setSelectedItemForDocs(item);
        setShowDocumentosModal(true);
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

            {/* Documentos Modal */}
            <Modal
                show={showDocumentosModal}
                onHide={() => setShowDocumentosModal(false)}
                size="xl"
                centered
                style={{
                    zIndex: 9999
                }}
            >
                <Modal.Header 
                    closeButton
                    style={{
                        backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
                        borderBottom: isDark ? '1px solid #404040' : '1px solid #dee2e6',
                        color: isDark ? '#ffffff' : '#000000'
                    }}
                >
                    <Modal.Title style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: isDark ? '#e5e7eb' : '#374151'
                    }}>
                        📄 Gestión de Documentos
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body
                    style={{
                        backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                        color: isDark ? '#ffffff' : '#000000',
                        padding: '24px'
                    }}
                >
                    {selectedItemForDocs && (
                        <DocumentosComponent
                            selectedItem={selectedItemForDocs}
                            periodos={periodos}
                            areas={areas}
                            procesos={procesos}
                            isDark={isDark}
                            token={token}
                        />
                    )}
                </Modal.Body>
                <Modal.Footer
                    style={{
                        backgroundColor: isDark ? '#2d2d2d' : '#f8f9fa',
                        borderTop: isDark ? '1px solid #404040' : '1px solid #dee2e6'
                    }}
                >
                    <Button
                        variant="secondary"
                        onClick={() => setShowDocumentosModal(false)}
                        style={{
                            borderRadius: '8px',
                            padding: '8px 16px',
                            fontWeight: '500',
                            fontSize: '14px'
                        }}
                    >
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default PeriodoAreaProcesoPage
