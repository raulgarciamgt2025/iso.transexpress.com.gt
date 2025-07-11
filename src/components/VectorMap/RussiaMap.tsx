import 'jsvectormap'
import 'jsvectormap/dist/maps/russia.js'

//components
import BaseVectorMap from './BaseVectorMap'

interface RussiaVectorMapProps {
  width?: string
  height?: string
  options?: any
}

const RussiaVectorMap = ({ width, height, options }: RussiaVectorMapProps) => {
  return (
    <>
      <BaseVectorMap width={width} height={height} options={options} />
    </>
  )
}

export default RussiaVectorMap
