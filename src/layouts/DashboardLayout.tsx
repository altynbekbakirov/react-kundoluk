import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import MainContent from '../components/MainContent'

function DashboardLayout(): JSX.Element {
  return (
    <div className="container-fluid">
      <div className="row min-vh-100">
        <Sidebar />
        <MainContent>
          <Outlet />
        </MainContent>
      </div>
    </div>
  )
}

export default DashboardLayout


