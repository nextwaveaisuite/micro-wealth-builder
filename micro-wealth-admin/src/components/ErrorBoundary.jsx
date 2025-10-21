import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { hasError: false, err: null } }
  static getDerivedStateFromError(error){ return { hasError: true, err: error } }
  componentDidCatch(error, info){ console.error('UI Error:', error, info) }
  render(){
    if(this.state.hasError){
      return (
        <div className="card">
          <h1 className="h1">Something went wrong</h1>
          <p className="small">Please reload. If it persists, contact support.</p>
        </div>
      )
    }
    return this.props.children
  }
}
