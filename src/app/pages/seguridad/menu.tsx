import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Row, Table, Spinner, Button, Form } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { fetchMenuModulo, fetchMenuById, createMenu, updateMenu, deleteMenu, Menu } from '@/servicios/menuProvider'
import Swal from 'sweetalert2'
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import { FaSearch } from 'react-icons/fa'
import { fetchModulo } from '@/servicios/moduloProvider'
import { useFormContext } from "@/utils/formContext.jsx";
import { useAuthContext } from '@/context/useAuthContext'
import DataTable from 'react-data-table-component'
import { BiEdit, BiPlus, BiTrash } from 'react-icons/bi'
import { useLayoutContext } from '@/context/useLayoutContext'


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

    const filteredMenu = menus.filter((menu) => {
        const s = search.toLowerCase();
        return (
            String(menu.id_menu).includes(s) ||
            (menu.descripcion?.toLowerCase().includes(s)) ||
            String(menu.orden).includes(s) ||
            (menu.icono?.toLowerCase().includes(s)) ||
            String(menu.id_empresa).includes(s)
        );
    });




    const columns = [
        {
            name: 'ID',
            selector: (row: any) => row.id_menu,
            sortable: true,
        },
        {
            name: 'Nombre',
            selector: (row: any) => row.descripcion,
            sortable: true,
        },
        {
            name: 'Orden',
            selector: (row: any) => row.orden,
            sortable: true,
        },
        {
            name: 'Icono',
            selector: (row: any) => row.icono,
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
            const data = await fetchModulo(token, id_empresa);
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
                icono: '',
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
                            <div className="d-flex align-items-center mb-1">
                                <h4 className="header-title mb-0 me-2">Menús</h4>
                                <Button variant="primary" size="sm" onClick={handleCreate}>
                                    <BiPlus size={20} className="me-1" onClick={handleGuardar} />
                                </Button>
                            </div>
                            <p className="text-muted">Gestión de menús</p>
                            <input
                                type="text"
                                className="form-control mb-3"
                                placeholder="Buscar Menu..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <DataTable
                                columns={columns}
                                data={filteredMenu}
                                pagination
                                highlightOnHover
                                responsive
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
                                    {(menuSeleccionado || !isEdit) && (
                                        <Form onSubmit={submit}>
                                            <div className="h-5 mt-40"></div>
                                            <h2 className="text-xl font-semibold text-gray-800 text-center">
                                                {isEdit ? "Editar Menú" : "Crear Menú"}
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
                                                <div className="w-50">
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Icono</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            id="icono"
                                                            placeholder="Ingrese el icono"
                                                            value={formValues.icono}
                                                            onChange={handleInputChange}
                                                        />
                                                        {formErrors.icono && (
                                                            <div className="text-danger small">{formErrors.icono}</div>
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

export default MenuPage
