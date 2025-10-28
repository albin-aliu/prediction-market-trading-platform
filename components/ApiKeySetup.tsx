export function ApiKeySetup() {
  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">🔑 API Key Required</h3>
        <p className="text-gray-600 dark:text-gray-400">
          To view markets, you need a PolyRouter API key
        </p>
      </div>

      <div className="space-y-4 text-left">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Step 1: Get Your API Key
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>Visit <a href="https://www.polyrouter.io/" target="_blank" rel="noopener noreferrer" className="underline font-semibold">polyrouter.io</a></li>
            <li>Sign up or log in to your account</li>
            <li>Navigate to your API settings/dashboard</li>
            <li>Generate a new API key</li>
            <li>Copy your API key</li>
          </ol>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
            Step 2: Add to .env File
          </h4>
          <p className="text-sm text-green-800 dark:text-green-200 mb-2">
            Open your project's <code className="bg-green-200 dark:bg-green-900 px-1 rounded">.env</code> file and add:
          </p>
          <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
            POLYROUTER_API_KEY=your_api_key_here
          </pre>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
            Step 3: Restart Server
          </h4>
          <p className="text-sm text-orange-800 dark:text-orange-200 mb-2">
            Stop and restart your development server:
          </p>
          <pre className="bg-gray-900 text-orange-400 p-3 rounded text-xs overflow-x-auto">
            # Press Ctrl+C to stop, then run:{'\n'}
            npm run dev
          </pre>
        </div>
      </div>

      <div className="mt-6 text-center">
        <a 
          href="https://www.polyrouter.io/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Get API Key →
        </a>
      </div>
    </div>
  )
}

