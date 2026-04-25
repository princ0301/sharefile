'use client'

import DropZone from "@/components/DropZone"
import ProgressBar from "@/components/ProgressBar"
import ReceivedFiles from "@/components/ReceivedFiles"
import RoomCode from "@/components/RoomCode"
import { usePeer } from "@/hooks/usePeer"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Download, X, ArrowLeft } from "lucide-react"

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

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  }

  return (
    <main className="min-h-screen animated-gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ duration: 0.5, type: "spring" }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-4 shadow-[0_0_30px_rgba(79,70,229,0.3)]"
          >
            <Send className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Sharefile</h1>
          <p className="text-white/60 mt-2 text-base">
            Share files directly &middot; No cloud &middot; No limits
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Home screen */}
          {mode === 'home' && (
            <motion.div 
              key="home"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col gap-4"
            >
              <button
                onClick={handleSendMode}
                className="group relative w-full overflow-hidden rounded-2xl p-[1px]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-black/40 backdrop-blur-xl text-white font-semibold text-lg transition-all duration-300 group-hover:bg-black/20">
                  <Send className="w-5 h-5 text-indigo-300" />
                  Send files
                </div>
              </button>
              
              <button
                onClick={() => setMode('receive')}
                className="group relative w-full py-4 rounded-2xl glass-panel text-white font-semibold text-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Download className="w-5 h-5 text-purple-300" />
                Receive files
              </button>
            </motion.div>
          )}

          {/* Send screen */}
          {mode === 'send' && (
            <motion.div 
              key="send"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="glass-panel rounded-3xl p-6 flex flex-col gap-6"
            >
              <div className="text-center">
                <p className="text-sm font-medium text-white/50 mb-3 uppercase tracking-wider">
                  Your Room Code
                </p>
                <RoomCode code={roomCode} />
              </div>

              {status === 'connected' || status === 'sending' || status === 'done' ? (
                <div className="flex flex-col gap-5">
                  <DropZone
                    onFiles={handleFiles}
                    disabled={status === 'sending'}
                  />

                  {selectedFiles.length > 0 && status !== 'sending' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex flex-col gap-3"
                    >
                      <div className="max-h-48 overflow-y-auto pr-2 flex flex-col gap-2 custom-scrollbar">
                        <AnimatePresence>
                          {selectedFiles.map((file, idx) => (
                            <motion.div 
                              key={idx} 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="flex justify-between items-center p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
                            >
                              <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-medium text-white truncate">{file.name}</span>
                                <span className="text-xs text-white/40">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                              </div>
                              <button 
                                onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                                className="text-white/40 hover:text-red-400 p-2 rounded-lg hover:bg-white/5 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                      <button
                        onClick={handleSend}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:scale-[1.02] transition-all"
                      >
                        Send {selectedFiles.length} file(s)
                      </button>
                    </motion.div>
                  )}

                  <div className="flex flex-col gap-2">
                    {fileProgress.map((f, i) => (
                      <ProgressBar 
                        key={i}
                        filename={f.name}
                        filesize={f.size}
                        progress={f.progress}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
                  <p className="text-white/60 text-sm">Waiting for receiver to join...</p>
                </div>
              )}

              <button
                onClick={() => { resetState(); setMode('home') }}
                className="flex items-center justify-center gap-2 text-sm text-white/40 hover:text-white transition mt-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </button>
            </motion.div>
          )}

          {/* Receive screen */}
          {mode === 'receive' && (
            <motion.div 
              key="receive"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="glass-panel rounded-3xl p-6 flex flex-col gap-6"
            >
              {status === 'idle' && (
                <div>
                  <p className="text-sm font-medium text-white/50 mb-3 uppercase tracking-wider text-center">Enter Room Code</p>
                  <div className="flex flex-col gap-3">
                    <input
                      value={joinInput}
                      onChange={e => setJoinInout(e.target.value.toUpperCase())}
                      placeholder="e.g. AB12CD"
                      maxLength={6}
                      className="w-full text-center tracking-[0.2em] bg-black/20 border border-white/10 text-white text-2xl rounded-2xl px-4 py-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-white/20"
                    />
                    <button
                      onClick={handleJoin}
                      disabled={joinInput.length !== 6}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all"
                    >
                      Join Room
                    </button>
                  </div>
                </div>
              )}

              {status === 'connecting' && (
                <div className="text-center py-10 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
                  <p className="text-white/60 text-sm">Connecting to sender...</p>
                </div>
              )}

              {(status === 'receiving' || status === 'done') && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    {fileProgress.map((f, i) => (
                      <ProgressBar
                        key={i}
                        filename={f.name}
                        filesize={f.size}
                        progress={f.progress}
                      />
                    ))}
                  </div>
                  <ReceivedFiles files={receivedFiles} />
                </div>
              )}

              <button
                onClick={() => setMode('home')}
                className="flex items-center justify-center gap-2 text-sm text-white/40 hover:text-white transition mt-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  )
}