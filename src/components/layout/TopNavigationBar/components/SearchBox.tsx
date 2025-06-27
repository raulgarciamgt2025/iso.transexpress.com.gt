
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import useToggle from '@/hooks/useToggle'
import { Card, Modal, ModalDialog } from 'react-bootstrap'

const SearchBox = () => {
  const { isTrue, toggle } = useToggle()
  return (
    <>
      <div
        onClick={toggle}
        className="topbar-search d-none d-xl-flex gap-2  align-items-center"
        data-bs-toggle="modal"
        data-bs-target="#searchModal">
        <IconifyIcon icon="tabler:search" className="fs-18" />
        <span className="me-2">Search something..</span>
        <span className="ms-auto fw-medium">⌘K</span>
      </div>
      <Modal show={isTrue} onHide={toggle} className="modal-lg" id="searchModal" tabIndex={-1} aria-labelledby="searchModalLabel" aria-hidden="true">
        <ModalDialog className="m-0">
          <form>
            <Card className="mb-0">
              <div className="px-3 py-2 d-flex flex-row align-items-center" id="top-search">
                <IconifyIcon icon="tabler:search" className="fs-22" />
                <input type="search" className="form-control border-0" id="search-modal-input" placeholder="Search for actions, people," />
                <a onClick={toggle} type="submit" className="btn p-0" data-bs-dismiss="modal" aria-label="Close">
                  [esc]
                </a>
              </div>
            </Card>
          </form>
        </ModalDialog>
      </Modal>
    </>
  )
}

export default SearchBox
