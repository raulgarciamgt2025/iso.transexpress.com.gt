import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Row, Table, Spinner, Button, Form } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { fetchModulo, fetchModuloById, createModulo, updateModulo, deleteModulo, Modulo } from '@/servicios/moduloProvider'
import Swal from 'sweetalert2'
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import { BiEdit, BiPlus, BiTrash } from 'react-icons/bi'
import { useFormContext } from "@/utils/formContext.jsx";
import { useAuthContext } from '@/context/useAuthContext'
import DataTable from 'react-data-table-component'
import { useLayoutContext } from '@/context/useLayoutContext'


const ModulosPage = () => {
    const { theme, changeTheme } = useLayoutContext()
    const isDark = theme === 'dark'
    const [modulos, setModulos] = useState<Modulo[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [showDrawer, setShowDrawer] = useState(false)
    const [moduloSeleccionado, setModuloSeleccionado] = useState<Modulo | null>(null)
    const [isEdit, setEdit] = useState(true)
    const { formValuesData } = useFormContext({
        id_empresa: sessionStorage.getItem("id_empresa") || "0"
    });
    const { user } = useAuthContext()
    const { token, id_empresa } = user || {}
    const [formValues, setFormValues] = useState({
        id_modulo: 0,
        descripcion: '',
        orden: 0,
        icono: '',
        ruta: '',
        id_empresa: id_empresa || 0
    })

    const [search, setSearch] = useState('');
    const columns = [
        { name: 'ID', selector: (row: Modulo) => row.id_modulo, sortable: true },
        { name: 'Descripción', selector: (row: Modulo) => row.descripcion, sortable: true },
        { name: 'Orden', selector: (row: Modulo) => row.orden, sortable: true },
        { name: 'Icono', selector: (row: Modulo) => row.icono, sortable: true },
        { name: 'Ruta', selector: (row: Modulo) => row.ruta, sortable: true },
        { name: 'ID Empresa', selector: (row: Modulo) => row.id_empresa, sortable: true },
        {
            name: 'Acciones',
            cell: (modulo) => (
                <div>
                    <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(modulo)}
                    >
                        <BiEdit className="me-1" />
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(modulo)}
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

    const filteredMenu = modulos.filter((menu) => {
        const s = search.toLowerCase();
        return (
            String(menu.id_modulo).includes(s) ||
            (menu.descripcion?.toLowerCase().includes(s)) ||
            String(menu.orden).includes(s) ||
            (menu.icono?.toLowerCase().includes(s)) ||
            String(menu.id_empresa).includes(s)
        );
    });


    const validateForm = () => {
        const errors: { [key: string]: string } = {};
        if (!formValues.descripcion.trim()) {
            errors.descripcion = "La descripción es obligatoria.";
        }
        if (!formValues.ruta.trim()) {
            errors.ruta = "La ruta es obligatoria.";
        }
        if (!formValues.icono.trim()) {
            errors.icono = "El icono es obligatorio.";
        }
        if (!formValues.orden) {
            errors.orden = "El orden es obligatorio.";
        }
        if (!formValues.id_empresa) {
            errors.id_empresa = "La empresa es obligatoria.";
        }
        return errors;
    };

    const [formErrors, setFormErrors] = useState<{
        descripcion?: string
        orden?: string
        icono?: string
        ruta?: string
        id_empresa?: string
    }>({})

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormValues(prev => ({
            ...prev,
            [id]: id === "orden" || id === "id_empresa" ? Number(value) : value,
        }))


    }

    const handleCancel = () => {
        setShowDrawer(false)
        setModuloSeleccionado(null)
        setFormErrors({})
    }

    const handleCreate = () => {
        setModuloSeleccionado(null)
        setShowDrawer(true)
        setEdit(false)
        setFormValues({
            id_modulo: 0,
            descripcion: '',
            orden: 0,
            icono: '',
            ruta: '',
            id_empresa: id_empresa || 0,
        })
        setFormErrors({})
    }

    useEffect(() => {
        if (moduloSeleccionado) {
            setFormValues({
                id_modulo: moduloSeleccionado.id_modulo || 0,
                descripcion: moduloSeleccionado.descripcion || '',
                orden: moduloSeleccionado.orden || 0,
                icono: moduloSeleccionado.icono || '',
                ruta: moduloSeleccionado.ruta || '',
                id_empresa: moduloSeleccionado.id_empresa || 0,
            })
            setFormErrors({})
        }

        const fetchData = async () => {
            await getModulos();
        };
        fetchData();



    }, [moduloSeleccionado, formValuesData])

    const getModulos = async () => {
        fetchModulo(token, id_empresa)
            .then(data => setModulos(data))
            .catch(() => setError('Error al cargar módulos'))
            .finally(() => setLoading(false))
    }

    const handleEdit = async (modulo: Modulo) => {
        try {
            const data = await fetchModuloById(modulo.id_modulo!, token);
            setModuloSeleccionado(data[0]);
            setFormErrors({});
            setEdit(true);
            setShowDrawer(true);
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo obtener la información del módulo.',
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
        setModuloSeleccionado(null)
    }

    const handleDelete = (modulo: Modulo) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar el módulo "${modulo.descripcion}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                await deleteModulo(modulo.id_modulo, token);
                await getModulos();
                Swal.fire('Eliminado', 'El módulo ha sido eliminado.', 'success')
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
            if (!moduloSeleccionado) {
                Swal.fire({
                    title: 'Error',
                    text: 'No se ha seleccionado un módulo para editar.',
                    icon: 'error',
                });
                return;
            }

            const update = await updateModulo({
                id_modulo: moduloSeleccionado.id_modulo,
                descripcion: formValues.descripcion,
                orden: formValues.orden,
                icono: formValues.icono,
                ruta: formValues.ruta,
                id_empresa: Number(formValues.id_empresa),
            }, token);

            if ((update as any).estado !== false) {
                await getModulos();

                Swal.fire({
                    title: 'Registro Modificado',
                    text: 'Se ha modificado el registro.',
                    icon: 'success',
                });

                setFormValues({
                    id_modulo: 0,
                    descripcion: "",
                    orden: 0,
                    icono: "",
                    ruta: "",
                    id_empresa: sessionStorage.getItem("id_empresa") || 0,
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
            const newEntrie = await createModulo({
                descripcion: formValues.descripcion,
                orden: formValues.orden,
                icono: formValues.icono,
                ruta: formValues.ruta,
                id_empresa: Number(id_empresa),
            }, token);

            if ((newEntrie as any).estado !== false) {
                await getModulos();

                Swal.fire({
                    title: 'Registro exitoso',
                    text: 'Se ha creado un nuevo registro.',
                    icon: 'success',
                });

                setFormValues({
                    id_modulo: 0,
                    descripcion: "",
                    orden: 0,
                    icono: "",
                    ruta: "",
                    id_empresa: id_empresa || 0,
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
            <PageTitle title="Módulos" />
            <Row>
                <Col xs={12}>
                    <Card>
                        <CardBody>
                            <div className="d-flex align-items-center mb-1">
                                <h4 className="header-title mb-0 me-2">Módulos</h4>
                                <Button variant="primary" size="sm" onClick={handleCreate}>
                                    <BiPlus size={20} className="me-1" onClick={handleGuardar} />
                                </Button>
                            </div>
                            <p className="text-muted">Gestión de módulos</p>

                            <Form.Control
                                type="text"
                                placeholder="Buscar..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="mb-3"
                            />
                            <DataTable
                                columns={columns}
                                data={filteredMenu}
                                pagination
                                responsive
                                highlightOnHover
                                striped
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
                                    {(moduloSeleccionado || !isEdit) && (
                                        <Form onSubmit={submit}>
                                            <div className="h-5 mt-40"></div>
                                            <h2 className="text-xl font-semibold text-gray-800 text-center">
                                                {isEdit ? "Editar Módulo" : "Crear Módulo"}
                                            </h2>
                                            <p className="text-sm text-gray-600 text-center">
                                                Complete los campos para poder continuar.
                                            </p>
                                            <div className="h-5"></div>

                                            <div className="d-flex gap-4">
                                                <div className="w-50">
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
                                                </div>
                                                <div className="w-50">
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Orden</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            min={0}
                                                            step={1}
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
                                                <div className="w-50">
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Ruta</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            id="ruta"
                                                            placeholder="Ingrese la ruta"
                                                            value={formValues.ruta}
                                                            onChange={handleInputChange}
                                                        />
                                                        {formErrors.ruta && (
                                                            <div className="text-danger small">{formErrors.ruta}</div>
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

export default ModulosPage
