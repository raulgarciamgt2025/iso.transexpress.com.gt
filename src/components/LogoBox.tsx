import logoDark from '@/assets/images/logo-dark.png'
import logo from '@/assets/images/logo-light.png'
import logoSm from '@/assets/images/logo-sm.png'
import { Link } from 'react-router-dom'

const LogoBox = () => {
  return (
    <Link to="/menu/dashboard" className="logo">
      <span className="logo-light">
        <span className="logo-lg">
          <img src={logo} width={109} height={26} alt="logo" />
        </span>
        <span className="logo-sm">
          <img src={logoSm} width={21} height={20} alt="small logo" />
        </span>
      </span>
      <span className="logo-dark">
        <span className="logo-lg">
          <img src={logoDark} width={109} height={26} alt="dark logo" />
        </span>
        <span className="logo-sm">
          <img src={logoSm} width={21} height={20} alt="small logo" />
        </span>
      </span>
    </Link>
  )
}

export default LogoBox
