import Error404Alt from '@/assets/images/error/error-404.png'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import PageTitle from '@/components/PageTitle'
import { Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const Error404AltPage = () => {
  return (
    <>
      <PageTitle title="404 Error" subTitle="Pages" />
      <Row className="justify-content-center">
        <Col lg={4}>
          <div className="text-center">
            <img src={Error404Alt} height={230} alt="File not found Image" />
            <h4 className="text-uppercase text-danger mt-3">Page Not Found</h4>
            <p className="text-muted mt-3">
              It&apos;s looking like you may have taken a wrong turn. Don&apos;t worry... it happens to the best of us. Here&apos;s a little tip that
              might help you get back on track.
            </p>
            <Link className="btn btn-info mt-3" to="/menu/dashboard">
              <IconifyIcon icon="tabler:home" className="me-1" /> Return Home
            </Link>
          </div>
        </Col>
      </Row>
    </>
  )
}

export default Error404AltPage
