import FallbackLoading from '@/components/FallbackLoading'
import LogoBox from '@/components/LogoBox'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import SimplebarReactClient from '@/components/wrappers/SimplebarReactClient'
import { useLayoutContext } from '@/context/useLayoutContext'
import { getMenuItems } from '@/helpers/Manu'
import { lazy, Suspense } from 'react'
import { Button } from 'react-bootstrap'
import HoverMenuToggle from './components/HoverMenuToggle'
import { useAuthContext } from '@/context/useAuthContext'
import { MenuItemType } from '../../../types/menu'

const AppMenu = lazy(() => import('./components/AppMenu'))

const VerticalNavigationBar = () => {
  const { toggleBackdrop } = useLayoutContext()
  const {  user } = useAuthContext()
  const { accesos } = user;
  
  const menuAccesos: MenuItemType[] = eval(accesos) || [];

  const menuItems = menuAccesos
  return (
    <div className="sidenav-menu" id="leftside-menu-container">
      <LogoBox />
      <HoverMenuToggle />
      <button onClick={toggleBackdrop} className="button-close-fullsidebar">
        <span>
          <IconifyIcon icon="tabler:x" className="align-middle" />
        </span>
      </button>
      <SimplebarReactClient>
        <Suspense fallback={<FallbackLoading />}>
          <AppMenu menuItems={menuItems} />
          <div className="clearfix" />
        </Suspense>
      </SimplebarReactClient>
    </div>
  )
}

export default VerticalNavigationBar
