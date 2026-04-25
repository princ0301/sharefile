'use client'

import React, { useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UploadCloud } from "lucide-react"

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
        <motion.div
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            animate={{
                borderColor: dragging ? 'rgba(129, 140, 248, 0.8)' : 'rgba(255, 255, 255, 0.2)',
                backgroundColor: dragging ? 'rgba(79, 70, 229, 0.1)' : 'rgba(255, 255, 255, 0.05)'
            }}
            onClick={() => !disabled && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
        >
            <motion.div 
                animate={{ y: dragging ? -5 : 0, scale: dragging ? 1.1 : 1 }}
                className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400"
            >
                <UploadCloud className="w-8 h-8" />
            </motion.div>
            <p className="text-white font-medium text-lg">Click or drag files here</p>
            <p className="text-white/50 text-sm mt-1">Any file type supported</p>
            <input
                ref={inputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleChange}
            />
        </motion.div>
    )
}