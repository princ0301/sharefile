import { motion } from "framer-motion"
import { File } from "lucide-react"

interface Props {
  progress: number
  filename: string
  filesize: number
}

const formatSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function ProgressBar({ progress, filename, filesize }: Props) {
  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
          <File className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-white truncate pr-2">
              {filename}
            </span>
            <span className="text-xs text-white/50 whitespace-nowrap">{formatSize(filesize)}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-white/40">
              {progress === 100 ? 'Transfer complete' : 'Transferring...'}
            </span>
            <span className="text-xs font-semibold text-indigo-300">{progress}%</span>
          </div>
        </div>
      </div>
      
      <div className="w-full bg-black/40 rounded-full h-2.5 overflow-hidden border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.2 }}
          className={`h-full rounded-full relative ${progress === 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
        >
          {progress !== 100 && (
            <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] animate-[shimmer_1.5s_infinite]" style={{ transform: 'translateX(-100%)' }} />
          )}
        </motion.div>
      </div>
    </div>
  )
}