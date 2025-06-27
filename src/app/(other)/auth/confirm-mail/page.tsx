import logoDark from '@/assets/images/logo-dark.png'
import logo from '@/assets/images/logo-light.png'
import { currentYear, developedBy } from '@/context/constants'
import ConfirmMailForm from './Components/ConfirmMailForm'
import { Card, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const ConfirmMailPage = () => {
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
              <h4 className="fw-semibold mb-2 fs-20">Verify Your Account</h4>
              <p className="text-muted mb-4">Please enter the 6-digit code sent to abc@xyz.com to proceed </p>
              <ConfirmMailForm />
              <p className="text-muted fs-14 mb-4">
                Back To{' '}
                <Link to="/menu/dashboard" className="fw-semibold text-danger ms-1">
                  Home!
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

export default ConfirmMailPage
