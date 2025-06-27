import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Col, Dropdown, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap'
import { applicationsPagesData, uiComponentPageData } from '../data'
import { Link, Navigate } from 'react-router-dom'
import { options } from '@/components/form/data.ts'
import Select from 'react-select'
import ChoicesFormInput from '@/components/form/ChoicesFormInput.tsx'
import { API_URL } from "../../../../configs/apiConfig";
import { useAuthContext } from '@/context/useAuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect,useState } from 'react'

const PagesDropdown = () => {
  const navigate = useNavigate()
  const [opciones, setOpciones] = useState<{ value: string; label: string }[]>([])
  const [selectedEmpresa, setSelectedEmpresa] = useState('')

  const { user } = useAuthContext()
  const { token , id_empresa } = user || {}

  const fetchEmpresas = async () => {
    try {
      const response = await fetch(`${API_URL}Empresa/login`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error('Error fetching empresas');
      }

      const empresas = await response.json();
      return empresas;
    } catch (error) {
      console.error('Error fetching empresas:', error);
      return { estado: false, mensaje: 'Error al cargar las empresas', data: [] };
    }
  }
useEffect(() => {
  setSelectedEmpresa(id_empresa || '')
}, [id_empresa])
  useEffect(() => {
    const fetchData = async () => {
      const empresas = await fetchEmpresas();
      if (empresas.estado) {
        const opts = empresas.data.map((empresa: any) => ({
          value: empresa.id_empresa,
          label: empresa.nombre,
        }));
        setOpciones(opts);
      } else {
        console.error(empresas.mensaje);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEmpresa(e.target.value)
    user.id_empresa = e.target.value
    navigate('/menu/dashboard')
  }

  return (
    <div className="topbar-item d-none d-md-flex">
      <select
        className="form-select"
        id="id_empresa"
        value={selectedEmpresa}
        onChange={handleInputChange}
      >
        <option value="">Seleccione una empresa</option>
        {opciones.map((empresa) => (
          <option key={empresa.value} value={empresa.value}>
            {empresa.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default PagesDropdown
