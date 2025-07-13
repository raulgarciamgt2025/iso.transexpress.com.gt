import PageTitle from '@/components/PageTitle'
import { getAllDataTableRecords } from '@/helpers/data'
import AllDataTable from './components/AllDataTable'
import { useFetchData } from '@/hooks/useFetchData'

const GridJs = () => {
  const dataTableRecords = useFetchData(getAllDataTableRecords)
  return (
    <>
      <PageTitle title="Grid Js Tables" subTitle="Tables" />
      {dataTableRecords && <AllDataTable dataTableRecords={dataTableRecords} />}
    </>
  )
}

export default GridJs
