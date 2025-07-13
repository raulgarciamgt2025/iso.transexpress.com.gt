import { useAuthContext } from '@/context/useAuthContext'
import { useLayoutContext } from '@/context/useLayoutContext'
import AdminLayout from '@/layouts/AdminLayout'
import HorizontalLayout from '@/layouts/HorizontalLayout'
import OtherLayout from '@/layouts/OtherLayout'

import { appRoutes, publicRoutes } from '@/routes/index'
import { Navigate, Route, Routes, type RouteProps } from 'react-router-dom'

const AppRouter = (props: RouteProps) => {
  const { isAuthenticated } = useAuthContext()

  const { layoutOrientation } = useLayoutContext()

  return (
    <Routes>
      {publicRoutes.map((route, idx) => (
        <Route key={idx + route.name} path={route.path} element={<OtherLayout {...props}>{route.element}</OtherLayout>} />
      ))}

      {(appRoutes || []).map((route, idx) => (
        <Route
          key={idx + route.name}
          path={route.path}
          element={
            isAuthenticated ? (
              layoutOrientation == 'vertical' ? (
                <AdminLayout {...props}>{route.element}</AdminLayout>
              ) : (
                <HorizontalLayout {...props}>{route.element}</HorizontalLayout>
              )
            ) : (
              <Navigate
                to={{
                  pathname: '/auth/login',
                  search: 'redirectTo=' + route.path,
                }}
              />
            )
          }
        />
      ))}
    </Routes>
  )
}

export default AppRouter
