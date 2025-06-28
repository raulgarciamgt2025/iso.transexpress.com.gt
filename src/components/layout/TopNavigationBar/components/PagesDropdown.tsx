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

  const { user } = useAuthContext()
  const { token , id_empresa } = user || {}



  return (
    <div className="topbar-item d-none d-md-flex">

    </div>
  )
}

export default PagesDropdown
