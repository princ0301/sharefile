'use client'

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Copy, Check } from "lucide-react"

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
        <button
            onClick={handleCopy}
            className="group relative w-full flex items-center gap-4 bg-black/20 border border-white/10 hover:border-indigo-500/50 rounded-2xl px-6 py-4 transition-all hover:bg-black/40 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]"
        >
            <span className="font-mono text-3xl font-bold tracking-[0.3em] text-white flex-1 text-center">
                {code}
            </span>
            <div className="absolute right-4 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50 group-hover:text-white transition-colors">
                <AnimatePresence mode="wait">
                    {copied ? (
                        <motion.div
                            key="check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="text-emerald-400"
                        >
                            <Check className="w-5 h-5" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="copy"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                        >
                            <Copy className="w-5 h-5" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </button>
    )
}