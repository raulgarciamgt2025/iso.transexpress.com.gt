import logoDark from '@/assets/images/logo-dark.png'
import logo from '@/assets/images/logo-light.png'
import { currentYear, developedBy } from '@/context/constants'
import LoginForm from './components/LoginForm'
import { Card, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const LoginPage = () => {
  return (
    <>
      <div className="auth-bg d-flex min-vh-100 justify-content-center align-items-center">
        <Row className=" g-0 justify-content-center w-100 m-xxl-5 px-xxl-4 m-3">
          <Col xl={4} lg={5} md={6}>
            <div className="mb-4 text-center">
              <Link to="/menu/dashboard" className="auth-brand mb-3">
                <img src={logoDark} alt="dark logo" height={66} className="logo-dark" />
                <img src={logo} alt="logo light" height={66} className="logo-light" />
              </Link>
              <h5 className="fw-semibold mt-2 lh-base">Sistema de documentación ISO</h5>
            </div>
            <Card className=" overflow-hidden text-center p-xxl-4 p-3 mb-0">
              <h4 className="fw-semibold mb-2 fs-18">Ingrese sus credenciales</h4>
              <p className="text-muted mb-4">Ingrese su email y contraseña para acceder al menu principal.</p>
              <LoginForm />
              <p className="text-muted fs-14 mb-4">
              </p>
              <p className="mt-auto mb-0">
                {currentYear} © TransExpress -
                <span className="fw-bold text-decoration-underline text-uppercase text-reset fs-12">Portal-ISO</span>
              </p>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  )
}

export default LoginPage
