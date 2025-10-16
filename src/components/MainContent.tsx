import React from 'react'

type MainContentProps = {
  children: React.ReactNode
  title?: string
}

function MainContent({ children, title }: MainContentProps): JSX.Element {
  return (
    <main className="col-12 col-md-9 col-lg-10 p-4">
      {title ? (
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="m-0">{title}</h2>
          <div>
            <button className="btn btn-primary me-2">Primary Action</button>
            <button className="btn btn-outline-secondary">Secondary</button>
          </div>
        </div>
      ) : null}
      {children}
    </main>
  )
}

export default MainContent


