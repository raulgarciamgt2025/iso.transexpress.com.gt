import { Card, CardBody, Col } from 'react-bootstrap'
import { statData, StatType } from '../data'

const StatCard = ({ title, image, description, change, variant }: StatType) => {
  return (
    <>
      <Card>
        <CardBody>
          <div className="d-flex">
            <img src={image} className="avatar-lg rounded-circle me-3 align-self-center" alt="user" />
            <div className="flex-grow-1">
              <h5 className="fs-14 mb-1">{title}</h5>
              <p className="mb-1 font-13 text-truncate">{description}</p>
              <small className={`text-${variant}`}>
                <b>{change} </b>
              </small>
            </div>
          </div>
        </CardBody>
      </Card>
    </>
  )
}

const Stat = () => {
  return (
    <>
      {statData.map((item, idx) => {
        return (
          <Col key={idx} md={3}>
            <StatCard {...item} />
          </Col>
        )
      })}
    </>
  )
}

export default Stat
