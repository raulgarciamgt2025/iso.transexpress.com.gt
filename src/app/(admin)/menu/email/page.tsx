import PageTitle from '@/components/PageTitle'
import { Card } from 'react-bootstrap'
import EmailArea from './components/EmailArea'
import { EmailProvider } from '@/context/useEmailContext'

const EmailPage = () => {
  return (
    <>
      <PageTitle title="Inbox" />
      <EmailProvider>
        <Card>
          <div className="d-flex">
            <EmailArea />
          </div>
        </Card>
      </EmailProvider>
    </>
  )
}

export default EmailPage
