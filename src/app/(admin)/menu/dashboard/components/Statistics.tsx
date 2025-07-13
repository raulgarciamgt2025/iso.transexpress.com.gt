import IconifyIcon from '@/components/wrappers/IconifyIcon'
import ReactApexChart from 'react-apexcharts'
import { Card, CardBody, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap'
import { StatisticsChart } from '../data'

const Statistics = () => {
  return (
    <>
      <Col xl={4}>
        <Card>
          <CardBody>
            <div className="d-flex justify-content-between">
              <div>
                <h4 className="header-title mb-1">Statistics</h4>
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
            <Row className=" text-center">
              <div className="col-sm-4 mt-3">
                <h3 className="fw-bold">4,335</h3>
                <p className="text-muted text-overflow">Total Sales</p>
              </div>
              <div className="col-sm-4 mt-3">
                <h3 className="fw-bold">521</h3>
                <p className="text-muted text-overflow">Open Compaign</p>
              </div>
              <div className="col-sm-4 mt-3">
                <h3 className="fw-bold">2,548</h3>
                <p className="text-muted text-overflow">Total Sales</p>
              </div>
            </Row>
            <div dir="ltr">
              <div id="statistics-chart" className="apex-charts" data-colors="#fe8995,#fbca35">
                <ReactApexChart
                  height={298}
                  options={StatisticsChart}
                  series={StatisticsChart.series}
                  type="line"
                  className="apex-charts"
                  data-colors="#fe8995,#fbca35"
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
    </>
  )
}

export default Statistics
