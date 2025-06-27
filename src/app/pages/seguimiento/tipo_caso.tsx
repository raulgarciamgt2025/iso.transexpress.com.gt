import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Row, Table, Spinner, Button, Form } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { fetchTipoCaso, fetchTipoCasoById, createTipoCaso, updateTipoCaso, deleteTipoCaso, TipoCaso } from '@/servicios/seguimiento/tipocasoProvider'
import Swal from 'sweetalert2'
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import { BiEdit, BiPlus, BiTrash } from 'react-icons/bi'
import { useFormContext } from "@/utils/formContext.jsx";
import { useAuthContext } from '@/context/useAuthContext'
import DataTable from 'react-data-table-component'
import { useLayoutContext } from '@/context/useLayoutContext'


const TipoCasoPage = () => {
    const { theme, changeTheme } = useLayoutContext()
    const isDark = theme === 'dark'
    const [tipocaso, setItem] = useState<TipoCaso[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [showDrawer, setShowDrawer] = useState(false)
    const [itemSeleccionado, setItemSeleccionado] = useState<TipoCaso | null>(null)
    const [isEdit, setEdit] = useState(true)
    const { formValuesData } = useFormContext({
        id_empresa: sessionStorage.getItem("id_empresa") || "0"
    });
    const { user } = useAuthContext()
    const { token, id_empresa } = user || {}
    const [formValues, setFormValues] = useState({
        id_tipo_caso: 0,
        descripcion: '',
        id_empresa: id_empresa || 0
    })

    const [search, setSearch] = useState('');
    const columns = [
        { name: 'ID', selector: (row: TipoCaso) => row.id_tipo_caso, sortable: true },
        { name: 'Descripción', selector: (row: TipoCaso) => row.descripcion, sortable: true },
        { name: 'ID Empresa', selector: (row: TipoCaso) => row.id_empresa, sortable: true },
        {
            name: 'Acciones',
            cell: (tipocaso) => (
                <div>
                    <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(tipocaso)}
                    >
                        <BiEdit className="me-1" />
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(tipocaso)}
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

    const filteredData = tipocaso.filter((item) => {
        const s = search.toLowerCase();
        return (
            String(item.id_tipo_caso).includes(s) ||
            (item.descripcion?.toLowerCase().includes(s)) ||
            String(item.id_empresa).includes(s)
        );
    });


    const validateForm = () => {
        const errors: { [key: string]: string } = {};
        if (!formValues.descripcion.trim()) {
            errors.descripcion = "La descripción es obligatoria.";
        }
        if (!formValues.id_empresa) {
            errors.id_empresa = "La empresa es obligatoria.";
        }
        return errors;
    };

    const [formErrors, setFormErrors] = useState<{
        descripcion?: string
        id_empresa?: string
    }>({})

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormValues(prev => ({
            ...prev,
            [id]:  id === "id_empresa" ? Number(value) : value,
        }))


    }

    const handleCancel = () => {
        setShowDrawer(false)
        setItemSeleccionado(null)
        setFormErrors({})
    }

    const handleCreate = () => {
        setItemSeleccionado(null)
        setShowDrawer(true)
        setEdit(false)
        setFormValues({
            id_tipo_caso: 0,
            descripcion: '',
            id_empresa: id_empresa || 0,
        })
        setFormErrors({})
    }

    useEffect(() => {
        if (itemSeleccionado) {
            setFormValues({
                id_tipo_caso: itemSeleccionado.id_tipo_caso || 0,
                descripcion: itemSeleccionado.descripcion || '',
                id_empresa: itemSeleccionado.id_empresa || 0,
            })
            setFormErrors({})
        }

        const fetchData = async () => {
            await getItem();
        };
        fetchData();



    }, [itemSeleccionado, formValuesData])

    const getItem = async () => {
        fetchTipoCaso(token, id_empresa)
            .then(data => setItem(data))
            .catch(() => setError('Error al cargar tipo caso'))
            .finally(() => setLoading(false))
    }

    const handleEdit = async (item: TipoCaso) => {
        try {
            const data = await fetchTipoCasoById(item.id_tipo_caso!, token);
            setItemSeleccionado(data[0]);
            setFormErrors({});
            setEdit(true);
            setShowDrawer(true);
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo obtener la información del tipo de caso.',
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
        setItemSeleccionado(null)
    }

    const handleDelete = (item: TipoCaso) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar el tipo de caso "${item.descripcion}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                await deleteTipoCaso(item.id_tipo_caso, token);
                await getItem();
                Swal.fire('Eliminado', 'El tipo de caso ha sido eliminado.', 'success')
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
            if (!itemSeleccionado) {
                Swal.fire({
                    title: 'Error',
                    text: 'No se ha seleccionado un tipo de caso para editar.',
                    icon: 'error',
                });
                return;
            }

            const update = await updateTipoCaso({
                id_tipo_caso: itemSeleccionado.id_tipo_caso,
                descripcion: formValues.descripcion,
                id_empresa: Number(formValues.id_empresa),
            }, token);

            if ((update as any).estado !== false) {
                await getItem();

                Swal.fire({
                    title: 'Registro Modificado',
                    text: 'Se ha modificado el registro.',
                    icon: 'success',
                });

                setFormValues({
                    id_tipo_caso: 0,
                    descripcion: "",
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
            const newEntrie = await createTipoCaso({
                descripcion: formValues.descripcion,
                id_empresa: Number(id_empresa),
            }, token);

            if ((newEntrie as any).estado !== false) {
                await getItem();

                Swal.fire({
                    title: 'Registro exitoso',
                    text: 'Se ha creado un nuevo registro.',
                    icon: 'success',
                });

                setFormValues({
                    id_tipo_caso: 0,
                    descripcion: "",
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
            <PageTitle title="TipoCaso" />
            <Row>
                <Col xs={12}>
                    <Card>
                        <CardBody>
                            <div className="d-flex align-items-center mb-1">
                                <h4 className="header-title mb-0 me-2">Tipos de caso</h4>
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
                                data={filteredData}
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
                                    {(itemSeleccionado || !isEdit) && (
                                        <Form onSubmit={submit}>
                                            <div className="h-5 mt-40"></div>
                                            <h2 className="text-xl font-semibold text-gray-800 text-center">
                                                {isEdit ? "Editar Tipo Caso" : "Crear Tipo Caso"}
                                            </h2>
                                            <p className="text-sm text-gray-600 text-center">
                                                Complete los campos para poder continuar.
                                            </p>
                                            <div className="h-5"></div>

                                            <div className="d-flexgap-4">
                                                <div className="w-100">
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

export default TipoCasoPage
