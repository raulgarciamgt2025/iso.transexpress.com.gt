import EmpresasPage from '@/app/pages/seguridad/empresas'
import MenuPage from '@/app/pages/seguridad/menu'
import ModulosPage from '@/app/pages/seguridad/modulo'
import OpcionPage from '@/app/pages/seguridad/opcion'
import RolesPage from '@/app/pages/seguridad/rol'
import RolOpcionPage from '@/app/pages/seguridad/rolOpcion'
import UsuarioPage from '@/app/pages/seguridad/usuario'
import UsuarioRolPage from '@/app/pages/seguridad/usuarioRol'
import { lazy } from 'react'
import { Navigate, RouteProps } from 'react-router-dom'

// auth
const Login = lazy(() => import('@/app/(other)/auth/login/page'))
const Register = lazy(() => import('@/app/(other)/auth/register/page'))
const Logout = lazy(() => import('@/app/(other)/auth/logout/page'))
const RecoverPassword = lazy(() => import('@/app/(other)/auth/recover-password/page'))
const CreatePassword = lazy(() => import('@/app/(other)/auth/create-password/page'))
const LockScreen = lazy(() => import('@/app/(other)/auth/lock-screen/page'))
const ConfirmMail = lazy(() => import('@/app/(other)/auth/confirm-mail/page'))
const LoginPin = lazy(() => import('@/app/(other)/auth/login-pin/page'))

//menu
const Dashboard = lazy(() => import('@/app/(admin)/menu/dashboard/page'))
const Email = lazy(() => import('@/app/(admin)/menu/email/page'))
const Calendar = lazy(() => import('@/app/(admin)/menu/calendar/page'))

// pages
const StarterPage = lazy(() => import('@/app/(admin)/pages/starter-page/page'))
const FaqPages = lazy(() => import('@/app/(admin)/pages/faq/page'))
const MaintenancePages = lazy(() => import('@/app/(other)/maintenance/page'))
const TimelinePages = lazy(() => import('@/app/(admin)/pages/timeline/page'))
const ComingSoonPage = lazy(() => import('@/app/(other)/coming-soon/page'))
const TermsConditions = lazy(() => import('@/app/(admin)/pages/terms-conditions/page'))
const Error404Alt = lazy(() => import('@/app/(admin)/pages/error-404-alt/page'))

// base ui
const Accordions = lazy(() => import('@/app/(admin)/ui/accordions/page'))
const Alerts = lazy(() => import('@/app/(admin)/ui/alerts/page'))
const Avatars = lazy(() => import('@/app/(admin)/ui/avatars/page'))
const Badges = lazy(() => import('@/app/(admin)/ui/badges/page'))
const Breadcrumb = lazy(() => import('@/app/(admin)/ui/breadcrumb/page'))
const Buttons = lazy(() => import('@/app/(admin)/ui/buttons/page'))
const Cards = lazy(() => import('@/app/(admin)/ui/cards/page'))
const Carousel = lazy(() => import('@/app/(admin)/ui/carousel/page'))
const Collapse = lazy(() => import('@/app/(admin)/ui/collapse/page'))
const Dropdowns = lazy(() => import('@/app/(admin)/ui/dropdowns/page'))
const Ratio = lazy(() => import('@/app/(admin)/ui/ratio/page'))
const Grid = lazy(() => import('@/app/(admin)/ui/grid/page'))
const Links = lazy(() => import('@/app/(admin)/ui/links/page'))
const ListGroup = lazy(() => import('@/app/(admin)/ui/list-group/page'))
const Modals = lazy(() => import('@/app/(admin)/ui/modals/page'))
const Notifications = lazy(() => import('@/app/(admin)/ui/notifications/page'))
const Offcanvas = lazy(() => import('@/app/(admin)/ui/offcanvas/page'))
const Placeholders = lazy(() => import('@/app/(admin)/ui/placeholders/page'))
const Pagination = lazy(() => import('@/app/(admin)/ui/pagination/page'))
const Popovers = lazy(() => import('@/app/(admin)/ui/popovers/page'))
const Progress = lazy(() => import('@/app/(admin)/ui/progress/page'))
const Spinners = lazy(() => import('@/app/(admin)/ui/spinners/page'))
const Tabs = lazy(() => import('@/app/(admin)/ui/tabs/page'))
const Tooltips = lazy(() => import('@/app/(admin)/ui/tooltips/page'))
const Typography = lazy(() => import('@/app/(admin)/ui/typography/page'))
const Utilities = lazy(() => import('@/app/(admin)/ui/utilities/page'))

// extended ui
const Dragula = lazy(() => import('@/app/(admin)/extended/dragula/page'))
const SweetAlert = lazy(() => import('@/app/(admin)/extended/sweet-alert/page'))
const Ratings = lazy(() => import('@/app/(admin)/extended/ratings/page'))
const Scrollbar = lazy(() => import('@/app/(admin)/extended/scrollbar/page'))

// icons
const Tabler = lazy(() => import('@/app/(admin)/icons/tabler/page'))
const Solar = lazy(() => import('@/app/(admin)/icons/solar/page'))

// charts
const AreaCharts = lazy(() => import('@/app/(admin)/charts/area/page'))
const BarCharts = lazy(() => import('@/app/(admin)/charts/bar/page'))
const BubbleCharts = lazy(() => import('@/app/(admin)/charts/bubble/page'))
const CandlestickCharts = lazy(() => import('@/app/(admin)/charts/candlestick/page'))
const ColumnCharts = lazy(() => import('@/app/(admin)/charts/column/page'))
const HeatmapCharts = lazy(() => import('@/app/(admin)/charts/heatmap/page'))
const LineCharts = lazy(() => import('@/app/(admin)/charts/line/page'))
const MixedCharts = lazy(() => import('@/app/(admin)/charts/mixed/page'))
const TimelineCharts = lazy(() => import('@/app/(admin)/charts/timeline/page'))
const BoxplotCharts = lazy(() => import('@/app/(admin)/charts/boxplot/page'))
const TreemapCharts = lazy(() => import('@/app/(admin)/charts/treemap/page'))
const PieCharts = lazy(() => import('@/app/(admin)/charts/pie/page'))
const RadarCharts = lazy(() => import('@/app/(admin)/charts/radar/page'))
const RadialBarCharts = lazy(() => import('@/app/(admin)/charts/radialBar/page'))
const ScatterCharts = lazy(() => import('@/app/(admin)/charts/scatter/page'))
const PolarCharts = lazy(() => import('@/app/(admin)/charts/polar/page'))
const SparklinesCharts = lazy(() => import('@/app/(admin)/charts/sparklines/page'))

// tables
const BasicTables = lazy(() => import('@/app/(admin)/tables/basic/page'))
const GridJsTables = lazy(() => import('@/app/(admin)/tables/gridJs/page'))

// maps
const GoogleMaps = lazy(() => import('@/app/(admin)/maps/google/page'))
const VectorMaps = lazy(() => import('@/app/(admin)/maps/vector/page'))
const LeafletMaps = lazy(() => import('@/app/(admin)/maps/leaflet/page'))

// forms
const BasicElements = lazy(() => import('@/app/(admin)/forms/basic/page'))
const Inputmask = lazy(() => import('@/app/(admin)/forms/inputmask/page'))
const Picker = lazy(() => import('@/app/(admin)/forms/picker/page'))
const Select = lazy(() => import('@/app/(admin)/forms/select/page'))
const Slider = lazy(() => import('@/app/(admin)/forms/slider/page'))
const Validation = lazy(() => import('@/app/(admin)/forms/validation/page'))
const Wizard = lazy(() => import('@/app/(admin)/forms/wizard/page'))
const FileUploads = lazy(() => import('@/app/(admin)/forms/file-uploads/page'))
const Editors = lazy(() => import('@/app/(admin)/forms/editors/page'))
const LayoutsForms = lazy(() => import('@/app/(admin)/forms/layouts/page'))

//layouts
const Horizontal = lazy(() => import('@/app/(other)/layouts/horizontal/page'))
const Compact = lazy(() => import('@/app/(other)/layouts/compact/page'))
const Detached = lazy(() => import('@/app/(other)/layouts/detached/page'))
const FullView = lazy(() => import('@/app/(other)/layouts/full-view/page'))
const FullScreenView = lazy(() => import('@/app/(other)/layouts/fullscreen-view/page'))
const HoverMenu = lazy(() => import('@/app/(other)/layouts/hover-menu/page'))
const IconMenu = lazy(() => import('@/app/(other)/layouts/icon-view/page'))
const DarkMode = lazy(() => import('@/app/(other)/layouts/dark-mode/page'))

// error
const Error401 = lazy(() => import('@/app/(other)/errors/error-401/page'))
const Error400 = lazy(() => import('@/app/(other)/errors/error-400/page'))
const Error403 = lazy(() => import('@/app/(other)/errors/error-403/page'))
const Error404 = lazy(() => import('@/app/(other)/errors/error-404/page'))
const Error500 = lazy(() => import('@/app/(other)/errors/error-500/page'))
const ServiceUnavailable = lazy(() => import('@/app/(other)/errors/service-unavailable/page'))

export type RoutesProps = {
  path: RouteProps['path']
  name: string
  element: RouteProps['element']
  exact?: boolean
}

const initialRoutes: RoutesProps[] = [
  {
    path: '/',
    name: 'root',
    element: <Navigate to="/menu/dashboard" />,
  },
]

// dashboards
const generalRoutes: RoutesProps[] = [
  {
    path: '/menu/dashboard',
    name: 'dashboard',
    element: <Dashboard />,
  },
  {
    path: '/menu/calendar',
    name: 'Calendar',
    element: <Calendar />,
  },
  {
    path: '/menu/email',
    name: 'Email',
    element: <Email />,
  },
]

// pages
const customPagesRoutes: RoutesProps[] = [
  {
    path: '/pages/starter-page',
    name: 'Starter Page',
    element: <StarterPage />,
  },
  {
    path: '/pages/faq',
    name: 'FAQ',
    element: <FaqPages />,
  },
  {
    path: '/pages/terms-conditions',
    name: 'Terms & Conditions',
    element: <TermsConditions />,
  },
  {
    path: '/pages/timeline',
    name: 'Timeline',
    element: <TimelinePages />,
  },
  {
    path: '/pages/error-404-alt',
    name: 'Error 404 Alt',
    element: <Error404Alt />,
  },
]

// ui
const uiRoutes: RoutesProps[] = [
  {
    path: '/modulo',
    name: 'Modulo',
    element: <ModulosPage />,
  },
  {
    path: '/rol',
    name: 'Rol',
    element: <RolesPage />,
  },
  {
    path: '/usuario',
    name: 'Usuario',
    element: <UsuarioPage />,
  },
  {
    path: '/empresa',
    name: 'Empresa',
    element: <EmpresasPage />,
  },
  {
    path: '/menu',
    name: 'Menu',
    element: <MenuPage />,
  },
  {
    path: '/opcion',
    name: 'Opciones',
    element: <OpcionPage />,
  },

  {
    path: '/rolOpcion',
    name: 'Rol Opcion',
    element: <RolOpcionPage />,
  },
  {
    path: '/rolusuario',
    name: 'Rol Usuario',
    element: <UsuarioRolPage />,
  },
  {
    path: '/menu/dashboard',
    name: 'Dashboard',
    element: <Dashboard />,
  },
  {
    path: '/ui/accordions',
    name: 'Accordions',
    element: <Accordions />,
  },
  {
    path: '/ui/alerts',
    name: 'Alerts',
    element: <Alerts />,
  },
  {
    path: '/ui/avatars',
    name: 'Avatars',
    element: <Avatars />,
  },
  {
    path: '/ui/badges',
    name: 'Badges',
    element: <Badges />,
  },
  {
    path: '/ui/breadcrumb',
    name: 'Breadcrumb',
    element: <Breadcrumb />,
  },
  {
    path: '/ui/buttons',
    name: 'Buttons',
    element: <Buttons />,
  },
  {
    path: '/ui/cards',
    name: 'Cards',
    element: <Cards />,
  },
  {
    path: '/ui/carousel',
    name: 'Carousel',
    element: <Carousel />,
  },
  {
    path: '/ui/collapse',
    name: 'Collapse',
    element: <Collapse />,
  },
  {
    path: '/ui/dropdowns',
    name: 'Dropdowns',
    element: <Dropdowns />,
  },
  {
    path: '/ui/ratio',
    name: 'Ratio',
    element: <Ratio />,
  },

  {
    path: '/ui/grid',
    name: 'Grid',
    element: <Grid />,
  },
  {
    path: '/ui/links',
    name: 'Links',
    element: <Links />,
  },
  {
    path: '/ui/list-group',
    name: 'List Group',
    element: <ListGroup />,
  },
  {
    path: '/ui/modals',
    name: 'Modals',
    element: <Modals />,
  },
  {
    path: '/ui/notifications',
    name: 'Notifications',
    element: <Notifications />,
  },
  {
    path: '/ui/offcanvas',
    name: 'Offcanvas',
    element: <Offcanvas />,
  },
  {
    path: '/ui/placeholders',
    name: 'Placeholders',
    element: <Placeholders />,
  },
  {
    path: '/ui/pagination',
    name: 'Pagination',
    element: <Pagination />,
  },
  {
    path: '/ui/popovers',
    name: 'Popovers',
    element: <Popovers />,
  },
  {
    path: '/ui/progress',
    name: 'Progress',
    element: <Progress />,
  },
  {
    path: '/ui/spinners',
    name: 'Spinners',
    element: <Spinners />,
  },
  {
    path: '/ui/tabs',
    name: 'Tabs',
    element: <Tabs />,
  },
  {
    path: '/ui/tooltips',
    name: 'Tooltips',
    element: <Tooltips />,
  },
  {
    path: '/ui/typography',
    name: 'Typography',
    element: <Typography />,
  },
  {
    path: '/ui/utilities',
    name: 'Utilities',
    element: <Utilities />,
  },
]

const iconsRoutes: RoutesProps[] = [
  {
    path: '/icons/tabler',
    name: 'Tabler',
    element: <Tabler />,
  },
  {
    path: '/icons/solar',
    name: 'Solar',
    element: <Solar />,
  },
]

const extendedRoutes: RoutesProps[] = [
  {
    path: '/extended/dragula',
    name: 'Dragula',
    element: <Dragula />,
  },
  {
    path: '/extended/sweet-alert',
    name: 'Sweet Alert',
    element: <SweetAlert />,
  },
  {
    path: '/extended/ratings',
    name: 'Ratings',
    element: <Ratings />,
  },
  {
    path: '/extended/scrollbar',
    name: 'Scrollbar',
    element: <Scrollbar />,
  },
]

const chartsRoutes: RoutesProps[] = [
  {
    path: '/charts/area',
    name: 'Area Charts',
    element: <AreaCharts />,
  },
  {
    path: '/charts/bar',
    name: 'Bar',
    element: <BarCharts />,
  },
  {
    path: '/charts/bubble',
    name: 'Bubble',
    element: <BubbleCharts />,
  },
  {
    path: '/charts/candlestick',
    name: 'Candlestick',
    element: <CandlestickCharts />,
  },
  {
    path: '/charts/column',
    name: 'Column',
    element: <ColumnCharts />,
  },
  {
    path: '/charts/heatmap',
    name: 'Heatmap',
    element: <HeatmapCharts />,
  },
  {
    path: '/charts/line',
    name: 'Line',
    element: <LineCharts />,
  },
  {
    path: '/charts/mixed',
    name: 'Mixed',
    element: <MixedCharts />,
  },
  {
    path: '/charts/timeline',
    name: 'Timeline',
    element: <TimelineCharts />,
  },
  {
    path: '/charts/boxplot',
    name: 'Boxplot',
    element: <BoxplotCharts />,
  },
  {
    path: '/charts/treemap',
    name: 'Treemap',
    element: <TreemapCharts />,
  },
  {
    path: '/charts/pie',
    name: 'Pie',
    element: <PieCharts />,
  },
  {
    path: '/charts/radar',
    name: 'Radar',
    element: <RadarCharts />,
  },
  {
    path: '/charts/radialBar',
    name: 'RadialBar',
    element: <RadialBarCharts />,
  },
  {
    path: '/charts/scatter',
    name: 'Scatter',
    element: <ScatterCharts />,
  },
  {
    path: '/charts/polar',
    name: 'Polar Area',
    element: <PolarCharts />,
  },
  {
    path: '/charts/sparklines',
    name: 'Sparklines',
    element: <SparklinesCharts />,
  },
]

const formsRoutes: RoutesProps[] = [
  {
    path: '/forms/basic',
    name: 'Basic Elements',
    element: <BasicElements />,
  },
  {
    path: '/forms/inputmask',
    name: 'Inputmask',
    element: <Inputmask />,
  },
  {
    path: '/forms/picker',
    name: 'Picker',
    element: <Picker />,
  },
  {
    path: '/forms/select',
    name: 'Select',
    element: <Select />,
  },
  {
    path: '/forms/slider',
    name: 'Range Slider',
    element: <Slider />,
  },
  {
    path: '/forms/validation',
    name: 'Validation',
    element: <Validation />,
  },
  {
    path: '/forms/wizard',
    name: 'Wizard',
    element: <Wizard />,
  },
  {
    path: '/forms/file-uploads',
    name: 'File Uploads',
    element: <FileUploads />,
  },
  {
    path: '/forms/editors',
    name: 'Editors',
    element: <Editors />,
  },
  {
    path: '/forms/layouts',
    name: 'Layouts',
    element: <LayoutsForms />,
  },
]

const tablesRoutes: RoutesProps[] = [
  {
    path: '/tables/basic-table',
    name: 'Basic Tables',
    element: <BasicTables />,
  },
  {
    path: '/tables/gridJs',
    name: 'GridJs Tables',
    element: <GridJsTables />,
  },
]

const mapsRoutes: RoutesProps[] = [
  {
    path: '/maps/google',
    name: 'Google Maps',
    element: <GoogleMaps />,
  },
  {
    path: '/maps/vector',
    name: 'Vector Maps',
    element: <VectorMaps />,
  },
  {
    path: '/maps/leaflet',
    name: 'Leaflet Maps',
    element: <LeafletMaps />,
  },
]

// auth
const authRoutes: RoutesProps[] = [
  {
    path: '/auth/login',
    name: 'Login',
    element: <Login />,
  },
  {
    path: '/auth/register',
    name: 'Register',
    element: <Register />,
  },
  {
    path: '/auth/logout',
    name: 'Logout',
    element: <Logout />,
  },
  {
    path: '/auth/recover-password',
    name: 'Recover Password',
    element: <RecoverPassword />,
  },
  {
    path: '/auth/create-password',
    name: 'Create Password',
    element: <CreatePassword />,
  },
  {
    path: '/auth/lock-screen',
    name: 'Lock Screen',
    element: <LockScreen />,
  },
  {
    path: '/auth/confirm-mail',
    name: 'Confirm Mail',
    element: <ConfirmMail />,
  },
  {
    path: '/auth/login-pin',
    name: 'Login with PIN',
    element: <LoginPin />,
  },
]

// public routes
const otherPublicRoutes: RoutesProps[] = [
  {
    path: '/errors/error-401',
    name: '401 Unauthorized',
    element: <Error401 />,
  },
  {
    path: '/errors/error-400',
    name: '400 Bad Reques',
    element: <Error400 />,
  },
  {
    path: '/coming-soon',
    name: 'Coming Soon',
    element: <ComingSoonPage />,
  },
  {
    path: '/errors/error-403',
    name: '403 Forbidden',
    element: <Error403 />,
  },
  {
    path: '/errors/error-404',
    name: '404 Not Found',
    element: <Error404 />,
  },
  {
    path: '/errors/error-500',
    name: '500 Internal Server',
    element: <Error500 />,
  },
  {
    path: '/errors/service-unavailable',
    name: 'Service Unavailable',
    element: <ServiceUnavailable />,
  },

  {
    path: '/maintenance',
    name: 'Maintenance',
    element: <MaintenancePages />,
  },
]

const layoutRoutes: RoutesProps[] = [
  {
    path: '/layouts/horizontal',
    name: 'Horizontal',
    element: <Horizontal />,
  },
  {
    path: '/layouts/compact',
    name: 'Compact',
    element: <Compact />,
  },
  {
    path: '/layouts/detached',
    name: 'Detached',
    element: <Detached />,
  },
  {
    path: '/layouts/full-view',
    name: 'Full-View',
    element: <FullView />,
  },
  {
    path: '/layouts/fullscreen-view',
    name: 'FullScreen-View',
    element: <FullScreenView />,
  },
  {
    path: '/layouts/hover-menu',
    name: 'Hover-Menu',
    element: <HoverMenu />,
  },
  {
    path: '/layouts/icon-view',
    name: 'Icon-view',
    element: <IconMenu />,
  },
  {
    path: '/layouts/dark-mode',
    name: 'Dark Mode',
    element: <DarkMode />,
  },
]

export const appRoutes = [
  ...initialRoutes,
  ...generalRoutes,
  ...uiRoutes,
  ...customPagesRoutes,
  ...iconsRoutes,
  ...extendedRoutes,
  ...chartsRoutes,
  ...formsRoutes,
  ...tablesRoutes,
  ...mapsRoutes,

]

export const publicRoutes = [...authRoutes, ...otherPublicRoutes, ...layoutRoutes,]
