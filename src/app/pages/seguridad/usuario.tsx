import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Row, Table, Spinner, Button, Form } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { fetchUsuario, deleteUsuario, fetchUsuarioById, createUsuario, updateUsuario, Usuario } from '@/servicios/usuarioProvider'
import Swal from 'sweetalert2'
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import { BiEdit, BiPlus, BiTrash } from 'react-icons/bi'
import { useAuthContext } from '@/context/useAuthContext'
import DataTable from 'react-data-table-component'
import { useLayoutContext } from '@/context/useLayoutContext'

const UsuarioPage = () => {
  const { theme, changeTheme } = useLayoutContext()
  const isDark = theme === 'dark'
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [showDrawer, setShowDrawer] = useState(false)
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null)
  const [isEdit, setEdit] = useState(true)
  const { user } = useAuthContext()
  const { token } = user || {}
  const [search, setSearch] = useState('')


  const [formValues, setFormValues] = useState({
    id_usuario: 0,
    login_usuario: '',
    nombre_usuario: '',
    email: '',
    contrasena: '',
  })



  const filteredUsuarios = usuarios.filter((usuario) => {
    const s = search.toLowerCase();
    return (
      String(usuario.id_usuario).includes(s) ||
      (usuario.login_usuario?.toLowerCase().includes(s)) ||
      (usuario.nombre_usuario?.toLowerCase().includes(s)) ||
      (usuario.email?.toLowerCase().includes(s)) ||
      (usuario.contrasena?.toLowerCase().includes(s))
    );
  });

  const columns = [
    { name: 'ID', selector: (row: Usuario) => row.id_usuario, sortable: true },
    { name: 'Login', selector: (row: Usuario) => row.login_usuario, sortable: true },
    { name: 'Contrasena', selector: (row: Usuario) => row.contrasena, sortable: false },
    { name: 'Nombre', selector: (row: Usuario) => row.nombre_usuario, sortable: true },
    { name: 'Email', selector: (row: Usuario) => row.email, sortable: true },
    {
      name: 'Acciones',
      cell: (menu) => (
        <div>
          <Button
            variant="warning"
            size="sm"
            className="me-2"
            onClick={() => handleEdit(menu)}
          >
            <BiEdit className="me-1" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(menu)}
          >
            <BiTrash className="me-1" />
          </Button>

        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: '180px'
    }
  ];

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formValues.login_usuario.trim()) {
      errors.login_usuario = "El login del usuario es obligatorio.";
    }

    if (!formValues.nombre_usuario.trim()) {
      errors.nombre_usuario = "El nombre del usuario es obligatorio.";
    }

    if (!formValues.email.trim()) {
      errors.email = "El email es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      errors.email = "El email no tiene un formato válido.";
    }

    if (!formValues.contrasena.trim()) {
      errors.contrasena = "La contraseña es obligatoria.";
    } else if (formValues.contrasena.length < 6) {
      errors.contrasena = "La contraseña debe tener al menos 6 caracteres.";
    }

    return errors;
  };

  const [formErrors, setFormErrors] = useState<{
    login_usuario?: string
    nombre_usuario?: string
    email?: string
    contrasena?: string
  }>({})

  useEffect(() => {
    if (usuarioSeleccionado) {
      setFormValues({
        id_usuario: usuarioSeleccionado.id_usuario,
        login_usuario: usuarioSeleccionado.login_usuario || '',
        nombre_usuario: usuarioSeleccionado.nombre_usuario || '',
        email: usuarioSeleccionado.email || '',
        contrasena: usuarioSeleccionado.contrasena || '',
      })
      setFormErrors({})
    }
  }, [usuarioSeleccionado])

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
      id_usuario: 0,
      login_usuario: '',
      nombre_usuario: '',
      email: '',
      contrasena: '',
    })
    setFormErrors({})
  }

  useEffect(() => {
    const fetchData = async () => {
      await getUsuarios();
    };
    fetchData();
  }, [])

  const getUsuarios = async (
  ) => {
    fetchUsuario(token)
      .then(data => setUsuarios(data))
      .catch(() => setError('Error al cargar usuarios'))
      .finally(() => setLoading(false))
  }


  const handleEdit = async (usuario: Usuario) => {
    try {
      const data = await fetchUsuarioById(usuario.id_usuario, token);
      setUsuarioSeleccionado(data[0]);
      setFormErrors({});
      setEdit(true);
      setShowDrawer(true);
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo obtener la información del usuario.',
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
    setUsuarioSeleccionado(null)
  }

  const handleDelete = (usuario: Usuario) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar al usuario "${usuario.login_usuario}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteUsuario(usuario.id_usuario, token);
        await getUsuarios();
        Swal.fire('Eliminado', 'El usuario ha sido eliminado.', 'success')
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

    if (isEdit) {
      if (!usuarioSeleccionado) {
        Swal.fire({
          title: 'Error',
          text: 'No se ha seleccionado un usuario para editar.',
          icon: 'error',
        });
        return;
      }

      const update = await updateUsuario({
        id_usuario: usuarioSeleccionado.id_usuario,
        ...formValues,
      }, token);

      if (update.estado) {
        await getUsuarios();

        Swal.fire({
          title: 'Registro Modificado',
          text: 'Se ha modificado el registro.',
          icon: 'success',
        });

        setFormValues({
          id_usuario: 0,
          login_usuario: "",
          nombre_usuario: "",
          email: "",
          contrasena: "",
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
      const newEntrie = await createUsuario({
        id_usuario: 0,
        ...formValues,
      }, token);

      if (newEntrie.estado) {
        await getUsuarios();

        Swal.fire({
          title: 'Registro exitoso',
          text: 'Se ha creado un nuevo registro.',
          icon: 'success',
        });

        setFormValues({
          id_usuario: 0,
          login_usuario: "",
          nombre_usuario: "",
          email: "",
          contrasena: "",
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

  if (loading) return <Spinner animation="border" />
  if (error) return <div>{error}</div>

  return (
    <>
      <PageTitle title="Administrador" />
      <Row>
        <Col xs={12}>
          <Card>
            <CardBody>
              <div className="d-flex align-items-center mb-1">
                <h4 className="header-title mb-0 me-2">Administrador</h4>
                <Button variant="primary" size="sm" onClick={handleCreate}>
                  <BiPlus size={20} className="me-1" onClick={handleGuardar} />
                </Button>
              </div>
              <p className="text-muted">Opcion de usuarios Administradores</p>
              <Form.Control
                type="text"
                placeholder="Buscar usuario..."
                className="mb-3"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <DataTable
                columns={columns}
                data={filteredUsuarios}
                pagination
                highlightOnHover
                responsive
                noDataComponent="No hay usuarios"
              />
              <Drawer
                open={showDrawer}
                onClose={handleCloseDrawer}
                direction='right'
                size={900}
                style={{
                  backgroundColor: isDark ? '#121212' : '#fff',
                  color: isDark ? '#fff' : '#000',
                }}
              >
                <div style={{ padding: 24, marginTop: 70 }}>
                  {(usuarioSeleccionado || !isEdit) && (
                    <Form onSubmit={submit}>
                      <div className="h-5 mt-40"></div>
                      <h2 className="text-xl font-semibold text-gray-800 text-center">
                        {isEdit ? "Editar Usuario" : "Crear Usuario"}
                      </h2>
                      <p className="text-sm text-gray-600 text-center">
                        Complete los campos para poder continuar.
                      </p>
                      <div className="h-5"></div>

                      <div className="d-flex gap-4">
                        <div className="w-50">
                          <Form.Group className="mb-3">
                            <Form.Label>Usuario Login</Form.Label>
                            <Form.Control
                              type="text"
                              id="login_usuario"
                              placeholder="Ingrese el Usuario"
                              value={formValues.login_usuario}
                              onChange={handleInputChange}
                            />
                            {formErrors.login_usuario && (
                              <div className="text-danger small">{formErrors.login_usuario}</div>
                            )}
                          </Form.Group>
                        </div>
                        <div className="w-50">
                          <Form.Group className="mb-3">
                            <Form.Label>Nombre Usuario</Form.Label>
                            <Form.Control
                              type="text"
                              id="nombre_usuario"
                              placeholder="Ingrese el nombre"
                              value={formValues.nombre_usuario}
                              onChange={handleInputChange}
                            />
                            {formErrors.nombre_usuario && (
                              <div className="text-danger small">{formErrors.nombre_usuario}</div>
                            )}
                          </Form.Group>
                        </div>
                      </div>

                      <div className="d-flex gap-4">
                        <div className="w-50">
                          <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                              type="email"
                              id="email"
                              placeholder="Ingrese el email"
                              value={formValues.email}
                              onChange={handleInputChange}
                            />
                            {formErrors.email && (
                              <div className="text-danger small">{formErrors.email}</div>
                            )}
                          </Form.Group>
                        </div>
                        <div className="w-50">
                          <Form.Group className="mb-3">
                            <Form.Label>Contraseña</Form.Label>
                            <Form.Control
                              type="password"
                              id="contrasena"
                              placeholder="Ingrese la contraseña"
                              value={formValues.contrasena}
                              onChange={handleInputChange}
                            />
                            {formErrors.contrasena && (
                              <div className="text-danger small">{formErrors.contrasena}</div>
                            )}
                          </Form.Group>
                        </div>
                      </div>

                      <div className="h-5"></div>
                      <Button
                        variant="success"
                        type="submit"
                        className="w-100 mb-2"
                      >
                        {isEdit ? "Editar" : "Guardar"}
                      </Button>
                      <Button
                        variant="secondary"
                        type="button"
                        className="w-100"
                        onClick={handleCancel}
                      >
                        Cancelar
                      </Button>
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
