import IconifyIcon from '@/components/wrappers/IconifyIcon'
import ReactApexChart from 'react-apexcharts'
import { Card, CardBody, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap'
import { DatavVisits } from '../data'

const DailySales = () => {
  return (
    <>
      <Col xl={4}>
        <Card>
          <CardBody>
            <div className="d-flex justify-content-between">
              <div>
                <h4 className="header-title mb-0">Daily Sales</h4>
              </div>
              <Dropdown>
                <DropdownToggle as={'a'} className="drop-arrow-none card-drop" data-bs-toggle="dropdown" aria-expanded="false">
                  <IconifyIcon icon="tabler:dots-vertical" className="ti" />
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-end">
                  <DropdownItem>Sales Report</DropdownItem>
                  <DropdownItem>Export Report</DropdownItem>
                  <DropdownItem>Profit</DropdownItem>
                  <DropdownItem>Action</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
            <Row className="text-center">
              <div className="col mt-3">
                <h3 className="fw-bold">8,952</h3>
                <p className="text-muted text-overflow">Electronics</p>
              </div>
              <div className="col mt-3">
                <h3 className="fw-bold">4,890</h3>
                <p className="text-muted text-overflow">Groceries</p>
              </div>
            </Row>
            <div dir="ltr">
              <div id="data-visits-chart" className="apex-charts" data-colors="#fe6271,#ff8392,#ffa5b3,#ffd2d7">
                <ReactApexChart height={300} options={DatavVisits} series={DatavVisits.series} type="donut" className="apex-charts" />
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
    </>
  )
}

export default DailySales
