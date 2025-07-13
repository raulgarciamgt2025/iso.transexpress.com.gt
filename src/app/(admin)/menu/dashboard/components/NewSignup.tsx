import avatar1 from '@/assets/images/users/avatar-1.jpg'
import avatar2 from '@/assets/images/users/avatar-2.jpg'
import avatar3 from '@/assets/images/users/avatar-3.jpg'
import avatar4 from '@/assets/images/users/avatar-4.jpg'
import avatar5 from '@/assets/images/users/avatar-5.jpg'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Card, CardBody, CardFooter, CardHeader, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Pagination, Table } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const NewSignup = () => {
  return (
    <>
      <Col xl={5}>
        <Card className=" card-h-100">
          <CardHeader className="d-flex flex-wrap align-items-center gap-2">
            <h4 className="header-title me-auto">Recent New Signup</h4>
            <div className="d-flex gap-2 justify-content-end text-end">
              <Link to="" className="btn btn-sm btn-light">
                Import <IconifyIcon icon="tabler:download" className="ti  ms-1" />
              </Link>
              <Link to="" className="btn btn-sm btn-primary">
                Export <IconifyIcon icon="tabler:file-export" className="ti ms-1" />
              </Link>
            </div>
          </CardHeader>
          <CardBody className=" p-0">
            <div className="table-responsive">
              <Table className="table-custom table-centered table-sm table-nowrap table-hover mb-0">
                <thead className="bg-light bg-opacity-50">
                  <tr>
                    <th className="fs-12 text-muted text-uppercase">Name</th>
                    <th className="fs-12 text-muted text-uppercase">Email</th>
                    <th className="fs-12 text-muted text-uppercase">Role</th>
                    <th className="fs-12 text-muted text-uppercase">Status</th>
                    <th className="fs-12 text-muted text-uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-md flex-shrink-0 me-2">
                          <span className="avatar-title bg-primary-subtle rounded-circle">
                            <img src={avatar1} alt="" height={22} className="rounded-circle" />
                          </span>
                        </div>
                        <div>
                          <h5 className="fs-14 mt-1">John Doe</h5>
                        </div>
                      </div>
                    </td>
                    <td>
                      <h5 className="fs-14 mt-1 fw-normal">john.doe@example.com</h5>
                    </td>
                    <td>
                      <h5 className="fs-14 mt-1 fw-normal">Administrator</h5>
                    </td>
                    <td>
                      <h5 className="fs-14 mt-1 fw-normal">
                        <IconifyIcon icon="tabler:circle-filled" className="tifs-12 text-success" />
                        &nbsp; Active
                      </h5>
                    </td>
                    <td style={{ width: 30 }}>
                      <Dropdown>
                        <DropdownToggle as={'a'} className="text-muted drop-arrow-none card-drop p-0" data-bs-toggle="dropdown" aria-expanded="false">
                          <IconifyIcon icon="tabler:dots-vertical" className="ti" />
                        </DropdownToggle>
                        <DropdownMenu className="dropdown-menu-end">
                          <DropdownItem>View Profile</DropdownItem>
                          <DropdownItem>Deactivate</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-md flex-shrink-0 me-2">
                          <span className="avatar-title bg-info-subtle rounded-circle">
                            <img src={avatar2} alt="" height={22} className="rounded-circle" />
                          </span>
                        </div>
                        <div>
                          <h5 className="fs-14 mt-1">Jane Smith</h5>
                        </div>
                      </div>
                    </td>
                    <td>
                      <h5 className="fs-14 mt-1 fw-normal">jane.smith@example.com</h5>
                    </td>
                    <td>
                      <h5 className="fs-14 mt-1 fw-normal">Editor</h5>
                    </td>
                    <td>
                      <h5 className="fs-14 mt-1 fw-normal">
                        <IconifyIcon icon="tabler:circle-filled" className="ti  fs-12 text-warning" />
                        &nbsp; Pending
                      </h5>
                    </td>
                    <td style={{ width: 30 }}>
                      <Dropdown>
                        <DropdownToggle as={'a'} className="text-muted drop-arrow-none card-drop p-0" data-bs-toggle="dropdown" aria-expanded="false">
                          <IconifyIcon icon="tabler:dots-vertical" className="ti" />
                        </DropdownToggle>
                        <DropdownMenu className="dropdown-menu-end">
                          <DropdownItem>View Profile</DropdownItem>
                          <DropdownItem>Deactivate</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-md flex-shrink-0 me-2">
                          <span className="avatar-title bg-secondary-subtle rounded-circle">
                            <img src={avatar3} alt="" height={22} className="rounded-circle" />
                          </span>
                        </div>
                        <div>
                          <h5 className="fs-14 mt-1">Michael Brown</h5>
                        </div>
                      </div>
                    </td>
                    <td>
                      <h5 className="fs-14 mt-1 fw-normal">michael.brown@example.com</h5>
                    </td>
                    <td>
                      <h5 className="fs-14 mt-1 fw-normal">Viewer</h5>
                    </td>
                    <td>
                      <h5 className="fs-14 mt-1 fw-normal">
                        <IconifyIcon icon="tabler:circle-filled" className="ti  fs-12 text-danger" />
                        &nbsp; Inactive
                      </h5>
                    </td>
                    <td style={{ width: 30 }}>
                      <Dropdown>
                        <DropdownToggle as={'a'} className="text-muted drop-arrow-none card-drop p-0" data-bs-toggle="dropdown" aria-expanded="false">
                          <IconifyIcon icon="tabler:dots-vertical" className="ti" />
                        </DropdownToggle>
                        <DropdownMenu className="dropdown-menu-end">
                          <DropdownItem>View Profile</DropdownItem>
                          <DropdownItem>Deactivate</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-md flex-shrink-0 me-2">
                          <span className="avatar-title bg-warning-subtle rounded-circle">
                            <img src={avatar4} alt="" height={22} className="rounded-circle" />
                          </span>
                        </div>
                        <div>
                          <h5 className="fs-14 mt-1">Emily Davis</h5>
                        </div>
                      </div>
                    </td>
                    <td>
                      <h5 className="fs-14 mt-1 fw-normal">emily.davis@example.com</h5>
                    </td>
                    <td>
                      <h5 className="fs-14 mt-1 fw-normal">Manager</h5>
                    </td>
                    <td>
                      <h5 className="fs-14 mt-1 fw-normal">
                        <IconifyIcon icon="tabler:circle-filled" className="ti fs-12 text-success" />
                        &nbsp; Active
                      </h5>
                    </td>
                    <td style={{ width: 30 }}>
                      <Dropdown>
                        <DropdownToggle as={'a'} className="text-muted drop-arrow-none card-drop p-0" data-bs-toggle="dropdown" aria-expanded="false">
                          <IconifyIcon icon="tabler:dots-vertical" className="ti" />
                        </DropdownToggle>
                        <DropdownMenu className="dropdown-menu-end">
                          <DropdownItem>View Profile</DropdownItem>
                          <DropdownItem>Deactivate</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-md flex-shrink-0 me-2">
                          <span className="avatar-title bg-danger-subtle rounded-circle">
                            <img src={avatar5} alt="" height={22} className="rounded-circle" />
                          </span>
                        </div>
                        <div>
                          <h5 className="fs-14 mt-1">Robert Taylor</h5>
                        </div>
                      </div>
                    </td>
                    <td>
                      <h5 className="fs-14 mt-1 fw-normal">robert.taylor@example.com</h5>
                    </td>
                    <td>
                      <h5 className="fs-14 mt-1 fw-normal">Support</h5>
                    </td>
                    <td>
                      <h5 className="fs-14 mt-1 fw-normal">
                        <IconifyIcon icon="tabler:circle-filled" className="ti  fs-12 text-warning" />
                        &nbsp; Pending
                      </h5>
                    </td>
                    <td style={{ width: 30 }}>
                      <Dropdown>
                        <DropdownToggle as={'a'} className="text-muted drop-arrow-none card-drop p-0" data-bs-toggle="dropdown" aria-expanded="false">
                          <IconifyIcon icon="tabler:dots-vertical" className="ti" />
                        </DropdownToggle>
                        <DropdownMenu className="dropdown-menu-end">
                          <DropdownItem>View Profile</DropdownItem>
                          <DropdownItem>Deactivate</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </CardBody>
          <CardFooter>
            <div className="align-items-center justify-content-between row text-center text-sm-start">
              <div className="col-sm">
                <div className="text-muted">
                  Showing <span className="fw-semibold">5</span> of
                  <span className="fw-semibold">10</span> Results
                </div>
              </div>
              <div className="col-sm-auto mt-3 mt-sm-0">
                <Pagination className="pagination-boxed pagination-sm mb-0 justify-content-center">
                  <Pagination.Item className=" disabled">
                    <IconifyIcon icon="tabler:chevron-left" className="ti " />
                  </Pagination.Item>
                  <Pagination.Item className=" active">
                    1
                  </Pagination.Item>
                  <Pagination.Item>
                    2
                  </Pagination.Item>
                  <Pagination.Item>
                    <IconifyIcon icon="tabler:chevron-right" className="ti " />
                  </Pagination.Item>
                </Pagination>
              </div>
            </div>
          </CardFooter>
        </Card>
      </Col>
    </>
  )
}

export default NewSignup
