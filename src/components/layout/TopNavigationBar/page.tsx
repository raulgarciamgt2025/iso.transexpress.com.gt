import LogoBox from '@/components/LogoBox'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Suspense } from 'react'
import Apps from './components/Apps'
import Country from './components/Country'
import Notifications from './components/Notifications'
import PagesDropdown from './components/PagesDropdown'
import ProfileDropdown from './components/ProfileDropdown'
import ThemeCustomizerToggle from './components/ThemeCustomizerToggle'
import ThemeModeToggle from './components/ThemeModeToggle'
import LeftSideBarToggle from './components/LeftSideBarToggle'
import FallbackLoading from '@/components/FallbackLoading'
import SearchBox from './components/SearchBox'

const TopNavigationBarPage = () => {
  return (
    <header className="app-topbar">
      <div className="page-container topbar-menu">
        <div className="d-flex align-items-center gap-2">
          <LogoBox />
          <LeftSideBarToggle />
          <PagesDropdown />
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="topbar-item d-flex d-xl-none">
            <button className="topbar-link" data-bs-toggle="modal" data-bs-target="#searchModal" type="button">
              <IconifyIcon icon="tabler:search" className="fs-22" />
            </button>
          </div>
          <Suspense fallback={<FallbackLoading />}>
            <Notifications />
          </Suspense>
          <Apps />
          <ThemeCustomizerToggle />
          <ThemeModeToggle />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  )
}

export default TopNavigationBarPage
