import { useState } from 'react'
import { Flame, Loader2, AlertCircle, Sparkles } from 'lucide-react'

interface RoastResponse {
  score: number
  feedback: string[]
  model_used: string
}

function App() {
  const [resumeText, setResumeText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RoastResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRoast = async () => {
    if (!resumeText.trim()) {
      setError('Please paste your resume first!')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/ai/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: resumeText }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    if (score >= 40) return 'text-orange-500'
    return 'text-red-500'
  }

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return '🔥'
    if (score >= 60) return '👍'
    if (score >= 40) return '😬'
    return '💀'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Flame className="w-10 h-10 text-orange-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Resumax
            </h1>
          </div>
          <p className="text-gray-400 text-lg">Get your resume brutally roasted by AI</p>
        </div>

        {/* Input Section */}
        <div className="bg-gray-800/50 rounded-xl p-6 mb-6 border border-gray-700">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Paste your resume text
          </label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="John Doe
Software Engineer

Experience:
- Did coding stuff at Company A
- Made websites
- Fixed bugs sometimes

Education:
- BS Computer Science"
            className="w-full h-64 bg-gray-900/50 border border-gray-600 rounded-lg p-4 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          />
          
          <button
            onClick={handleRoast}
            disabled={loading}
            className="mt-4 w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Roasting...
              </>
            ) : (
              <>
                <Flame className="w-5 h-5" />
                Roast My Resume
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 animate-in fade-in duration-500">
            {/* Score */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-2">{getScoreEmoji(result.score)}</div>
              <div className={`text-5xl font-bold ${getScoreColor(result.score)}`}>
                {result.score}/100
              </div>
              <p className="text-gray-400 mt-1">Resume Score</p>
            </div>

            {/* Feedback */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Feedback
              </h3>
              <ul className="space-y-3">
                {result.feedback.map((item, index) => (
                  <li key={index} className="flex gap-3 text-gray-300">
                    <span className="text-orange-500 font-bold">{index + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Model Info */}
            <div className="mt-6 pt-4 border-t border-gray-700 text-center">
              <span className="text-xs text-gray-500">
                Powered by {result.model_used}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
