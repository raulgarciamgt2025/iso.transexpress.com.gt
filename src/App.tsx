import AppProvidersWrapper from './components/wrappers/AppProvidersWrapper'
import ErrorBoundary from './components/ErrorBoundary'
import configureFakeBackend from './helpers/fake-backend'
import AppRouter from './routes/router'
import { FormProvider } from "@/utils/formContext";
import 'flatpickr/dist/flatpickr.min.css'
import '@/assets/scss/app.scss'

configureFakeBackend()

function App() {
  return (
    <ErrorBoundary>
      <AppProvidersWrapper>
        <FormProvider>
          <AppRouter />
        </FormProvider>
      </AppProvidersWrapper>
    </ErrorBoundary>
  )
}

export default App
