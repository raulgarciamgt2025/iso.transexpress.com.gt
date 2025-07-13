import { currentYear } from '@/context/constants'
import { Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <>
      <footer className="footer">
        <div className="page-container">
          <Row>
            <Col md={6} className=" text-center text-md-start">
              {currentYear} © TransExpress Guatemala -
              <span className="fw-bold text-decoration-underline text-uppercase text-reset fs-12">www.transexpress.com.gt</span>
            </Col>
            <Col md={6}>
              <div className="text-md-end footer-links d-none d-md-block">
                <Link to="">Acerca de nosotros</Link>
                <Link to="">Soporte</Link>
                <Link to="">Contactenos</Link>
              </div>
            </Col>
          </Row>
        </div>
      </footer>
    </>
  )
}

export default Footer
