import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Row, Table, Spinner, Button, Form } from 'react-bootstrap'
import { useEffect, useState, useRef } from 'react'
import { fetchUsuario, deleteUsuario, fetchUsuarioById, createUsuario, updateUsuario, updateUsuarioPassword, Usuario } from '@/servicios/usuarioProvider'
import Swal from 'sweetalert2'
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import { BiEdit, BiPlus, BiTrash, BiRefresh, BiKey } from 'react-icons/bi'
import { FaSearch, FaFilter, FaChevronRight } from 'react-icons/fa'
import { useAuthContext } from '@/context/useAuthContext'
import DataTable, { TableColumn } from 'react-data-table-component'
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

const UsuarioPage = () => {
  const { theme, changeTheme } = useLayoutContext()
  const isDark = theme === 'dark'
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [showDrawer, setShowDrawer] = useState(false)
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null)
  const [isEdit, setEdit] = useState(true)
  const [search, setSearch] = useState('')
  const [isReloading, setIsReloading] = useState(false)
  const [columnFilters, setColumnFilters] = useState({
    id: '',
    name: '',
    email: '',
  })
  const nombreRef = useRef<HTMLInputElement>(null)
  const { user } = useAuthContext()
  const { token, id_empresa } = user || {}

  const [formValues, setFormValues] = useState({
    id: 0,
    name: '',
    email: ''
  })

  const [formErrors, setFormErrors] = useState<{
    name?: string
    email?: string
  }>({})

  // Auto-focus on drawer open
  useEffect(() => {
    if (showDrawer && nombreRef.current) {
      setTimeout(() => {
        nombreRef.current?.focus();
      }, 100);
    }
  }, [showDrawer]);

  // Handle reload with animation
  const handleReload = async () => {
    setIsReloading(true);
    await getUsuarios();
    setTimeout(() => setIsReloading(false), 1000);
  };

  // Filtered data with per-column search and global search
  const filteredUsuarios = usuarios.filter((usuario) => {
    const matchesGlobal = search === '' || 
      String(usuario.id).toLowerCase().includes(search.toLowerCase()) ||
      (usuario.name?.toLowerCase().includes(search.toLowerCase())) ||
      (usuario.email?.toLowerCase().includes(search.toLowerCase()));
    
    const matchesColumn = 
      (columnFilters.id === '' || String(usuario.id).includes(columnFilters.id)) &&
      (columnFilters.name === '' || usuario.name?.toLowerCase().includes(columnFilters.name.toLowerCase())) &&
      (columnFilters.email === '' || usuario.email?.toLowerCase().includes(columnFilters.email.toLowerCase()));
    
    return matchesGlobal && matchesColumn;
  });

  const columns: TableColumn<Usuario>[] = [
    {
      name: 'ID',
      selector: (row: Usuario) => row.id,
      sortable: true,
      width: '100px',
      cell: (row: Usuario) => (
        <div style={{
          fontWeight: '500',
          color: isDark ? '#d1d5db' : '#6b7280',
          fontSize: '14px'
        }}>
          {row.id}
        </div>
      ),
    },
    {
      name: 'Nombre Usuario',
      selector: (row: Usuario) => row.name,
      sortable: true,
      cell: (row: Usuario) => (
        <div style={{
          fontWeight: '500',
          color: isDark ? '#f3f4f6' : '#1f2937'
        }}>
          {row.name}
        </div>
      ),
    },
    {
      name: 'Email',
      selector: (row: Usuario) => row.email,
      sortable: true,
      cell: (row: Usuario) => (
        <div style={{
          fontWeight: '500',
          color: isDark ? '#f3f4f6' : '#1f2937'
        }}>
          {row.email}
        </div>
      ),
    },
    {
      name: 'Acciones',
      cell: (usuario) => (
        <div className="d-flex gap-1">
          <Button
            variant="warning"
            size="sm"
            onClick={() => handleEdit(usuario)}
            style={{
              borderRadius: '6px',
              padding: '6px 8px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: '500'
            }}
          >
            <BiEdit size={14} />
            Editar
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={() => handleChangePassword(usuario)}
            style={{
              borderRadius: '6px',
              padding: '6px 8px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: '500'
            }}
          >
            <BiKey size={14} />
            Contraseña
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(usuario)}
            style={{
              borderRadius: '6px',
              padding: '6px 8px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: '500'
            }}
          >
            <BiTrash size={14} />
            Eliminar
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      width: '280px'
    },
  ];

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formValues.name.trim()) {
      errors.name = "El nombre del usuario es obligatorio.";
    }

    if (!formValues.email.trim()) {
      errors.email = "El email es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      errors.email = "El email no tiene un formato válido.";
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
    if (usuarioSeleccionado) {
      setFormValues({
        id: usuarioSeleccionado.id,
        name: usuarioSeleccionado.name || '',
        email: usuarioSeleccionado.email || '',
      })
      setFormErrors({})
    }
  }, [usuarioSeleccionado, id_empresa])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormValues(prev => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleCancel = () => {
    setShowDrawer(false)
    setUsuarioSeleccionado(null)
    setFormErrors({})
  }

  const handleCreate = () => {
    setUsuarioSeleccionado(null)
    setShowDrawer(true)
    setEdit(false)
    setFormValues({
      id: 0,
      name: '',
      email: '',
    })
    setFormErrors({})
  }

  useEffect(() => {
    const fetchData = async () => {
      await getUsuarios();
    };
    fetchData();
  }, [])

  const getUsuarios = async () => {
    fetchUsuario(token)
      .then(data => setUsuarios(data))
      .catch(() => setError('Error al cargar usuarios'))
      .finally(() => setLoading(false))
  }

  const handleEdit = async (usuario: Usuario) => {
    try {
      const data = await fetchUsuarioById(usuario.id, token);
      if (data && data.length > 0) {
        setUsuarioSeleccionado(data[0]);
        setFormErrors({});
        setEdit(true);
        setShowDrawer(true);
      } else {
        throw new Error('No se encontraron datos');
      }
    } catch (error) {
      console.error("Error fetching usuario by ID:", error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo obtener la información del usuario.',
        icon: 'error',
      });
    }
  }

  const handleCloseDrawer = () => {
    setShowDrawer(false)
    setUsuarioSeleccionado(null)
  }

  const handleDelete = async (usuario: Usuario) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar al usuario "${usuario.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const deleteResult = await deleteUsuario(usuario.id, token);
          if (deleteResult.estado === false) {
            Swal.fire('Error', deleteResult.mensaje || 'No se pudo eliminar el usuario.', 'error');
          } else {
            await getUsuarios();
            Swal.fire('Eliminado', 'El usuario ha sido eliminado.', 'success');
          }
        } catch (error) {
          Swal.fire('Error', 'Ocurrió un error al eliminar el usuario.', 'error');
        }
      }
    });
  }

  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length < 8) {
      errors.push('Mínimo 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Al menos una letra mayúscula');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Al menos un carácter especial');
    }
    return errors;
  };

  const handleChangePassword = async (usuario: Usuario) => {
    const { value: formValues } = await Swal.fire({
      title: `Cambiar contraseña`,
      html: `
        <div style="text-align: left; margin-bottom: 20px;">
          <p style="margin-bottom: 20px; color: #6b7280; text-align: center;">Usuario: <strong>${usuario.name}</strong></p>
          
          <div style="margin-bottom: 15px; padding: 12px; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid #059669;">
            <p style="margin: 0; font-size: 13px; color: #374151; font-weight: 500;">Requisitos de contraseña:</p>
            <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 12px; color: #6b7280;">
              <li>Mínimo 8 caracteres</li>
              <li>Al menos una letra mayúscula (A-Z)</li>
              <li>Al menos un carácter especial (!@#$%^&*(),.?":{}|<>)</li>
            </ul>
          </div>
          
          <div style="margin-bottom: 15px;">
            <label for="swal-input1" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Nueva contraseña:</label>
            <input 
              id="swal-input1" 
              class="swal2-input" 
              type="password" 
              placeholder="Ingrese la nueva contraseña"
              autocomplete="new-password"
              style="margin: 0; padding: 12px; border-radius: 6px; border: 1px solid #d1d5db; width: 100%; box-sizing: border-box;"
            />
          </div>
          
          <div style="margin-bottom: 15px;">
            <label for="swal-input2" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Confirmar contraseña:</label>
            <input 
              id="swal-input2" 
              class="swal2-input" 
              type="password" 
              placeholder="Confirme la nueva contraseña"
              autocomplete="new-password"
              style="margin: 0; padding: 12px; border-radius: 6px; border: 1px solid #d1d5db; width: 100%; box-sizing: border-box;"
            />
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Cambiar contraseña',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#059669',
      cancelButtonColor: '#6b7280',
      preConfirm: () => {
        const password = (document.getElementById('swal-input1') as HTMLInputElement)?.value;
        const confirmPassword = (document.getElementById('swal-input2') as HTMLInputElement)?.value;
        
        if (!password) {
          Swal.showValidationMessage('La contraseña es obligatoria');
          return false;
        }
        
        // Use the validation function for better error messages
        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
          Swal.showValidationMessage(`Contraseña no válida: ${passwordErrors.join(', ')}`);
          return false;
        }
        
        if (!confirmPassword) {
          Swal.showValidationMessage('La confirmación de contraseña es obligatoria');
          return false;
        }
        if (password !== confirmPassword) {
          Swal.showValidationMessage('Las contraseñas no coinciden');
          return false;
        }
        
        return { password, confirmPassword };
      }
    });

    if (formValues) {
      try {
        const response = await updateUsuarioPassword(usuario.id, formValues.password, token);
        if (response?.estado !== false) {
          Swal.fire({
            title: 'Contraseña actualizada',
            text: response?.mensaje || 'La contraseña ha sido actualizada exitosamente.',
            icon: 'success',
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: response?.mensaje || 'No se pudo actualizar la contraseña.',
            icon: 'error',
          });
        }
      } catch (error) {
        console.error('Error updating password:', error);
        Swal.fire({
          title: 'Error',
          text: 'Ocurrió un error al actualizar la contraseña.',
          icon: 'error',
        });
      }
    }
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
        if (!usuarioSeleccionado) {
          Swal.fire({
            title: 'Error',
            text: 'No se ha seleccionado un usuario para editar.',
            icon: 'error',
          });
          return;
        }

        const response = await updateUsuario({
          id: usuarioSeleccionado.id,
          name: formValues.name,
          email: formValues.email,
        }, token);

        if (response?.estado !== false) {
          await getUsuarios();
          Swal.fire({
            title: 'Registro Modificado',
            text: response?.mensaje || 'Se ha modificado el registro exitosamente.',
            icon: 'success',
          });
          setShowDrawer(false);
          setFormErrors({});
        } else {
          Swal.fire({
            title: 'Error',
            text: response?.mensaje || 'No se ha podido modificar el registro.',
            icon: 'error',
          });
        }
      } else {
        const response = await createUsuario({
          name: formValues.name,
          email: formValues.email,
        }, token);

        if (response?.estado !== false) {
          await getUsuarios();
          Swal.fire({
            title: 'Registro exitoso',
            text: response?.mensaje || 'Se ha creado un nuevo registro exitosamente.',
            icon: 'success',
          });
          setShowDrawer(false);
          setFormErrors({});
          // Reset form
          setFormValues({
            id: 0,
            name: "",
            email: "",
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: response?.mensaje || 'No se ha podido crear el registro.',
            icon: 'error',
          });
        }
      }
      setFormErrors({});
    } catch (error) {
      console.error('Error in submit:', error);
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error inesperado.',
        icon: 'error',
      });
    }
  };

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
      <PageTitle title="Usuarios" />

      <Row>
        <Col xs={12}>
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
                    disabled={isReloading}
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
                <Col md={4}>
                  <Form.Group className="mb-0">
                    <Form.Label className="small text-muted">ID</Form.Label>
                    <Form.Control
                      type="text"
                      name="id"
                      placeholder="Filtrar por ID..."
                      value={columnFilters.id}
                      onChange={handleColumnFilterChange}
                      size="sm"
                      style={{ borderRadius: '6px' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-0">
                    <Form.Label className="small text-muted">Nombre Usuario</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Filtrar por nombre..."
                      value={columnFilters.name}
                      onChange={handleColumnFilterChange}
                      size="sm"
                      style={{ borderRadius: '6px' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-0">
                    <Form.Label className="small text-muted">Email</Form.Label>
                    <Form.Control
                      type="text"
                      name="email"
                      placeholder="Filtrar por email..."
                      value={columnFilters.email}
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
                  <h4 className="header-title mb-1">Gestión de Usuarios</h4>
                  <p className="text-muted mb-0 small">
                    Administración de usuarios del sistema
                  </p>
                </div>
                <div className="text-muted small">
                  {filteredUsuarios.length} de {usuarios.length} registros
                </div>
              </div>

              <DataTable
                columns={columns}
                data={filteredUsuarios}
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
                      {search || Object.values(columnFilters).some(f => f !== '')
                        ? 'No se encontraron usuarios que coincidan con los filtros aplicados'
                        : 'No hay usuarios registrados'
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
                        {isEdit ? 'Editar Usuario' : 'Crear Usuario'}
                      </span>
                    </div>
                    
                    {/* Breadcrumb */}
                    <div className="d-flex align-items-center text-white" style={{ opacity: 0.9, fontSize: '14px' }}>
                      <span>Seguridad</span>
                      <FaChevronRight className="mx-2" size={12} />
                      <span>Usuarios</span>
                      <FaChevronRight className="mx-2" size={12} />
                      <span>{isEdit ? 'Editar' : 'Nuevo'}</span>
                    </div>
                  </div>
                </div>

                {/* Form Content */}
                <div style={{ padding: '24px' }}>
                  {(usuarioSeleccionado || !isEdit) && (
                    <Form onSubmit={submit}>
                      <div className="mb-4 text-center">
                        <p className="text-muted mb-0 small">
                          Complete los campos requeridos para continuar
                        </p>
                      </div>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold mb-2">
                          Nombre Usuario <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          ref={nombreRef}
                          type="text"
                          id="name"
                          placeholder="Ingrese el nombre del usuario"
                          value={formValues.name}
                          onChange={handleInputChange}
                          isInvalid={!!formErrors.name}
                          style={{
                            borderRadius: '8px',
                            border: formErrors.name ? '1px solid #dc3545' : '1px solid #e2e8f0',
                            padding: '12px',
                            fontSize: '14px'
                          }}
                        />
                        {formErrors.name && (
                          <div className="text-danger small mt-1">{formErrors.name}</div>
                        )}
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold mb-2">
                          Email <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="email"
                          id="email"
                          placeholder="Ingrese el email"
                          value={formValues.email}
                          onChange={handleInputChange}
                          isInvalid={!!formErrors.email}
                          style={{
                            borderRadius: '8px',
                            border: formErrors.email ? '1px solid #dc3545' : '1px solid #e2e8f0',
                            padding: '12px',
                            fontSize: '14px'
                          }}
                        />
                        {formErrors.email && (
                          <div className="text-danger small mt-1">{formErrors.email}</div>
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
                          {isEdit ? 'Actualizar Usuario' : 'Crear Usuario'}
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
                  )}
                </div>
              </Drawer>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default UsuarioPage
