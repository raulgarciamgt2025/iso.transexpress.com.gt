import logoDark from '@/assets/images/logo-dark.png'
import logo from '@/assets/images/logo-light.png'
import avatar1 from '@/assets/images/users/avatar-1.jpg'
import { currentYear } from '@/context/constants'
import { Card, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const LogoutPage = () => {
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
              <h4 className="fw-semibold mb-2 fs-18">You are Logged Out</h4>
              <div className="d-flex align-items-center gap-2 my-3 mx-auto">
                <img src={avatar1} alt="avatar" className="avatar-lg rounded-circle img-thumbnail" />

                <div>
                  <h4 className="fw-semibold text-dark">Hi ! Shreyu N.</h4>
                </div>
              </div>
              <div className="mb-3 text-start">
                <div className="bg-success-subtle p-3 rounded fst-italic fw-medium mb-0" role="alert">
                  <p className="mb-0 text-success">
                    You have been successfully logged out of your account. To continue using our services, please log in again with your credentials.
                    If you encounter any issues, feel free to contact our support team for assistance.
                  </p>
                </div>
              </div>
              <div className="d-grid">
                <button className="btn btn-primary fw-semibold" type="submit">
                  Support Center
                </button>
              </div>
              <p className="text-muted fs-14 my-3">
                Back to{' '}
                <Link to="/auth/login" className="text-danger fw-semibold ms-1">
                  Login !
                </Link>
              </p>
              <p className="mt-auto mb-0">
                {currentYear} © Flacto - By <span className="fw-bold text-decoration-underline text-uppercase text-reset fs-12">Coderthemes</span>
              </p>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  )
}

export default LogoutPage
