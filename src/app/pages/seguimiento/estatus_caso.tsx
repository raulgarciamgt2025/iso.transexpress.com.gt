import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Row, Table, Spinner, Button, Form } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { fetchEstatusCaso, fetchEstatusCasoById, createEstatusCaso, updateEstatusCaso, deleteEstatusCaso, EstatusCaso } from '@/servicios/seguimiento/estatuscasoProvider'
import Swal from 'sweetalert2'
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import { BiEdit, BiPlus, BiTrash } from 'react-icons/bi'
import { useFormContext } from "@/utils/formContext.jsx";
import { useAuthContext } from '@/context/useAuthContext'
import DataTable from 'react-data-table-component'
import { useLayoutContext } from '@/context/useLayoutContext'


const EstatuCasosPage = () => {
    const { theme, changeTheme } = useLayoutContext()
    const isDark = theme === 'dark'
    const [estatuscasos, setEstatusCasos] = useState<EstatusCaso[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [showDrawer, setShowDrawer] = useState(false)
    const [estatuscasoSeleccionado, setEstatusCasoSeleccionado] = useState<EstatusCaso | null>(null)
    const [isEdit, setEdit] = useState(true)
    const { formValuesData } = useFormContext({
        id_empresa: sessionStorage.getItem("id_empresa") || "0"
    });
    const { user } = useAuthContext()
    const { token, id_empresa } = user || {}
    const [formValues, setFormValues] = useState({
        id_estatus: 0,
        descripcion: '',
        id_empresa: id_empresa || 0
    })

    const [search, setSearch] = useState('');
    const columns = [
        { name: 'ID', selector: (row: EstatusCaso) => row.id_estatus, sortable: true },
        { name: 'Descripción', selector: (row: EstatusCaso) => row.descripcion, sortable: true },
        { name: 'ID Empresa', selector: (row: EstatusCaso) => row.id_empresa, sortable: true },
        {
            name: 'Acciones',
            cell: (estatuscaso) => (
                <div>
                    <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(estatuscaso)}
                    >
                        <BiEdit className="me-1" />
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(estatuscaso)}
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

    const filteredData = estatuscasos.filter((item) => {
        const s = search.toLowerCase();
        return (
            String(item.id_estatus).includes(s) ||
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
        setEstatusCasoSeleccionado(null)
        setFormErrors({})
    }

    const handleCreate = () => {
        setEstatusCasoSeleccionado(null)
        setShowDrawer(true)
        setEdit(false)
        setFormValues({
            id_estatus: 0,
            descripcion: '',
            id_empresa: id_empresa || 0,
        })
        setFormErrors({})
    }

    useEffect(() => {
        if (estatuscasoSeleccionado) {
            setFormValues({
                id_estatus: estatuscasoSeleccionado.id_estatus || 0,
                descripcion: estatuscasoSeleccionado.descripcion || '',
                id_empresa: estatuscasoSeleccionado.id_empresa || 0,
            })
            setFormErrors({})
        }

        const fetchData = async () => {
            await getEstatusCasos();
        };
        fetchData();



    }, [estatuscasoSeleccionado, formValuesData])

    const getEstatusCasos = async () => {
        fetchEstatusCaso(token, id_empresa)
            .then(data => setEstatusCasos(data))
            .catch(() => setError('Error al cargar estatus'))
            .finally(() => setLoading(false))
    }

    const handleEdit = async (item: EstatusCaso) => {
        try {
            const data = await fetchEstatusCasoById(item.id_estatus!, token);
            setEstatusCasoSeleccionado(data[0]);
            setFormErrors({});
            setEdit(true);
            setShowDrawer(true);
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo obtener la información del estatus.',
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
        setEstatusCasoSeleccionado(null)
    }

    const handleDelete = (item: EstatusCaso) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar el estatus "${item.descripcion}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                await deleteEstatusCaso(item.id_estatus, token);
                await getEstatusCasos();
                Swal.fire('Eliminado', 'El estatus ha sido eliminado.', 'success')
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
            if (!estatuscasoSeleccionado) {
                Swal.fire({
                    title: 'Error',
                    text: 'No se ha seleccionado un estatus para editar.',
                    icon: 'error',
                });
                return;
            }

            const update = await updateEstatusCaso({
                id_estatus: estatuscasoSeleccionado.id_estatus,
                descripcion: formValues.descripcion,
                id_empresa: Number(formValues.id_empresa),
            }, token);

            if ((update as any).estado !== false) {
                await getEstatusCasos();

                Swal.fire({
                    title: 'Registro Modificado',
                    text: 'Se ha modificado el registro.',
                    icon: 'success',
                });

                setFormValues({
                    id_estatus: 0,
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
            const newEntrie = await createEstatusCaso({
                descripcion: formValues.descripcion,
                id_empresa: Number(id_empresa),
            }, token);

            if ((newEntrie as any).estado !== false) {
                await getEstatusCasos();

                Swal.fire({
                    title: 'Registro exitoso',
                    text: 'Se ha creado un nuevo registro.',
                    icon: 'success',
                });

                setFormValues({
                    id_estatus: 0,
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
            <PageTitle title="EstatusCasos" />
            <Row>
                <Col xs={12}>
                    <Card>
                        <CardBody>
                            <div className="d-flex align-items-center mb-1">
                                <h4 className="header-title mb-0 me-2">Estatus por caso</h4>
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
                                    {(estatuscasoSeleccionado || !isEdit) && (
                                        <Form onSubmit={submit}>
                                            <div className="h-5 mt-40"></div>
                                            <h2 className="text-xl font-semibold text-gray-800 text-center">
                                                {isEdit ? "Editar Estatus" : "Crear Estatus"}
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

export default EstatuCasosPage
