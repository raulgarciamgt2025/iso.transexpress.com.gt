import IconifyIcon from '@/components/wrappers/IconifyIcon'
import ReactApexChart from 'react-apexcharts'
import { Card, CardBody, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap'
import { DatavVisits } from '../data'
import Error404Alt from '@/assets/images/error/error-404.png'
import kaleadashboard from '@/assets/images/dashboard.png'
import kalea from '@/assets/images/kalea.png'

const DailySales = () => {
  return (
    <>
      <Col xl={12}>
        <Card>
          <CardBody>
            <div className="d-flex justify-content-between">
              <div>
                <h4 className="header-title mb-0">Bienvenido</h4>
              </div>
            </div>
            <Row className="text-center">
              <img src={kaleadashboard} alt="File not found Image" />
            </Row>

          </CardBody>
        </Card>
      </Col>
    </>
  )
}

export default DailySales
