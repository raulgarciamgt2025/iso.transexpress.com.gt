import logoDark from '@/assets/images/logo-dark.png'
import logo from '@/assets/images/logo-light.png'
import { currentYear, developedBy } from '@/context/constants'
import { Card, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const LoginPinPage = () => {
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
              <h4 className="fw-semibold mb-2 fs-20">Login With Pin</h4>
              <p className="text-muted mb-4">
                We sent you a code, please enter it below to verify <br />
                your number <span className="text-primary fw-medium">+ (12) 345-678-912</span>
              </p>
              <form action="" className="text-start mb-3">
                <label className="form-label" htmlFor="code">
                  Enter 6 Digit Code
                </label>
                <div className="d-flex gap-2 mt-1 mb-3">
                  <input type="text" maxLength={1} className="form-control text-center" />
                  <input type="text" maxLength={1} className="form-control text-center" />
                  <input type="text" maxLength={1} className="form-control text-center" />
                  <input type="text" maxLength={1} className="form-control text-center" />
                  <input type="text" maxLength={1} className="form-control text-center" />
                  <input type="text" maxLength={1} className="form-control text-center" />
                </div>
                <div className="mb-3 d-grid">
                  <button className="btn btn-primary" type="submit">
                    Continue
                  </button>
                </div>
                <p className="mb-0 text-center">
                  Don&apos;t received code yet?{' '}
                  <Link to="" className="link-primary fw-semibold text-decoration-underline">
                    Send Again
                  </Link>
                </p>
              </form>
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

export default LoginPinPage
