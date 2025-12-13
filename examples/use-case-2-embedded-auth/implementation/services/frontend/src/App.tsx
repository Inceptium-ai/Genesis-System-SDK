import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { getSuperTokensRoutesForReactRouterDom } from 'supertokens-auth-react/ui'
import { EmailPasswordPreBuiltUI } from 'supertokens-auth-react/recipe/emailpassword/prebuiltui'
import Session, { useSessionContext } from 'supertokens-auth-react/recipe/session'
import { Shield, User, LogOut, Lock, Users, Settings } from 'lucide-react'
import * as reactRouterDom from 'react-router-dom'

function Dashboard() {
  const session = useSessionContext()
  const [userData, setUserData] = useState<{ user_id: string; message: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProtectedData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/me')
      if (response.status === 401) {
        throw new Error('Unauthorized')
      }
      const data = await response.json()
      setUserData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch')
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await Session.signOut()
    window.location.href = '/'
  }

  if (session.loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">Embedded Auth Demo</h1>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="http://localhost:8001/auth/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700"
            >
              <Settings className="w-4 h-4" />
              Admin Console
            </a>
            {session.doesSessionExist && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {!session.doesSessionExist ? (
          /* Not Logged In */
          <div className="max-w-md mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <Lock className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Welcome!</h2>
              <p className="text-gray-600 mb-6">
                Sign in or create an account to access the protected dashboard.
              </p>
              <a
                href="/auth"
                className="inline-block w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 font-medium"
              >
                Sign In / Sign Up
              </a>
            </div>
          </div>
        ) : (
          /* Logged In Dashboard */
          <div className="grid md:grid-cols-2 gap-6">
            {/* User Info Card */}
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold">Logged In</h2>
              </div>
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg mb-4">
                ✓ Session is active
              </div>
              <p className="text-gray-600 text-sm">
                User ID: <code className="bg-gray-100 px-2 py-1 rounded">{session.userId}</code>
              </p>
            </div>

            {/* Protected API Test Card */}
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold">Protected API</h2>
              </div>
              <button
                onClick={fetchProtectedData}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 mb-4"
              >
                {loading ? 'Loading...' : 'Test Protected Endpoint'}
              </button>
              {error && (
                <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg">
                  Error: {error}
                </div>
              )}
              {userData && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <pre className="text-sm">{JSON.stringify(userData, null, 2)}</pre>
                </div>
              )}
            </div>

            {/* Admin Links Card */}
            <div className="bg-white p-6 rounded-xl shadow md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold">Admin Console</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Access the SuperTokens Dashboard to manage users, sessions, and settings.
              </p>
              <a
                href="http://localhost:8001/auth/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800"
              >
                <Settings className="w-4 h-4" />
                Open Admin Dashboard
              </a>
              <p className="text-sm text-gray-500 mt-2">
                Opens in new tab → http://localhost:8001/auth/dashboard
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* SuperTokens auth routes (pre-built UI) */}
        {getSuperTokensRoutesForReactRouterDom(reactRouterDom, [EmailPasswordPreBuiltUI])}
        
        {/* Main dashboard */}
        <Route path="/" element={<Dashboard />} />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
