import maintenanceImg from '@/assets/images/error/maintenance.svg'
import logoDark from '@/assets/images/logo-dark.png'
import logo from '@/assets/images/logo-light.png'
import { Card, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const MaintenancePage = () => {
  return (
    <>
      <div className="auth-bg d-flex min-vh-100 justify-content-center align-items-center">
        <Row className=" g-0 justify-content-center w-100 m-xxl-5 px-xxl-4 m-3">
          <Col xl={4} lg={5} md={6}>
            <div className="mb-4 text-center">
              <Link to="/menu/dashboard" className="auth-brand">
                <img src={logoDark} alt="dark logo" height={26} className="logo-dark" />
                <img src={logo} alt="logo light" height={26} className="logo-light" />
              </Link>
              <h5 className="fw-semibold mt-2 lh-base">Responsive Admin &amp; Dashboard Template</h5>
            </div>
            <Card className=" text-center p-xxl-4 p-3 mb-0">
              <div className="px-5">
                <img src={maintenanceImg} alt="" className="img-fluid" />
              </div>
              <h5 className="fw-semibold my-3 fs-20 text-dark lh-base">We are under scheduled maintenance</h5>
              <Link to="/menu/dashboard" className="btn btn-primary fw-semibold">
                Contact Site Owner
              </Link>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  )
}

export default MaintenancePage
