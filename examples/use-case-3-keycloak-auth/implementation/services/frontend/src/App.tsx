import { useState, useCallback, useRef } from 'react'
import Keycloak from 'keycloak-js'
import { Shield, User, LogOut, Lock, Users, Settings, Key, UserCog } from 'lucide-react'

// ============================================
// KEYCLOAK - LAZY INITIALIZATION
// ============================================

// Create keycloak instance (but don't init yet)
let keycloakInstance: Keycloak | null = null

function getKeycloak(): Keycloak {
  if (!keycloakInstance) {
    keycloakInstance = new Keycloak({
      url: 'http://localhost:8080',
      realm: 'genesis',
      clientId: 'genesis-app'
    })
  }
  return keycloakInstance
}

// ============================================
// MAIN APP
// ============================================

function App() {
  const [authenticated, setAuthenticated] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [apiResult, setApiResult] = useState<any>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [roles, setRoles] = useState<string[]>([])
  const keycloakInitialized = useRef(false)

  // Login - initializes keycloak if needed, then redirects to login
  const login = useCallback(async () => {
    setLoading(true)
    try {
      const kc = getKeycloak()
      
      if (!keycloakInitialized.current) {
        // First time - initialize and redirect to login
        await kc.init({ 
          onLoad: 'login-required',
          checkLoginIframe: false
        })
        keycloakInitialized.current = true
        
        if (kc.authenticated) {
          setAuthenticated(true)
          try {
            const info = await kc.loadUserInfo()
            setUserInfo(info)
          } catch (e) {
            console.error('Failed to load user info:', e)
          }
          const realmAccess = kc.tokenParsed?.realm_access
          setRoles(realmAccess?.roles || [])
        }
      } else {
        // Already initialized, just login
        kc.login()
      }
    } catch (err) {
      console.error('Login failed:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async () => {
    setLoading(true)
    try {
      const kc = getKeycloak()
      
      if (!keycloakInitialized.current) {
        await kc.init({ checkLoginIframe: false })
        keycloakInitialized.current = true
      }
      
      kc.register()
    } catch (err) {
      console.error('Register failed:', err)
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    const kc = getKeycloak()
    kc.logout({ redirectUri: window.location.origin })
  }, [])

  const callProtectedApi = useCallback(async () => {
    setApiError(null)
    setApiResult(null)
    
    try {
      const kc = getKeycloak()
      await kc.updateToken(30)
      
      const response = await fetch('http://localhost:8002/api/me', {
        headers: {
          'Authorization': `Bearer ${kc.token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }
      
      const data = await response.json()
      setApiResult(data)
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'API call failed')
    }
  }, [])

  const callAdminApi = useCallback(async () => {
    setApiError(null)
    setApiResult(null)
    
    try {
      const kc = getKeycloak()
      await kc.updateToken(30)
      
      const response = await fetch('http://localhost:8002/api/admin', {
        headers: {
          'Authorization': `Bearer ${kc.token}`
        }
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || `API returned ${response.status}`)
      }
      
      const data = await response.json()
      setApiResult(data)
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'API call failed')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Key className="w-8 h-8 text-orange-600" />
            <h1 className="text-xl font-bold text-gray-900">Keycloak Auth Demo</h1>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="http://localhost:8080/admin"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-lg hover:bg-orange-200 text-orange-700"
            >
              <UserCog className="w-4 h-4" />
              Keycloak Admin
            </a>
            {authenticated && (
              <button
                onClick={logout}
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
        {!authenticated ? (
          /* Not Logged In */
          <div className="max-w-md mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <Key className="w-16 h-16 text-orange-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Welcome!</h2>
              <p className="text-gray-600 mb-6">
                Sign in with Keycloak to access the protected dashboard.
              </p>
              <div className="space-y-3">
                <button
                  onClick={login}
                  disabled={loading}
                  className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 font-medium disabled:opacity-50"
                >
                  {loading ? 'Connecting to Keycloak...' : 'Sign In'}
                </button>
                <button
                  onClick={register}
                  disabled={loading}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50"
                >
                  Create Account
                </button>
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left text-sm">
                <p className="font-medium mb-2">Test Accounts:</p>
                <p className="text-gray-600">demo@genesis.com / demo123</p>
                <p className="text-gray-600">admin@genesis.com / admin123</p>
              </div>
            </div>
          </div>
        ) : (
          /* Logged In Dashboard */
          <div className="grid md:grid-cols-2 gap-6">
            {/* User Info Card */}
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-6 h-6 text-orange-600" />
                <h2 className="text-xl font-bold">User Info</h2>
              </div>
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg mb-4">
                ✓ Authenticated via Keycloak
              </div>
              {userInfo && (
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Email:</span> {userInfo.email}</p>
                  <p><span className="font-medium">Name:</span> {userInfo.name || userInfo.preferred_username}</p>
                  <p><span className="font-medium">ID:</span> <code className="bg-gray-100 px-2 py-1 rounded text-xs">{userInfo.sub}</code></p>
                </div>
              )}
            </div>

            {/* Roles Card */}
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-orange-600" />
                <h2 className="text-xl font-bold">Roles (RBAC)</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <span 
                    key={role}
                    className={`px-3 py-1 rounded-full text-sm ${
                      role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {role}
                  </span>
                ))}
              </div>
              <p className="text-gray-500 text-sm mt-4">
                Roles are managed in Keycloak Admin Console
              </p>
            </div>

            {/* Protected API Test Card */}
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-orange-600" />
                <h2 className="text-xl font-bold">Protected API</h2>
              </div>
              <div className="space-y-3">
                <button
                  onClick={callProtectedApi}
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700"
                >
                  Call /api/me (Any User)
                </button>
                <button
                  onClick={callAdminApi}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
                >
                  Call /api/admin (Admin Only)
                </button>
              </div>
              {apiError && (
                <div className="mt-4 bg-red-100 text-red-800 px-4 py-2 rounded-lg">
                  Error: {apiError}
                </div>
              )}
              {apiResult && (
                <div className="mt-4 bg-gray-100 p-4 rounded-lg">
                  <pre className="text-sm overflow-auto">{JSON.stringify(apiResult, null, 2)}</pre>
                </div>
              )}
            </div>

            {/* Admin Console Card */}
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-orange-600" />
                <h2 className="text-xl font-bold">Admin Console</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Manage users, roles, and settings - zero custom code needed!
              </p>
              <a
                href="http://localhost:8080/admin"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800"
              >
                <Settings className="w-4 h-4" />
                Open Keycloak Admin
              </a>
              <p className="text-sm text-gray-500 mt-2">
                Login: admin / admin
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
