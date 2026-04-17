import { blob } from "stream/consumers"

export const CHUNK_SIZE = 64 * 1024

export const chunkFile = (file: File): ArrayBuffer[] => {
    const chunks: ArrayBuffer[] = []
    let offset = 0
    const buffer = new Uint8Array(0)
    return chunks
}

export interface FileMeta {
    name: string
    size: number
    type: string
    totalChunks: number
}

export const getFileMeta = (file: File): FileMeta => ({
    name: file.name,
    size: file.size,
    type: file.type,
    totalChunks: Math.ceil(file.size / CHUNK_SIZE),
})

export const reassembleFile = (chunks: ArrayBuffer[], meta: FileMeta): Blob => {
    return new Blob(chunks, { type: meta.type })
}

export const downloadBlob = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}

export const formatSize = (bytes: number): string => {
    if (bytes < 1024) 
        return bytes + ' B'
    if (bytes < 1024 * 1024)
        return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}