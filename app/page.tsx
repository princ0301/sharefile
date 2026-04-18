'use client'

import DropZone from "@/components/DropZone"
import ProgressBar from "@/components/ProgressBar"
import ReceivedFiles from "@/components/ReceivedFiles"
import RoomCode from "@/components/RoomCode"
import { usePeer } from "@/hooks/usePeer"
import { useState } from "react"

export default function Home() {
  const [mode, setMode] = useState<'home' | 'send' | 'receive'>('home')
  const [joinInput, setJoinInout] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const {
    status,
    roomCode,
    fileProgress,
    receivedFiles,
    generateRoomCode,
    joinRoom,
    sendFiles,
    downloadBlob,
    resetState,
  } = usePeer()

  const handleSendMode = () => {
    setMode('send')
    generateRoomCode()
  }

  const handleJoin = () => {
    if (!joinInput.trim()) 
      return

    joinRoom(joinInput.trim().toUpperCase())
    setMode('receive')
  }

  const handleFiles = (files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files])
  }

  const handleSend = () => {
    if (selectedFiles.length === 0)
      return

    sendFiles(selectedFiles)
    setSelectedFiles([])
  }

  const statusColor: Record<string, string> = {
    idle: 'bg-gray-200 text-gray-600',
    connecting: 'bg-yellow-100 text-yellow-700',
    connected: 'bg-green-100 text-green-700',
    sending: 'bg-blue-100 text-blue-700',
    receiving: 'bg-blue-100 text-blue-700',
    done: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700',
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sharefile</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Share files directly - no cloud no, cable
          </p>
        </div>

        {/* Home screen */}
        {mode === 'home' && (
          <div className="flex flex-col gap-4">
            <button
              onClick={handleSendMode}
              className="w-full py-4 rounded-2xl bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 transition"
            >
              Send files
            </button>
            <button
              onClick={() => setMode('receive')}
              className="w-full py-4 rounded-2xl bg-white border border-gray-200 text-gray-800 font-semibold text-lg hover:bg-gray-50 transition"
            >
              Receive files
            </button>
          </div>
        )}

        {/* Send screen */}
        {mode === 'send' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-5">
            <div>
              <p className="text-sm text-gray-500 mb-2">
                Share this code with receiver
              </p>
              <RoomCode code={roomCode} />
            </div>

            {status === 'connected' || status === 'sending' || status === 'done' ? (
              <>
                <DropZone
                  onFiles={handleFiles}
                  disabled={status === 'sending'}
                />

                {selectedFiles.length > 0 && status !== 'sending' && (
                  <div className="flex flex-col gap-3">
                    <div className="max-h-40 overflow-y-auto flex flex-col gap-2 p-2 bg-gray-50 rounded-xl border border-gray-100">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium text-gray-700 truncate">{file.name}</span>
                            <span className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                          <button 
                            onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                            className="text-gray-400 hover:text-red-500 ml-2"
                            title="Remove file"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleSend}
                      className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                    >
                      Send {selectedFiles.length} file(s)
                    </button>
                  </div>
                )}

                {fileProgress.map((f, i) => (
                  <ProgressBar 
                    key={i}
                    filename={f.name}
                    filesize={f.size}
                    progress={f.progress}
                  />
                ))}
              </>
            ) : (
              <div className="text-center py-6 text-gray-400 text-sm">
                Waiting for receiver to join
              </div>
            )}

            <button
              onClick={() => { resetState(); setMode('home') }}
              className="text-sm text-gray-400 hover:text-gray-600 transition text-center"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Receive screen */}
        {mode === 'receive' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-5">

            {status === 'idle' && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Enter the room code</p>
                <div className="flex gap-2">
                  <input
                    value={joinInput}
                    onChange={e => setJoinInout(e.target.value.toUpperCase())}
                    placeholder="e.g. AB12CD"
                    maxLength={6}
                    className="flex-1 font-mono text-lg border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-blue-400"
                  />
                  <button
                    onClick={handleJoin}
                    className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                  >
                    Join
                  </button>
                </div>
              </div>
            )}

            {status === 'connecting' && (
              <div className="text-center py-6 text-gray-400 text-sm">
                Connecting to sender...
              </div>
            )}

            {(status === 'receiving' || status === 'done') && (
              <>
                {fileProgress.map((f, i) => (
                  <ProgressBar
                    key={i}
                    filename={f.name}
                    filesize={f.size}
                    progress={f.progress}
                  />
                ))}
                <ReceivedFiles files={receivedFiles} />
              </>
            )}

            <button
              onClick={() => setMode('home')}
              className="text-sm text-gray-400 hover:text-gray-600 transition text-center"
            >
              Back
            </button>
          </div>
        )}

      </div>
    </main>
  )
}