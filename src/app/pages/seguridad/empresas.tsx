import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Row, Table, Spinner, Button, Form } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { fetchEmpresas, deleteEmpresa, fetchEmpresaById, createEmpresa, updateEmpresas, Empresa } from '@/servicios/empresaProvider'
import Swal from 'sweetalert2'
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import { useAuthContext } from '@/context/useAuthContext'
import DataTable, { TableColumn } from 'react-data-table-component'
import { BiEdit, BiPlus, BiTrash } from 'react-icons/bi'
import { useLayoutContext } from '@/context/useLayoutContext'

const EmpresasPage = () => {
    const { theme, changeTheme } = useLayoutContext()
    const isDark = theme === 'dark'
    const [empresas, setEmpresas] = useState<Empresa[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [showDrawer, setShowDrawer] = useState(false)
    const [empresaSeleccionada, setEmpresaSeleccionada] = useState<Empresa | null>(null)
    const [isEdit, setEdit] = useState(true)
    const { user } = useAuthContext()
    const { token } = user || {}
    const [search, setSearch] = useState('')

    const filteredEmpresas = empresas.filter(
        (emp) =>
            emp.nombre?.toLowerCase().includes(search.toLowerCase()) ||
            emp.direccion?.toLowerCase().includes(search.toLowerCase()) ||
            emp.contacto?.toLowerCase().includes(search.toLowerCase()) ||
            String(emp.id_empresa).includes(search)
    )

    const [formValues, setFormValues] = useState({
        id_empresa: 0,
        nombre: '',
        direccion: '',
        contacto: '',
    })

    const columns: TableColumn<Empresa>[] = [
        {
            name: 'ID',
            selector: row => row.id_empresa,
            sortable: true,
            width: '80px'
        },
        {
            name: 'Nombre',
            selector: row => row.nombre,
            sortable: true,
        },
        {
            name: 'Dirección',
            selector: row => row.direccion,
            sortable: true,
        },
        {
            name: 'Contacto',
            selector: row => row.contacto,
            sortable: true,
        },
        {
            name: 'Acciones',
            cell: (empresa) => (
                <div>
                    <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(empresa)}
                    >
                        <BiEdit className="me-1" />
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(empresa)}
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

        if (!formValues.nombre.trim()) {
            errors.nombre = "El nombre de la empresa es obligatorio.";
        }
        if (!formValues.direccion.trim()) {
            errors.direccion = "La dirección es obligatoria.";
        }
        if (!formValues.contacto.trim()) {
            errors.contacto = "El contacto es obligatorio.";
        }

        return errors;
    };

    const [formErrors, setFormErrors] = useState<{
        nombre?: string
        direccion?: string
        contacto?: string
    }>({})

    useEffect(() => {
        if (empresaSeleccionada) {
            setFormValues({
                id_empresa: empresaSeleccionada.id_empresa,
                nombre: empresaSeleccionada.nombre || '',
                direccion: empresaSeleccionada.direccion || '',
                contacto: empresaSeleccionada.contacto || '',
            })
            setFormErrors({})
        }
    }, [empresaSeleccionada])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormValues(prev => ({
            ...prev,
            [id]: value,
        }))
    }

    const handleCancel = () => {
        setShowDrawer(false)
        setEmpresaSeleccionada(null)
        setFormErrors({})
    }

    const handleCreate = () => {
        setEmpresaSeleccionada(null)
        setShowDrawer(true)
        setEdit(false)
        setFormValues({
            id_empresa: 0,
            nombre: '',
            direccion: '',
            contacto: '',
        })
        setFormErrors({})
    }

    useEffect(() => {
        const fetchData = async () => {
            await getEmpresas();
        };
        fetchData();
    }, [])

    const getEmpresas = async () => {
        fetchEmpresas(token)
            .then(data => setEmpresas(data))
            .catch(() => setError('Error al cargar empresas'))
            .finally(() => setLoading(false))
    }

    const handleEdit = async (empresa: Empresa) => {
        try {
            const data = await fetchEmpresaById(empresa.id_empresa, token);
            setEmpresaSeleccionada(data[0]);
            setFormErrors({});
            setEdit(true);
            setShowDrawer(true);
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo obtener la información de la empresa.',
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
        setEmpresaSeleccionada(null)
    }

    const handleDelete = (empresa: Empresa) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar la empresa "${empresa.nombre}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                await deleteEmpresa(empresa.id_empresa, token);
                await getEmpresas();
                Swal.fire('Eliminado', 'La empresa ha sido eliminada.', 'success')
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
            if (!empresaSeleccionada) {
                Swal.fire({
                    title: 'Error',
                    text: 'No se ha seleccionado una empresa para editar.',
                    icon: 'error',
                });
                return;
            }

            const update = await updateEmpresas({
                id_empresa: empresaSeleccionada.id_empresa,
                ...formValues,
            }, token);

            if ((update as any).estado !== false) {
                await getEmpresas();

                Swal.fire({
                    title: 'Registro Modificado',
                    text: 'Se ha modificado el registro.',
                    icon: 'success',
                });

                setFormValues({
                    id_empresa: 0,
                    nombre: "",
                    direccion: "",
                    contacto: "",
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
            const newEntrie = await createEmpresa({
                nombre: formValues.nombre,
                direccion: formValues.direccion,
                contacto: formValues.contacto,
            }, token);

            if ((newEntrie as any).estado !== false) {
                await getEmpresas();

                Swal.fire({
                    title: 'Registro exitoso',
                    text: 'Se ha creado un nuevo registro.',
                    icon: 'success',
                });

                setFormValues({
                    id_empresa: 0,
                    nombre: "",
                    direccion: "",
                    contacto: "",
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
            <PageTitle title="Empresas" />
            <Row>
                <Col xs={12}>
                    <Card>
                        <CardBody>
                            <div className="d-flex align-items-center mb-1">
                                <h4 className="header-title mb-0 me-2">Empresas</h4>
                                <Button variant="primary" size="sm" onClick={handleCreate}>
                                    <BiPlus size={20} className="me-1" onClick={handleGuardar} />
                                </Button>
                            </div>
                            <p className="text-muted">Gestión de empresas</p>

                            <input
                                type="text"
                                className="form-control mb-3"
                                placeholder="Buscar Empresa..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <DataTable
                                columns={columns}
                                data={filteredEmpresas}
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
                                    {(empresaSeleccionada || !isEdit) && (
                                        <Form onSubmit={submit}>
                                            <div className="h-5 mt-40"></div>
                                            <h2 className="text-xl font-semibold text-gray-800 text-center">
                                                {isEdit ? "Editar Empresa" : "Crear Empresa"}
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
                                                            id="nombre"
                                                            placeholder="Ingrese el nombre"
                                                            value={formValues.nombre}
                                                            onChange={handleInputChange}
                                                        />
                                                        {formErrors.nombre && (
                                                            <div className="text-danger small">{formErrors.nombre}</div>
                                                        )}
                                                    </Form.Group>
                                                </div>
                                                <div className="w-50">
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Dirección</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            id="direccion"
                                                            placeholder="Ingrese la dirección"
                                                            value={formValues.direccion}
                                                            onChange={handleInputChange}
                                                        />
                                                        {formErrors.direccion && (
                                                            <div className="text-danger small">{formErrors.direccion}</div>
                                                        )}
                                                    </Form.Group>
                                                </div>
                                            </div>

                                            <div className="d-flex gap-4">
                                                <div className="w-50">
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Contacto</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            id="contacto"
                                                            placeholder="Ingrese el contacto"
                                                            value={formValues.contacto}
                                                            onChange={handleInputChange}
                                                        />
                                                        {formErrors.contacto && (
                                                            <div className="text-danger small">{formErrors.contacto}</div>
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

export default EmpresasPage
