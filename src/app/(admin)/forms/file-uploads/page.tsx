import DropzoneFormInput from '@/components/form/DropzoneFormInput'
import PageTitle from '@/components/PageTitle'
import { Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'

const DropzoneFileUpload = () => {
  return (
    <>
      <Col xl={12}>
        <Card>
          <CardHeader>
            <CardTitle as={'h4'}>Dropzone File Upload</CardTitle>
            <p className="card-subtitle">DropzoneJS is an open source library that provides drag’n’drop file uploads with image previews.</p>
          </CardHeader>
          <CardBody>
            <div className="mb-3">
              <DropzoneFormInput
                className="mb-10"
                iconProps={{ icon: 'bx:cloud-upload', height: 36, width: 36 }}
                text="Drop files here or click to upload. "
                helpText={
                  <span className="text-muted fs-13">
                    (This is just a demo dropzone. Selected files are
                    <strong>not</strong> actually uploaded.)
                  </span>
                }
                showPreview
              />
            </div>
          </CardBody>
        </Card>
      </Col>
    </>
  )
}

const page = () => {
  return (
    <>
      <PageTitle title="File Uploads" subTitle="Forms" />

      <Row>
        <DropzoneFileUpload />
      </Row>
    </>
  )
}

export default page
