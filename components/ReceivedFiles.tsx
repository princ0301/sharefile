import { downloadBlob } from '@/lib/fileTransfer'

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
    <div className="mt-4">
      <p className="text-sm font-medium text-gray-500 mb-2">Received files</p>
      <div className="flex flex-col gap-2">
        {files.map((file, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-gray-800">{file.name}</p>
              <p className="text-xs text-gray-400">{formatSize(file.blob.size)}</p>
            </div>
            <button
              onClick={() => downloadBlob(file.blob, file.name)}
              className="text-sm px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}