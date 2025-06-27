import american from '@/assets/images/cards/american-express.svg'
import discover from '@/assets/images/cards/discover-card.svg'
import mastercard from '@/assets/images/cards/mastercard.svg'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import ReactApexChart from 'react-apexcharts'
import { Card, CardBody, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap'
import { RevenueChart } from '../data'

const Revenue = () => {
  return (
    <>
      <Col xl={4}>
        <Card>
          <CardBody>
            <div className="d-flex justify-content-between">
              <div>
                <h4 className="header-title mb-1">Total Revenue</h4>
                <p className="text-muted">March 26 - April 01, 2024</p>
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
            <div className="my-2 d-flex align-items-center justify-content-between">
              <h3 className="fw-bold m-0">$21,459.56</h3>
              <div className="">
                <img src={american} alt="user-card" height={36} />&nbsp;
                <img src={discover} alt="user-card" height={36} />&nbsp;
                <img src={mastercard} alt="user-card" height={36} />
              </div>
            </div>
            <div dir="ltr">
              <div id="daily-sales" className="apex-charts" data-colors="#fe8995,#dddddd">
                <ReactApexChart
                  height={300}
                  options={RevenueChart}
                  series={RevenueChart.series}
                  type="line"
                  className="apex-charts"
                  data-colors="#6ac75a,#465dff,#783bff,#f7577e"
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
    </>
  )
}

export default Revenue
