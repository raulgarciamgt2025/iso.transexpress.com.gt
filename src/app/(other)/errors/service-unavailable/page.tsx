import error503Img from '@/assets/images/error/error-503.png'
import logoDark from '@/assets/images/logo-dark.png'
import logo from '@/assets/images/logo-light.png'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { currentYear, developedBy } from '@/context/constants'
import { Card, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const ServiceUnavailablePage = () => {
  return (
    <>
      <div className="auth-bg d-flex min-vh-100 justify-content-center align-items-center">
        <Row className=" g-0 justify-content-center w-100 m-xxl-5 px-xxl-4 m-3">
          <Col xl={4} lg={5} md={6}>
            <div className="mb-4 text-center">
              <Link to="/menu/dashboard" className="auth-brand mb-3">
                <img src={logo} alt="logo light" height={24} className="logo-light" />
                <img src={logoDark} alt="dark logo" height={24} className="logo-dark" />
              </Link>
              <h5 className="fw-semibold mt-2 lh-base">Responsive Admin &amp; Dashboard Template</h5>
            </div>
            <Card className="card overflow-hidden text-center p-xxl-4 p-3 mb-0">
              <div className="mx-auto text-center">
                <img src={error503Img} alt="error 503 img" height={230} className="mb-2" />

                <h3 className="fw-bold mt-3 text-primary lh-base">Services Unavailable !</h3>
                <h4 className="fw-medium mt-2 text-dark lh-base">This site is temporarily down for improvements.</h4>
                <p className="text-muted mb-3">
                  The server is currently unable to handle the request due to temporary overload or maintenance. Please try again later.
                </p>
                <Link to="/menu/dashboard" className="btn btn-primary">
                  Back to Home <IconifyIcon icon="tabler:home" className="ms-1" />
                </Link>
              </div>
              <p className="mt-3 mb-0">
                {currentYear} © TransExpress - By <span className="fw-bold text-decoration-underline text-uppercase text-reset fs-12">Guatemala</span>
              </p>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  )
}

export default ServiceUnavailablePage
