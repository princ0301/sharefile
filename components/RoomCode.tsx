'use client'

import { useState } from "react"

interface Props {
    code: string
}

export default function RoomCode({ code }: Props) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3">
            <span className="font-mono text-lg font-bold tracking-widest text-gray-800 flex-1">
                {code}
            </span>
            <button
                onClick={handleCopy}
                className="text-sm px-4 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition text-gray-600"
            >
                {copied ? 'Copied!' : 'Copy'}
            </button>
        </div>
    )
}