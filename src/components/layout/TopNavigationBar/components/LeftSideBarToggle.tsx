import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useLayoutContext } from '@/context/useLayoutContext'
import useViewPort from '@/hooks/useViewPort'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const LeftSideBarToggle = () => {
  const {
    menu: { size },
    changeMenu: { size: changeMenuSize },
    toggleBackdrop, layoutOrientation, horizontalMenu
  } = useLayoutContext()
  const pathname = useLocation()


  const { width } = useViewPort()

  const handleMenuSize = () => {
    if (size === 'full') toggleBackdrop()
    if (size === 'condensed') changeMenuSize('default')
    if (size === 'fullscreen') changeMenuSize('default')
    if (size === 'compact') changeMenuSize('condensed')
    else if (size === 'default') changeMenuSize('condensed')
  }

  useEffect(() => {
    if (width <= 768) {
      if (size !== 'full') changeMenuSize('full')
    } else if (width <= 1140) {
      if (size !== 'condensed') changeMenuSize('condensed')
    } else if (width <= 1140) {
      if (size !== 'condensed') changeMenuSize('condensed')
    }
  }, [width, pathname])

  return (
    <>
      {
        layoutOrientation == 'horizontal' &&
        <button onClick={horizontalMenu.toggle} className="topnav-toggle-button px-2">
          <IconifyIcon icon="tabler:menu-2" className="fs-24" />
        </button>
      }
      <button onClick={handleMenuSize} className="sidenav-toggle-button px-2">
        <IconifyIcon icon="tabler:menu-2" className="fs-24" />
      </button>
    </>
  )
}

export default LeftSideBarToggle
