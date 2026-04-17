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
    <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700 truncate max-w-[70%]">
          {filename}
        </span>
        <span className="text-xs text-gray-400">{formatSize(filesize)}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-150"
          style={{
            width: `${progress}%`,
            background: progress === 100 ? '#16a34a' : '#3b82f6'
          }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400">
          {progress === 100 ? 'Complete' : 'Transferring...'}
        </span>
        <span className="text-xs text-gray-500 font-medium">{progress}%</span>
      </div>
    </div>
  )
}