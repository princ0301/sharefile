'use client'

import React, { useRef, useState } from "react"

interface Props {
    onFiles: (files: File[]) => void
    disabled?: boolean
}

export default function DropZone({ onFiles, disabled }: Props) {
    const [dragging, setDragging] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragging(false)
        if (disabled)
            return

        const files = Array.from(e.dataTransfer.files)
        if (files.length > 0)
            onFiles(files)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length > 0)
            onFiles(files)
    }

    return (
        <div
            onClick={() => !disabled && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
                ${dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
            `}
        >
            <div className="text-4xl mb-3">📂</div>
            <p className="text-gray-600 font-medium">Click or drag files here</p>
            <p className="text-gray-400 text-sm mt-1">Any file type supported</p>
            <input
                ref={inputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleChange}
            />
        </div>
    )
}