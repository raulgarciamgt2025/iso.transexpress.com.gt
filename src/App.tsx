import AppProvidersWrapper from './components/wrappers/AppProvidersWrapper'
import configureFakeBackend from './helpers/fake-backend'
import AppRouter from './routes/router'
import { FormProvider } from "@/utils/formContext";
import 'flatpickr/dist/flatpickr.min.css'
import '@/assets/scss/app.scss'

configureFakeBackend()

function App() {
  return (
    <>
      <AppProvidersWrapper>
        <FormProvider>
          <AppRouter />
        </FormProvider>
      </AppProvidersWrapper>
    </>
  )
}

export default App
