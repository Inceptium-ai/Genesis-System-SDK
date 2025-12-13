import React from 'react'
import ReactDOM from 'react-dom/client'
import SuperTokens, { SuperTokensWrapper } from 'supertokens-auth-react'
import EmailPassword from 'supertokens-auth-react/recipe/emailpassword'
import Session from 'supertokens-auth-react/recipe/session'
import App from './App'
import './index.css'

// SuperTokens configuration
SuperTokens.init({
  appInfo: {
    appName: 'Embedded Auth Demo',
    apiDomain: 'http://localhost:8001',
    websiteDomain: 'http://localhost:5175',
    apiBasePath: '/auth',
    websiteBasePath: '/auth'
  },
  recipeList: [
    EmailPassword.init(),
    Session.init()
  ]
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SuperTokensWrapper>
      <App />
    </SuperTokensWrapper>
  </React.StrictMode>
)
