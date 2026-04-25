import { downloadBlob } from '@/lib/fileTransfer'
import { Download, File as FileIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  files: { name: string; blob: Blob }[]
}

const formatSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function ReceivedFiles({ files }: Props) {
  if (files.length === 0) return null

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 px-2">
        <div className="h-px bg-white/10 flex-1" />
        <p className="text-xs font-medium text-white/40 uppercase tracking-widest">Received Files</p>
        <div className="h-px bg-white/10 flex-1" />
      </div>
      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
        <AnimatePresence>
          {files.map((file, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <FileIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{file.name}</p>
                  <p className="text-xs text-white/50">{formatSize(file.blob.size)}</p>
                </div>
              </div>
              <button
                onClick={() => downloadBlob(file.blob, file.name)}
                className="w-10 h-10 flex items-center justify-center bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-xl transition-all"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}