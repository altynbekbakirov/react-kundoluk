import { Outlet } from 'react-router-dom'

function AuthLayout(): JSX.Element {
  return (
    <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center">
      <div className="w-100" style={{ maxWidth: 520 }}>
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout


