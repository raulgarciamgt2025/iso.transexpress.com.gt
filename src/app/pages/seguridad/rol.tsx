import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Row, Table, Spinner, Button, Form } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { fetchRol, fetchRolById, createRol, updateRol, deleteRol, Rol } from '@/servicios/rolProvider'
import Swal from 'sweetalert2'
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import { BiEdit, BiPlus, BiTrash } from 'react-icons/bi'
import { useFormContext } from "@/utils/formContext.jsx";
import { useAuthContext } from '@/context/useAuthContext'
import DataTable from 'react-data-table-component'
import { useLayoutContext } from '@/context/useLayoutContext'


const RolPage = () => {
    const { theme, changeTheme } = useLayoutContext()
    const isDark = theme === 'dark'
    const [roles, setRoles] = useState<Rol[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [showDrawer, setShowDrawer] = useState(false)
    const [rolSeleccionado, setRolSeleccionado] = useState<Rol | null>(null)
    const [isEdit, setEdit] = useState(true)
    const [formValues, setFormValues] = useState({
        id_rol: 0,
        descripcion: '',
        id_empresa: Number(sessionStorage.getItem('id_empresa')) || 0,
    })
    const validateForm = () => {
        const errors: { [key: string]: string } = {};
        if (!formValues.descripcion.trim()) {
            errors.descripcion = "La descripción del rol es obligatoria.";
        }
        return errors;
    };
    const [formErrors, setFormErrors] = useState<{ descripcion?: string }>({})
    const { user } = useAuthContext()
    const { token, id_empresa } = user || {}
    const { formValuesData } = useFormContext({
        id_empresa: id_empresa || "0"
    });

    const [search, setSearch] = useState('');
    const filteredRoles = roles.filter((rol) => {
        const s = search.toLowerCase();
        return (
            String(rol.id_rol).includes(s) ||
            (rol.descripcion?.toLowerCase().includes(s)) ||
            String(rol.id_empresa).includes(s)
        );
    });

    const columns = [
        {
            name: 'ID',
            selector: (row: Rol) => row.id_rol,
            sortable: true,
        },
        {
            name: 'Descripción',
            selector: (row: Rol) => row.descripcion,
            sortable: true,
        },
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
        },
    ];

    useEffect(() => {
        if (rolSeleccionado) {
            setFormValues({
                id_rol: rolSeleccionado.id_rol,
                descripcion: rolSeleccionado.descripcion || '',
                id_empresa: rolSeleccionado.id_empresa,
            })
            setFormErrors({})
        }
    }, [rolSeleccionado, formValuesData])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormValues(prev => ({
            ...prev,
            [id]: value,
        }))
    }

    const handleCancel = () => {
        setShowDrawer(false)
        setRolSeleccionado(null)
        setFormErrors({})
    }

    const handleCreate = () => {
        setRolSeleccionado(null)
        setShowDrawer(true)
        setEdit(false)
        setFormValues({
            id_rol: 0,
            descripcion: '',
            id_empresa: Number(id_empresa) || 0,
        })
        setFormErrors({})
    }

    useEffect(() => {
        const fetchData = async () => {
            await getRoles();
        };
        fetchData();
    }, [formValuesData])

    const getRoles = async () => {
        fetchRol(token, id_empresa)
            .then(data => setRoles(data))
            .catch(() => setError('Error al cargar roles'))
            .finally(() => setLoading(false))
    }

    const handleEdit = async (rol: Rol) => {
        try {
            const data = await fetchRolById(rol.id_rol, token);
            setRolSeleccionado(data[0]);
            setFormErrors({});
            setEdit(true);
            setShowDrawer(true);
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo obtener la información del rol.',
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
        setRolSeleccionado(null)
    }

    const handleDelete = (rol: Rol) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar el rol "${rol.descripcion}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                await deleteRol(rol.id_rol, token);
                await getRoles();
                Swal.fire('Eliminado', 'El rol ha sido eliminado.', 'success')
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
            if (!rolSeleccionado) {
                Swal.fire({
                    title: 'Error',
                    text: 'No se ha seleccionado un rol para editar.',
                    icon: 'error',
                });
                return;
            }

            const update = await updateRol({
                id_rol: rolSeleccionado.id_rol,
                ...formValues,
            }, token);

            if ((update as any).estado !== false) {
                await getRoles();

                Swal.fire({
                    title: 'Registro Modificado',
                    text: 'Se ha modificado el registro.',
                    icon: 'success',
                });

                setFormValues({
                    id_rol: 0,
                    descripcion: "",
                    id_empresa: Number(id_empresa) || 0,
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
            const newEntrie = await createRol({
                descripcion: formValues.descripcion,
                id_empresa: formValues.id_empresa,

            }, token);

            if ((newEntrie as any).estado !== false) {
                await getRoles();

                Swal.fire({
                    title: 'Registro exitoso',
                    text: 'Se ha creado un nuevo registro.',
                    icon: 'success',
                });

                setFormValues({
                    id_rol: 0,
                    descripcion: "",
                    id_empresa: Number(id_empresa) || 0,
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
            <PageTitle title="Roles" />
            <Row>
                <Col xs={12}>
                    <Card>
                        <CardBody>
                            <div className="d-flex align-items-center mb-1">
                                <h4 className="header-title mb-0 me-2">Roles</h4>
                                <Button variant="primary" size="sm" onClick={handleCreate}>
                                    <BiPlus size={20} className="me-1" onClick={handleGuardar} />
                                </Button>
                            </div>
                            <p className="text-muted">Gestión de roles</p>
                            <Form.Control
                                type="text"
                                placeholder="Buscar..."
                                className="mb-3"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <DataTable
                                columns={columns}
                                data={filteredRoles}
                                pagination
                                responsive
                                striped
                                highlightOnHover
                            />



                            <Drawer
                                open={showDrawer}
                                onClose={handleCloseDrawer}
                                direction='right'
                                size={500}
                                style={{
                                    backgroundColor: isDark ? '#121212' : '#fff',
                                    color: isDark ? '#fff' : '#000',
                                }}
                            >

                                <div style={{ padding: 24, marginTop: 70 }}>
                                    {(rolSeleccionado || !isEdit) && (
                                        <Form onSubmit={submit}>
                                            <div className="h-5 mt-40"></div>
                                            <h2 className="text-xl font-semibold text-gray-800 text-center">
                                                {isEdit ? "Editar Rol" : "Crear Rol"}
                                            </h2>
                                            <p className="text-sm text-gray-600 text-center">
                                                Complete los campos para poder continuar.
                                            </p>
                                            <div className="h-5"></div>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Descripción</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    id="descripcion"
                                                    placeholder="Ingrese la descripción"
                                                    value={formValues.descripcion}
                                                    onChange={handleInputChange}
                                                />
                                                {formErrors.descripcion && (
                                                    <div className="text-danger small">{formErrors.descripcion}</div>
                                                )}
                                            </Form.Group>
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

export default RolPage
