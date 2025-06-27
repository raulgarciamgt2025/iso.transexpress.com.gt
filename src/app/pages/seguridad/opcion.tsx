import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Row, Table, Spinner, Button, Form } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { fetchOpcion, fetchOpcionModulo, fetchOpcionById, createOpcion, updateOpcion, deleteOpcion } from '@/servicios/opcionProvider'
import { fetchModulo } from '@/servicios/moduloProvider'
import Swal from 'sweetalert2'
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import { BiEdit, BiPlus, BiTrash } from 'react-icons/bi'
import { FaSearch } from 'react-icons/fa'
import { useFormContext } from "@/utils/formContext.jsx";
import { useAuthContext } from '@/context/useAuthContext'
import { fetchMenuModulo } from '@/servicios/menuProvider'
import { set } from 'react-hook-form'
import DataTable from 'react-data-table-component'
import { run } from 'node:test'
import { useLayoutContext } from '@/context/useLayoutContext'

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
    const filteredOpciones = opciones.filter((opcion) => {
        const s = search.toLowerCase();
        return (
            String(opcion.id_opcion).includes(s) ||
            (opcion.descripcion?.toLowerCase().includes(s)) ||
            (opcion.ruta?.toLowerCase().includes(s)) ||
            String(opcion.orden).includes(s) ||
            String(opcion.id_menu).includes(s) ||
            String(opcion.id_empresa).includes(s)
        );
    });


    const columns = [
        { name: 'ID', selector: row => row.id_opcion, sortable: true },
        { name: 'Nombre', selector: row => row.descripcion, sortable: true },
        { name: 'Ruta', selector: row => row.ruta, sortable: true },
        { name: 'Orden', selector: row => row.orden, sortable: true },
        {
            name: 'Acciones',
            cell: (opcion) => (
                <div>
                    <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(opcion)}
                    >
                        <BiEdit className="me-1" />
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(opcion)}
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
            const data = await fetchModulo(token, Number(id_empresa));
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
    }

    useEffect(() => {
        const fetchData = async () => {
            await getOpciones();
        };
        fetchData();
    }, [])

    const getOpciones = async () => {
        fetchOpcionModulo(idModulo, token)
            .then(data => setOpciones(data))
            .catch(() => setError('Error al cargar opciones'))
            .finally(() => setLoading(false))
    }

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
                await deleteOpcion(opcion.id_opcion, token);
                await opcionesMenuFetch();
                Swal.fire('Eliminado', 'La opción ha sido eliminada.', 'success')
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

            if ((update as any).estado !== false) {
                await opcionesMenuFetch();

                Swal.fire({
                    title: 'Registro Modificado',
                    text: 'Se ha modificado el registro.',
                    icon: 'success',
                });

                setFormValues({
                    id_opcion: "",
                    descripcion: "",
                    orden: "",
                    id_modulo: idModulo,
                    id_empresa: id_empresa || 0,
                    ruta: ""
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
            const newEntrie = await createOpcion({
                id_empresa: Number(id_empresa),
                orden: Number(formValues.orden),
                descripcion: formValues.descripcion,
                id_opcion: formValues.id_opcion ? Number(formValues.id_opcion) : 0,
                ruta: formValues.ruta,
                id_menu: idMenu
            }, token);

            if ((newEntrie as any).estado !== false) {
                await opcionesMenuFetch();
                Swal.fire({
                    title: 'Registro exitoso',
                    text: 'Se ha creado un nuevo registro.',
                    icon: 'success',
                });

                setFormValues({
                    id_opcion: "",
                    descripcion: "",
                    orden: "",
                    id_modulo: idModulo,
                    id_empresa: id_empresa || 0,
                    ruta: ""
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
            opcionesMenuFetch();
        } catch {
            setError('Error al buscar opciones')
        } finally {
            setLoading(false)
        }
    }

    const opcionesMenuFetch = async () => {
        const data = await fetchOpcionModulo(idMenu, token)
        setOpciones(data)
    }

    if (loading) return <Spinner animation="border" />
    if (error) return <div>{error}</div>

    return (
        <>
            <PageTitle title="Opciones" />

            <Row>
                <Col xs={12}>
                    <div className="transition-content px-3 py-4 bg-white rounded-md border border-gray-300 mb-3">
                        <div className="d-flex align-items-end gap-3">
                            <div style={{ minWidth: 250, maxWidth: 250 }}>
                                <label htmlFor="id_modulo" className="block text-sm font-medium text-gray-700 mb-1">
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
                            <div style={{ minWidth: 250, maxWidth: 250 }}>
                                <label htmlFor="id_empresa" className="block text-sm font-medium text-gray-700 mb-1">
                                    Menu
                                </label>
                                <select
                                    id="id_menu"
                                    className="form-select mt-1 w-full"
                                    value={idMenu}
                                    disabled={idModulo === 0}
                                    onChange={handleInputChange}
                                >
                                    <option value={0}>Seleccione un Menu</option>
                                    {menu.map((menu) => (
                                        <option key={menu.menu} value={menu.id_menu}>
                                            {menu.descripcion}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Button
                                className="h-8 space-x-1.5 rounded-md px-3 text-xs d-flex align-items-center"
                                variant="primary"
                                onClick={handleSearch}
                                style={{ marginLeft: 16, marginTop: 24 }}
                            >
                                <FaSearch className="me-2" />
                                <span>Buscar</span>
                            </Button>
                        </div>
                    </div>

                    <Card>
                        <CardBody>
                            <div className="d-flex align-items-center mb-1">
                                <h4 className="header-title mb-0 me-2">Opciones</h4>
                                <Button variant="primary" size="sm" onClick={handleCreate}>
                                    <BiPlus size={20} className="me-1" onClick={handleGuardar} />
                                </Button>
                            </div>
                            <p className="text-muted">Gestión de opciones</p>
                            <Form.Control
                                type="text"
                                placeholder="Buscar..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="mb-3"
                            />
                            <DataTable
                                columns={columns}
                                data={filteredOpciones}
                                pagination
                                highlightOnHover
                                dense
                                noDataComponent="No hay opciones para mostrar."
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
                                    {(opcionSeleccionada || !isEdit) && (
                                        <Form onSubmit={submit}>
                                            <div className="h-5 mt-40"></div>
                                            <h2 className="text-xl font-semibold text-gray-800 text-center">
                                                {isEdit ? "Editar Opción" : "Crear Opción"}
                                            </h2>
                                            <p className="text-sm text-gray-600 text-center">
                                                Complete los campos para poder continuar.
                                            </p>
                                            <div className="h-5"></div>

                                            <div className="d-flex gap-4">
                                                <div className="w-50">
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Nombre</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            id="descripcion"
                                                            placeholder="Ingrese el nombre"
                                                            value={formValues.descripcion}
                                                            onChange={handleInputChange}
                                                        />
                                                        {formErrors.descripcion && (
                                                            <div className="text-danger small">{formErrors.descripcion}</div>
                                                        )}
                                                    </Form.Group>
                                                </div>
                                                <div className="w-50">
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Orden</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            id="orden"
                                                            placeholder="Ingrese el orden"
                                                            value={formValues.orden}
                                                            onChange={handleInputChange}
                                                        />
                                                        {formErrors.orden && (
                                                            <div className="text-danger small">{formErrors.orden}</div>
                                                        )}
                                                    </Form.Group>
                                                </div>
                                            </div>

                                            <div className="d-flex gap-4">
                                                <div className="w-100">
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Ruta</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            id="ruta"
                                                            placeholder="Ingrese el nombre"
                                                            value={formValues.ruta}
                                                            onChange={handleInputChange}
                                                        />
                                                        {formErrors.ruta && (
                                                            <div className="text-danger small">{formErrors.descripcion}</div>
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

export default OpcionPage
