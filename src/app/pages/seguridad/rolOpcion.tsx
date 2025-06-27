import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Row, Table, Spinner, Button, Form } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { fetchRol } from '@/servicios/rolProvider'
import { fetchRolOpcion, fetchRolOpcionById, createRolOpcion, updateRolOpcion, deleteRolOpcion, RolOpcion } from '@/servicios/rolOpcionProvider'
import Swal from 'sweetalert2'
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import { BiEdit, BiPlus, BiTrash } from 'react-icons/bi'
import { FaSearch } from 'react-icons/fa'
import { useFormContext } from "@/utils/formContext.jsx";
import { fetchOpcion } from '@/servicios/opcionProvider'
import { useAuthContext } from '@/context/useAuthContext'
import DataTable from 'react-data-table-component'
import { useLayoutContext } from '@/context/useLayoutContext'


const RolOpcionPage = () => {
    const { theme, changeTheme } = useLayoutContext()
    const isDark = theme === 'dark'
    const [rolOpciones, setRolOpciones] = useState<RolOpcion[]>([])
    const [opciones, setOpciones] = useState<{ id_opcion: number, descripcion: string }[]>([]);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [showDrawer, setShowDrawer] = useState(false)
    const [rolOpcionSeleccionado, setRolOpcionSeleccionado] = useState<RolOpcion | null>(null)
    const [isEdit, setEdit] = useState(true)
    const [roles, setRoles] = useState<{ id_rol: number, descripcion: string }[]>([])
    const [idRol, setIdRol] = useState(0);
    const { formValuesData } = useFormContext({
        id_empresa: sessionStorage.getItem("id_empresa") || "0"
    });
    const { user } = useAuthContext()
    const { token, id_empresa } = user || {}
    const [formValues, setFormValues] = useState({
        id_rol_opcion: 0,
        id_rol: idRol,
        id_opcion: 0,
        id_empresa: Number(id_empresa) || 0
    });
    const [search, setSearch] = useState('')


    const filteredRolOpciones = rolOpciones.filter((rolOpcion) => {
        const s = search.toLowerCase();
        return (
            String(rolOpcion.id_rol_opcion).includes(s) ||
            (roles.find(r => r.id_rol === rolOpcion.id_rol)?.descripcion?.toLowerCase().includes(s)) ||
            String(rolOpcion.id_opcion).includes(s) ||
            (rolOpcion.opcion?.toLowerCase().includes(s)) ||
            String(rolOpcion.id_rol).includes(s)
        );
    });



    const columns = [
        {
            name: 'ID',
            selector: (row: any) => row.id_rol_opcion,
            sortable: true,
            width: '80px'
        },
        {
            name: 'Rol',
            selector: (row: any) => roles.find(r => r.id_rol === row.id_rol)?.descripcion || row.id_rol,
            sortable: true,
        },
        {
            name: 'Opción',
            selector: (row: any) => row.id_opcion,
            sortable: true,
        },
        {
            name: 'Descripción',
            selector: (row: any) => row.opcion,
            sortable: true,
        },
        {
            name: 'Acciones',
            cell: (row: any) => (
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
        if (!formValues.id_opcion || Number(formValues.id_opcion) === 0) {
            errors.id_opcion = "La opción es obligatoria";
        }

        return errors;
    };

    useEffect(() => {
        if (rolOpcionSeleccionado) {
            setFormValues({
                id_rol_opcion: rolOpcionSeleccionado.id_rol_opcion,
                id_rol: idRol,
                id_opcion: rolOpcionSeleccionado.id_opcion,
                id_empresa: Number(id_empresa)
            })
            setFormErrors({})
        }
        const fetchData = async () => {
            try {
                await loadRoles();
            } catch (error) {
                console.error("Error loading data:", error);
            }
        };
        fetchData();

        const cargarOpciones = async () => {
            try {
                const data = await fetchOpcion(token);
                setOpciones(
                    (data ?? []).map((op: any) => ({
                        id_opcion: op.id_opcion ?? 0,
                        descripcion: op.descripcion ?? '',
                    }))
                );
            } catch (error) {
                console.error("Error cargando opciones:", error);
            }
        };
        cargarOpciones();
    }, [rolOpcionSeleccionado, formValuesData]);

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
        setRolOpcionSeleccionado(null)
        setFormErrors({})
    }

    const handleCreate = () => {
        setFormValues
            ({
                id_rol_opcion: 0,
                id_rol: idRol,
                id_opcion: 0,
                id_empresa: Number(id_empresa)
            })

        setShowDrawer(true)
        setEdit(false)
        setFormValues({
            id_rol_opcion: rolOpcionSeleccionado.id_rol_opcion,
            id_rol: idRol,
            id_opcion: rolOpcionSeleccionado.id_opcion,
            id_empresa: Number(id_empresa)
        })
        setFormErrors({})
    }

    useEffect(() => {
        const fetchData = async () => {
            await getRolOpciones();
        };
        fetchData();
    }, [])

    const getRolOpciones = async () => {
        fetchRolOpcion(idRol, token)
            .then(data => setRolOpciones(data))
            .catch(() => setError('Error al cargar opciones de rol'))
            .finally(() => setLoading(false))
    }

    const handleEdit = async (rolOpcion: RolOpcion) => {
        try {
            const data = await fetchRolOpcionById(rolOpcion.id_rol_opcion, token);
            setRolOpcionSeleccionado(data[0]);
            setFormErrors({});
            setEdit(true);
            setShowDrawer(true);
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo obtener la información de la opción de rol.',
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
        setRolOpcionSeleccionado(null)
    }

    const handleDelete = (rolOpcion: RolOpcion) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar la opción de rol?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                await deleteRolOpcion(rolOpcion.id_rol_opcion, token);
                await getRolOpciones();
                Swal.fire('Eliminado', 'La opción de rol ha sido eliminada.', 'success')
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
            if (!rolOpcionSeleccionado) {
                Swal.fire({
                    title: 'Error',
                    text: 'No se ha seleccionado una opción de rol para editar.',
                    icon: 'error',
                });
                return;
            }

            const update = await updateRolOpcion({
                id_rol_opcion: formValues.id_rol_opcion,
                id_rol: idRol,
                id_opcion: formValues.id_opcion,
                id_empresa: Number(id_empresa)
            }, token);

            if ((update as any).estado !== false) {
                await getRolOpciones();

                Swal.fire({
                    title: 'Registro Modificado',
                    text: 'Se ha modificado el registro.',
                    icon: 'success',
                });

                setFormValues({
                    id_rol_opcion: 0,
                    id_rol: idRol,
                    id_opcion: 0,
                    id_empresa: Number(id_empresa)
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
            const newEntrie = await createRolOpcion({
                id_rol_opcion: formValues.id_rol_opcion,
                id_rol: idRol,
                id_opcion: formValues.id_opcion,
                id_empresa: Number(id_empresa)
            }, token);

            if ((newEntrie as any).estado !== false) {
                await getRolOpciones();

                Swal.fire({
                    title: 'Registro exitoso',
                    text: 'Se ha creado un nuevo registro.',
                    icon: 'success',
                });

                setFormValues({
                    id_rol_opcion: 0,
                    id_rol: idRol,
                    id_opcion: 0,
                    id_empresa: Number(id_empresa)
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
            const data = await fetchRolOpcion(idRol, token)
            setRolOpciones(data)
            setError(null)
        } catch {
            setError('Error al buscar opciones de rol')
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <Spinner animation="border" />
    if (error) return <div>{error}</div>

    return (
        <>
            <PageTitle title="Opciones de Rol" />

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
                                <h4 className="header-title mb-0 me-2">Opciones de Rol</h4>
                                <Button variant="primary" size="sm" onClick={handleCreate}>
                                    <BiPlus size={20} className="me-1" onClick={handleGuardar} />
                                </Button>
                            </div>
                            <p className="text-muted">Gestión de opciones de rol</p>
                            <input
                                type="text"
                                className="form-control mb-3"
                                placeholder="Buscar Menu..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <DataTable
                                columns={columns}
                                data={filteredRolOpciones}
                                pagination
                                responsive
                                highlightOnHover
                                striped
                                noDataComponent="No hay datos para mostrar"
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
                                    {(rolOpcionSeleccionado || !isEdit) && (
                                        <Form onSubmit={submit}>
                                            <div className="h-5 mt-40"></div>
                                            <h2 className="text-xl font-semibold text-gray-800 text-center">
                                                {isEdit ? "Editar Opción de Rol" : "Crear Opción de Rol"}
                                            </h2>
                                            <p className="text-sm text-gray-600 text-center">
                                                Complete los campos para poder continuar.
                                            </p>
                                            <div className="h-5"></div>

                                            <div className="d-flex gap-4">
                                                <div className="w-100">
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Opción</Form.Label>
                                                        <Form.Select
                                                            id="id_opcion"
                                                            value={formValues.id_opcion}
                                                            onChange={handleInputChange}
                                                        >
                                                            <option value={0}>Seleccione una Opción</option>
                                                            {opciones.map((op) => (
                                                                <option key={op.id_opcion} value={op.id_opcion}>
                                                                    {op.descripcion}
                                                                </option>
                                                            ))}
                                                        </Form.Select>
                                                        {formErrors.id_opcion && (
                                                            <div className="text-danger small">{formErrors.id_opcion}</div>
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

export default RolOpcionPage
