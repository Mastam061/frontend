'use client'

import { useState } from 'react'
import { Download, Search, Clock, CheckCircle, AlertCircle, Package } from 'lucide-react'

export default function Home() {
  const [url, setUrl] = useState('')
  const [timestamp, setTimestamp] = useState('')
  const [downloadId, setDownloadId] = useState<string | null>(null)
  const [status, setStatus] = useState<any>(null)
  const [snapshots, setSnapshots] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const searchSnapshots = async () => {
    if (!url) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      
      if (!response.ok) throw new Error('Failed to search')
      
      const data = await response.json()
      setSnapshots(data.snapshots || [])
    } catch (err) {
      setError('Failed to search Wayback Machine')
    }
    
    setLoading(false)
  }

  const startDownload = async (selectedTimestamp?: string) => {
    if (!url) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url, 
          timestamp: selectedTimestamp || timestamp 
        })
      })
      
      if (!response.ok) throw new Error('Failed to start download')
      
      const data = await response.json()
      setDownloadId(data.download_id)
      setStatus(data)
      
      // Poll for status updates
      pollStatus(data.download_id)
    } catch (err) {
      setError('Failed to start download')
    }
    
    setLoading(false)
  }

  const pollStatus = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/status/${id}`)
        if (!response.ok) {
          clearInterval(interval)
          return
        }
        
        const data = await response.json()
        setStatus(data)
        
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval)
        }
      } catch (err) {
        clearInterval(interval)
      }
    }, 2000)
  }

  const downloadFile = (filename: string) => {
    window.location.href = `/api/download-file/${filename}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Wayback Machine Downloader
          </h1>
          <p className="text-xl text-purple-200">
            Download archived websites from the Wayback Machine
          </p>
        </div>

        {/* Main Card */}
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          {/* URL Input */}
          <div className="mb-6">
            <label className="block text-white text-sm font-semibold mb-2">
              Website URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={searchSnapshots}
                disabled={loading}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Search size={20} />
                Search
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 rounded-lg flex items-center gap-2 text-red-200">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {/* Snapshots List */}
          {snapshots.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Clock size={20} />
                Available Snapshots ({snapshots.length})
              </h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {snapshots.map((snapshot, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <div className="text-white">
                      <div className="font-medium">
                        {new Date(snapshot.date).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-300">
                        {snapshot.mimetype}
                      </div>
                    </div>
                    <button
                      onClick={() => startDownload(snapshot.timestamp)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manual Timestamp Input */}
          <div className="mb-6">
            <label className="block text-white text-sm font-semibold mb-2">
              Or Enter Specific Timestamp (Optional)
            </label>
            <input
              type="text"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              placeholder="20240101000000 (YYYYMMDDHHMMSS)"
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Download Button */}
          <button
            onClick={() => startDownload()}
            disabled={loading || !url}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-bold text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            <Download size={24} />
            Start Download
          </button>

          {/* Download Status */}
          {status && (
            <div className="mt-6 p-6 bg-white/10 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                {status.status === 'completed' && (
                  <CheckCircle size={24} className="text-green-400" />
                )}
                {status.status === 'failed' && (
                  <AlertCircle size={24} className="text-red-400" />
                )}
                {status.status === 'downloading' && (
                  <Clock size={24} className="text-blue-400 animate-spin" />
                )}
                <div>
                  <div className="text-white font-semibold capitalize">
                    {status.status}
                  </div>
                  <div className="text-gray-300 text-sm">{status.message}</div>
                </div>
              </div>

              {/* Progress Bar */}
              {status.status === 'downloading' && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>Progress</span>
                    <span>{status.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${status.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Download Completed */}
              {status.status === 'completed' && status.zip_file && (
                <button
                  onClick={() => downloadFile(status.zip_file)}
                  className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-3"
                >
                  <Package size={24} />
                  Download ZIP File
                </button>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="max-w-4xl mx-auto mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">
            How to Use
          </h2>
          <div className="space-y-4 text-gray-200">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-white">Enter Website URL</h3>
                <p>Enter the URL of the website you want to download from the Wayback Machine</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-white">Search for Snapshots</h3>
                <p>Click the Search button to find available archived versions of the website</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold text-white">Select and Download</h3>
                <p>Choose a specific snapshot or download the latest version directly</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="font-semibold text-white">Get Your Files</h3>
                <p>Once complete, download the ZIP file containing all the website files</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}