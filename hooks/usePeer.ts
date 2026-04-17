import { useEffect, useRef, useState, useCallback } from 'react'
import SimplePeer from 'simple-peer'
import { getPusherClient } from '@/lib/pusherClient'
import type { Channel } from 'pusher-js'
import { CHUNK_SIZE, FileMeta, getFileMeta, reassembleFile, downloadBlob } from '@/lib/fileTransfer'

export type TransferStatus = 'idle' | 'connecting' | 'connected' | 'sending' | 'receiving' | 'done' | 'error'

export interface FileProgress {
  name: string
  size: number
  progress: number
  status: 'pending' | 'transferring' | 'done'
}

export const usePeer = () => {
  const peerRef = useRef<SimplePeer.Instance | null>(null)
  const pusherRef = useRef(getPusherClient())
  const channelRef = useRef<Channel | null>(null)
  const roomCodeRef = useRef<string>('')

  // re-evaluate on mount if it was null during SSR
  useEffect(() => {
    if (!pusherRef.current) {
      pusherRef.current = getPusherClient()
    }
  }, [])

  const [status, setStatus] = useState<TransferStatus>('idle')
  const [fileProgress, setFileProgress] = useState<FileProgress[]>([])
  const [receivedFiles, setReceivedFiles] = useState<{ name: string; blob: Blob }[]>([])
  const [roomCode, setRoomCode] = useState('')

  const recvBufferRef = useRef<ArrayBuffer[]>([])
  const recvMetaRef = useRef<FileMeta | null>(null)
  const recvChunksRef = useRef(0)

  const cleanupPeer = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.destroy()
      peerRef.current = null
    }
  }, [])

  const triggerEvent = useCallback(async (event: string, data?: any) => {
    if (!roomCodeRef.current || !pusherRef.current?.connection?.socket_id) return
    try {
      await fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: `private-room-${roomCodeRef.current}`,
          event,
          data,
          socket_id: pusherRef.current.connection.socket_id
        })
      })
    } catch (e) {
      console.error('trigger error', e)
    }
  }, [])

  const setupPeerEvents = useCallback((peer: SimplePeer.Instance) => {
    peer.on('connect', () => {
      setStatus('connected')
      console.log('WebRTC connected!')
    })

    peer.on('data', (data: ArrayBuffer) => {
      try {
        const text = new TextDecoder().decode(data)
        const msg = JSON.parse(text)

        if (msg.type === 'meta') {
          recvMetaRef.current = msg.meta
          recvBufferRef.current = []
          recvChunksRef.current = 0
          setStatus('receiving')
          setFileProgress(prev => [...prev, {
            name: msg.meta.name,
            size: msg.meta.size,
            progress: 0,
            status: 'transferring'
          }])
        } else if (msg.type === 'done') {
          const meta = recvMetaRef.current!
          const blob = reassembleFile(recvBufferRef.current, meta)
          setReceivedFiles(prev => [...prev, { name: meta.name, blob }])
          setFileProgress(prev => prev.map(f =>
            f.name === meta.name ? { ...f, progress: 100, status: 'done' } : f
          ))
          recvMetaRef.current = null
          recvBufferRef.current = []
          recvChunksRef.current = 0
          setStatus('done')
        }
      } catch {
        const meta = recvMetaRef.current
        if (!meta) return
        recvBufferRef.current.push(data)
        recvChunksRef.current++
         
        if (recvChunksRef.current % 50 === 0 || recvChunksRef.current === meta.totalChunks) {
          const progress = Math.round((recvChunksRef.current / meta.totalChunks) * 100)
          setFileProgress(prev => prev.map(f =>
            f.name === meta.name ? { ...f, progress } : f
          ))
        }
      }
    })

    peer.on('error', (err) => {
      if (
        err.message?.includes('Close called') ||
        err.message?.includes('Abort') ||
        err.message?.includes('User-Initiated')
      ) {
        setStatus('idle')
        cleanupPeer()
        return
      }
      console.error('Peer error:', err)
      setStatus('error')
    })

    peer.on('close', () => {
      setStatus('idle')
      peerRef.current = null
    })
  }, [cleanupPeer])

  const generateRoomCode = useCallback(() => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    roomCodeRef.current = code
    setRoomCode(code)
    setFileProgress([])
    setReceivedFiles([])

    const channelName = `private-room-${code}`

    if (channelRef.current) {
      pusherRef.current?.unsubscribe(channelRef.current.name)
    }

    const channel = pusherRef.current?.subscribe(channelName)
    if (!channel) return;
    channelRef.current = channel

    channel.bind('pusher:subscription_succeeded', () => {
      console.log('Successfully subscribed to room as sender:', code)
    })

    channel.bind('peer-joined', () => {
      const peer = new SimplePeer({ initiator: true, trickle: true })
      peerRef.current = peer
      setupPeerEvents(peer)

      peer.on('signal', (signalData) => {
        triggerEvent('signal', signalData)
      })

      setStatus('connecting')
    })

    channel.bind('signal', (signalData: any) => {
      peerRef.current?.signal(signalData)
    })

    channel.bind('peer-left', () => {
      setStatus('idle')
      cleanupPeer()
      console.log('Other peer left the room')
    })

    return code
  }, [setupPeerEvents, cleanupPeer, triggerEvent])

  const joinRoom = useCallback((code: string) => {
    roomCodeRef.current = code
    setFileProgress([])
    setReceivedFiles([])

    const channelName = `private-room-${code}`

    if (channelRef.current) {
      pusherRef.current?.unsubscribe(channelRef.current.name)
    }

    const channel = pusherRef.current?.subscribe(channelName)
    if (!channel) return;
    channelRef.current = channel

    channel.bind('pusher:subscription_succeeded', () => {
      console.log('Successfully subscribed to room as receiver:', code)
      triggerEvent('peer-joined')
      setStatus('connecting')
    })

    channel.bind('signal', (signalData: any) => {
      if (!peerRef.current) {
        const peer = new SimplePeer({ initiator: false, trickle: true })
        peerRef.current = peer
        setupPeerEvents(peer)

        peer.on('signal', (sd) => {
          triggerEvent('signal', sd)
        })

        peer.signal(signalData)
      } else {
        peerRef.current.signal(signalData)
      }
    })

    channel.bind('peer-left', () => {
      setStatus('idle')
      cleanupPeer()
      console.log('Other peer left the room')
    })
  }, [setupPeerEvents, cleanupPeer, triggerEvent])

  const sendFiles = useCallback(async (files: File[]) => {
    const peer = peerRef.current
    if (!peer) return
    setStatus('sending')

    for (const file of files) {
      const meta = getFileMeta(file)

      setFileProgress(prev => [...prev, {
        name: file.name,
        size: file.size,
        progress: 0,
        status: 'transferring'
      }])

      peer.send(JSON.stringify({ type: 'meta', meta }))

      let offset = 0
      let chunkIndex = 0
      const READ_SIZE = 1024 * 1024 * 4;  

      while (offset < file.size) {
        const sliceEnd = Math.min(offset + READ_SIZE, file.size);
        const bigSlice = file.slice(offset, sliceEnd);
        const bigBuffer = await bigSlice.arrayBuffer();

        let internalOffset = 0;

        while (internalOffset < bigBuffer.byteLength) {
          const channel = (peer as any)._channel as RTCDataChannel;
          if (channel && channel.bufferedAmount > 1024 * 1024 * 4) { // 4MB high-water mark
            await new Promise<void>(resolve => {
              channel.bufferedAmountLowThreshold = 1024 * 1024 * 1; // 1MB low-water mark
              
              let fallbackInterval: NodeJS.Timeout;
              
              const onLow = () => {
                channel.removeEventListener('bufferedamountlow', onLow);
                clearInterval(fallbackInterval);
                resolve();
              };
              
              channel.addEventListener('bufferedamountlow', onLow);
               
              fallbackInterval = setInterval(() => {
                if (channel.bufferedAmount <= 1024 * 1024 * 1) {
                  onLow();
                }
              }, 50);
            });
          }
 
          const chunkEnd = Math.min(internalOffset + CHUNK_SIZE, bigBuffer.byteLength);
          const chunk = bigBuffer.slice(internalOffset, chunkEnd);
          peer.send(chunk);
          
          internalOffset += CHUNK_SIZE;
          offset += CHUNK_SIZE;
          chunkIndex++;
           
          if (chunkIndex % 200 === 0 || offset >= file.size) {
            const progress = Math.round((chunkIndex / meta.totalChunks) * 100)
            setFileProgress(prev => prev.map(f =>
              f.name === file.name ? { ...f, progress } : f
            ))
          }
        }
      }

      peer.send(JSON.stringify({ type: 'done' }))

      setFileProgress(prev => prev.map(f =>
        f.name === file.name ? { ...f, progress: 100, status: 'done' } : f
      ))
    }

    setStatus('done')
  }, [])

  const resetState = useCallback(() => {
    cleanupPeer()
    setStatus('idle')
    setFileProgress([])
    setReceivedFiles([])
    setRoomCode('')
    if (channelRef.current) {
      pusherRef.current?.unsubscribe(channelRef.current.name)
      channelRef.current = null
    }
    roomCodeRef.current = ''
  }, [cleanupPeer])

  useEffect(() => {
    const handleUnload = () => {
      if (roomCodeRef.current) {
        const blob = new Blob([JSON.stringify({
          channel: `private-room-${roomCodeRef.current}`,
          event: 'peer-left',
          socket_id: pusherRef.current?.connection?.socket_id
        })], { type: 'application/json' })
        navigator.sendBeacon('/api/pusher/trigger', blob)
      }
    }
    window.addEventListener('beforeunload', handleUnload)

    return () => {
      handleUnload()
      cleanupPeer()
      if (channelRef.current) {
        pusherRef.current?.unsubscribe(channelRef.current.name)
        channelRef.current = null
      }
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [cleanupPeer])

  return {
    status,
    roomCode,
    fileProgress,
    receivedFiles,
    generateRoomCode,
    joinRoom,
    sendFiles,
    downloadBlob,
    resetState,
  }
}