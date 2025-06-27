import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Row, Table, Spinner, Button, Form } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { fetchRol } from '@/servicios/rolProvider'
import { fetchRolUsuario, fetchRolUsuarioById, createRolUsuario, updateRolUsuario, deleteRolUsuario, RolUsuario } from '@/servicios/rolUsuarioProvider'
import Swal from 'sweetalert2'
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import { BiEdit, BiPlus, BiTrash } from 'react-icons/bi'
import { FaSearch } from 'react-icons/fa'
import { useFormContext } from "@/utils/formContext.jsx";
import { fetchUsuario } from '@/servicios/usuarioProvider'
import { useAuthContext } from '@/context/useAuthContext'
import DataTable, { TableColumn } from 'react-data-table-component'
import { useLayoutContext } from '@/context/useLayoutContext'

const UsuarioRolPage = () => {
    interface FormValues {
        id_rol_usuario: number;
        id_rol: number;
        id_usuario: number;
        id_empresa: number;
    }
    const { theme, changeTheme } = useLayoutContext()
    const isDark = theme === 'dark'
    const [rolUsuarios, setRolUsuarios] = useState<RolUsuario[]>([])
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [showDrawer, setShowDrawer] = useState(false)
    const [isEdit, setEdit] = useState(true)
    const [roles, setRoles] = useState<{ id_rol: number, descripcion: string }[]>([])
    const [idRol, setIdRol] = useState(0);
    const [usuarios, setUsuarios] = useState<{ id_usuario: number, nombre_usuario: string }[]>([]);
    const [formValues, setFormValues] = useState({
        id_rol_usuario: 0,
        id_rol: idRol,
        id_usuario: 0,
        id_empresa: 0
    });
    const { user } = useAuthContext()
    const { token, id_empresa } = user || {}
    const { formValuesData } = useFormContext({
        id_empresa: id_empresa || "0"
    });
    const [search, setSearch] = useState('')

    const filteredRolUsuarios = rolUsuarios.filter((rolUsuario) => {
        const s = search.toLowerCase();
        return (
            String(rolUsuario.id_rol_usuario).includes(s) ||
            (roles.find(r => r.id_rol === rolUsuario.id_rol)?.descripcion?.toLowerCase().includes(s)) ||
            String(rolUsuario.id_usuario).includes(s) ||
            (rolUsuario.nombre_usuario?.toLowerCase().includes(s))
        );
    });

    const columns: TableColumn<RolUsuario>[] = [
        {
            name: 'ID',
            selector: row => row.id_rol_usuario,
            sortable: true,
            width: '80px'
        },
        {
            name: 'Rol',
            selector: row => roles.find(r => r.id_rol === row.id_rol)?.descripcion || row.id_rol,
            sortable: true,
            wrap: true
        },
        {
            name: 'Usuario',
            selector: row => row.id_usuario,
            sortable: true,
            width: '120px'
        },
        {
            name: 'Descripción',
            selector: row => row.nombre_usuario,
            sortable: true,
            wrap: true
        },
        {
            name: 'Acciones',
            cell: row => (
                <div>
                    <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(row)}
                    >
                        <BiEdit className="me-1" />
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(row)}
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
        if (!formValues.id_rol || Number(formValues.id_rol) === 0) {
            errors.id_rol = "Debe seleccionar un rol";
        }
        if (!formValues.id_usuario || Number(formValues.id_usuario) === 0) {
            errors.id_rol = "Debe seleccionar un usuario";
        }
        return errors;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                await loadRoles();

                const usuariosData = await fetchUsuario(token);
                setUsuarios(
                    (usuariosData ?? []).map((u: any) => ({
                        id_usuario: u.id_usuario ?? 0,
                        nombre_usuario: u.nombre_usuario ?? '',
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
        setShowDrawer(true)
        setEdit(false)
        setFormValues({
            id_rol_usuario: 0,
            id_rol: idRol,
            id_usuario: 0,
            id_empresa: Number(id_empresa || 0)
        })
        setFormErrors({})
    }

    useEffect(() => {
        const fetchData = async () => {
            await getRolUsuarios();
        };
        fetchData();
    }, [formValuesData])

    const getRolUsuarios = async () => {
        fetchRolUsuario(idRol, token)
            .then(data => setRolUsuarios(data))
            .catch(() => setError('Error al cargar usuarios de rol'))
            .finally(() => setLoading(false))
    }

    const handleEdit = async (rolUsuario: RolUsuario) => {
        try {
            const data = await fetchRolUsuarioById(rolUsuario.id_rol_usuario, token);
            console.log("Rol Usuario Data:", data);
            setFormValues({
                id_rol_usuario: data[0].id_rol_usuario,
                id_rol: data[0].id_rol,
                id_usuario: data[0].id_usuario,
                id_empresa: data[0].id_empresa
            });

            setFormErrors({});
            setEdit(true);
            setShowDrawer(true);
        } catch (error) {
            console.error("Error fetching rol usuario by ID:", error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo obtener la información del usuario de rol.',
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
    }

    const handleDelete = (rolUsuario: RolUsuario) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar el usuario de rol?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                await deleteRolUsuario(rolUsuario.id_rol_usuario, token);
                await getRolUsuarios();
                Swal.fire('Eliminado', 'El usuario de rol ha sido eliminado.', 'success')
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
            const update = await updateRolUsuario({
                id_rol: idRol,
                id_usuario: formValues.id_usuario,
                id_empresa: Number(id_empresa || 0)
            }, token);

            if ((update as any).estado !== false) {
                await getRolUsuarios();

                Swal.fire({
                    title: 'Registro Modificado',
                    text: 'Se ha modificado el registro.',
                    icon: 'success',
                });

                setFormValues({
                    id_rol_usuario: 0,
                    id_rol: idRol,
                    id_usuario: 0,
                    id_empresa: Number(id_empresa || 0)
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
            const newEntrie = await createRolUsuario({
                id_rol_usuario: formValues.id_rol_usuario,
                id_rol: idRol,
                id_usuario: formValues.id_usuario,
                id_empresa: Number(id_empresa || 0)
            }, token);
            if ((newEntrie as any).estado !== false) {
                await getRolUsuarios();

                Swal.fire({
                    title: 'Registro exitoso',
                    text: 'Se ha creado un nuevo registro.',
                    icon: 'success',
                });

                setFormValues({
                    id_rol_usuario: 0,
                    id_rol: idRol,
                    id_usuario: 0,
                    id_empresa: Number(id_empresa || 0)
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
            const data = await fetchRolUsuario(idRol, token)
            setRolUsuarios(data)
            setError(null)
        } catch {
            setError('Error al buscar usuarios de rol')
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <Spinner animation="border" />
    if (error) return <div>{error}</div>

    return (
        <>
            <PageTitle title="Usuarios por Rol" />

            <Row>
                <Col xs={12}>
                    <div className="transition-content grid grid-cols-1 grid-rows-[auto_auto_1fr] px-3 py-4 bg-white rounded-md border border-gray-300 mb-3">
                        <div className="flex w-full items-end">
                            <div className="flex-1 min-w-0" style={{ maxWidth: 350 }}>
                                <label htmlFor="id_rol" className="block text-sm font-medium text-gray-700 mb-10">
                                    Rol
                                </label>
                                <select
                                    id="id_rol"
                                    className="form-select mt-1 w-full"
                                    value={idRol}
                                    onChange={handleInputChange}
                                >
                                    <option value={0}>Seleccione un Rol</option>
                                    {roles.map((rol) => (
                                        <option key={rol.id_rol} value={rol.id_rol}>
                                            {rol.descripcion}
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
                            <div className="d-flex align-items-center mb-1">
                                <h4 className="header-title mb-0 me-2">Usuarios por Rol</h4>
                                <Button variant="primary" size="sm" onClick={handleCreate}>
                                    <BiPlus size={20} className="me-1" onClick={handleGuardar} />
                                </Button>
                            </div>
                            <p className="text-muted">Gestión de usuarios por rol</p>
                            <Form.Control
                                type="text"
                                placeholder="Buscar usuario..."
                                className="mb-3"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <DataTable
                                columns={columns}
                                data={filteredRolUsuarios}
                                pagination
                                highlightOnHover
                                responsive
                                noDataComponent="No hay usuarios para este rol."
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

                                    <Form onSubmit={submit}>
                                        <div className="h-5 mt-40"></div>
                                        <h2 className="text-xl font-semibold text-gray-800 text-center">
                                            {isEdit ? "Editar Usuario de Rol" : "Crear Usuario de Rol"}
                                        </h2>
                                        <p className="text-sm text-gray-600 text-center">
                                            Complete los campos para poder continuar.
                                        </p>
                                        <div className="h-5"></div>

                                        <div className="d-flex gap-4">

                                            <div className="w-100">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Usuario</Form.Label>
                                                    <Form.Select
                                                        id="id_usuario"
                                                        value={formValues.id_usuario}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="">Seleccione un Usuario</option>
                                                        {usuarios.map((usuario) => (
                                                            <option key={usuario.id_usuario} value={usuario.id_usuario}>
                                                                {usuario.nombre_usuario}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                    {formErrors.id_usuario && (
                                                        <div className="text-danger small">{formErrors.id_usuario}</div>
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

                                </div>
                            </Drawer>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </>
    )
}

export default UsuarioRolPage
