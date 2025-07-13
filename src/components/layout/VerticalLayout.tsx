import { ChildrenType } from '@/types/component-props'
import { Suspense } from 'react'
import FallbackLoading from '../FallbackLoading'
import Footer from './Footer'
import TopNavigationBarPage from './TopNavigationBar/page'
import VerticalNavigationBar from './VerticalNavigationBar/page'

const VerticalLayout = ({ children }: ChildrenType) => {
  return (
    <div className="wrapper">
      <Suspense>
        <TopNavigationBarPage />
      </Suspense>

      <Suspense fallback={<FallbackLoading />}>
        <VerticalNavigationBar />
      </Suspense>

      <div className="page-content">
        <div className="container-fluid">{children}</div>
        <Footer />
      </div>
    </div>
  )
}

export default VerticalLayout