import logoDark from '@/assets/images/logo-dark.png'
import logo from '@/assets/images/logo-light.png'
import avatar1 from '@/assets/images/users/avatar-1.jpg'
import { currentYear, developedBy } from '@/context/constants'
import LockScreenForm from './components/LockScreenForm'
import { Card, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const LockScreenPage = () => {
  return (
    <>
      <div className="auth-bg d-flex min-vh-100 justify-content-center align-items-center">
        <Row className=" g-0 justify-content-center w-100 m-xxl-5 px-xxl-4 m-3">
          <Col xl={4} lg={5} md={6}>
            <div className="mb-4 text-center">
              <Link to="/menu/dashboard" className="auth-brand mb-3">
                <img src={logoDark} alt="dark logo" height={26} className="logo-dark" />
                <img src={logo} alt="logo light" height={26} className="logo-light" />
              </Link>
              <h5 className="fw-semibold mt-2 lh-base">Responsive Admin &amp; Dashboard Template</h5>
            </div>
            <Card className=" overflow-hidden text-center p-xxl-4 p-3 mb-0">
              <div className="text-center">
                <img src={avatar1} alt="avatar" className="avatar-xl rounded img-thumbnail" />

                <div className="mt-2 mb-3">
                  <h4 className="fw-semibold text-dark">Hi ! Shreyu N.</h4>
                  <p className="mb-0 fst-italic">Please input your password to access the screen. </p>
                </div>
              </div>
              <LockScreenForm />
              <p className="text-muted fs-14 mb-4">
                Back To{' '}
                <Link to="/auth/login" className="fw-semibold text-danger ms-1">
                  Login !
                </Link>
              </p>
              <p className="mt-auto mb-0">
                {currentYear} © Flacto - By <span className="fw-bold text-decoration-underline text-uppercase text-reset fs-12">{developedBy}</span>
              </p>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  )
}

export default LockScreenPage
