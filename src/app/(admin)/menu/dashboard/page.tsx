import PageTitle from '@/components/PageTitle'
import { Row } from 'react-bootstrap'
import DailySales from './components/DailySales'
import NewSignup from './components/NewSignup'
import Revenue from './components/Revenue'
import Stat from './components/Stat'
import Statistics from './components/Statistics'
import VisitorTraffics from './components/VisitorTraffics'
import ImageSlider from '@/app/(admin)/menu/dashboard/components/ImageSlider.tsx'

const MenuPage = () => {
  return (
    <>
      <PageTitle title="Inicio" subTitle="" />

      <Row>
        <ImageSlider />
      </Row>

      <Row>
      </Row>

    </>
  )
}

export default MenuPage
