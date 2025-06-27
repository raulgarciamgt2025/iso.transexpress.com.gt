import avatar1 from '@/assets/images/users/avatar-1.jpg'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useAuthContext } from '@/context/useAuthContext'
import { Dropdown, DropdownHeader, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

const ProfileDropdown = () => {
  const { removeSession, user } = useAuthContext()
  const navigate = useNavigate()
  const logout = () => {
    removeSession()
    navigate('/auth/logout')
  }
  return (
    <div className="topbar-item nav-user">
      <Dropdown align={'end'}>
        <DropdownToggle
          as={'a'}
          className="topbar-link drop-arrow-none px-2"
          data-bs-toggle="dropdown"
          data-bs-offset="0,19"
          type="button"
          aria-haspopup="false"
          aria-expanded="false">
          <img src={avatar1} width={32} className="rounded-circle me-lg-2 d-flex" alt="user-image" />
          <span className="d-lg-flex flex-column gap-1 d-none">
            <h5 className="my-0">{user?.firstName || 'Nombre Usuario'}</h5>
            <h6 className="my-0 fw-normal">{user?.email || 'Nombre Usuario'}</h6>
          </span>
          <IconifyIcon icon="tabler:chevron-down" className="d-none d-lg-block align-middle ms-2" />
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          <DropdownHeader className="noti-title">
            <h6 className="text-overflow m-0">Bienvenido!</h6>
          </DropdownHeader>
          <DropdownItem>
            <IconifyIcon icon="tabler:user-hexagon" className="me-1 fs-17 align-middle" />
            <span className="align-middle">Mi cuenta</span>
          </DropdownItem>
          <DropdownItem>
            <IconifyIcon icon="tabler:settings" className="me-1 fs-17 align-middle" />
            <span className="align-middle">Configuración</span>
          </DropdownItem>
          <DropdownItem>
            <IconifyIcon icon="tabler:lifebuoy" className="me-1 fs-17 align-middle" />
            <span className="align-middle">Soporte</span>
          </DropdownItem>
          <div className="dropdown-divider" />
          <DropdownItem onClick={logout} className="active fw-semibold text-danger">
            <IconifyIcon icon="tabler:logout" className="me-1 fs-17 align-middle" />
            <span className="align-middle">Salir sistema</span>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}

export default ProfileDropdown
