import 'jsvectormap'
import 'jsvectormap/dist/maps/italy.js'

//components
import BaseVectorMap from './BaseVectorMap'

interface ItalyVectorMapProps {
  width?: string
  height?: string
  options?: any
}

const ItalyVectorMap = ({ width, height, options }: ItalyVectorMapProps) => {
  return (
    <>
      <BaseVectorMap width={width} height={height} options={options} />
    </>
  )
}

export default ItalyVectorMap
