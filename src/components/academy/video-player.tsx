'use client'

import React, { useState } from "react"
import { Play } from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoPlayerProps {
  videoUrl?: string | null
  thumbnailUrl?: string | null
}

export const VideoPlayer = ({ videoUrl, thumbnailUrl }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false)

  if (!videoUrl) {
    return (
      <div className="aspect-video bg-slate-900 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg relative group border-4 border-white">
        <img 
          src={thumbnailUrl || "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=400&h=200&auto=format&fit=crop"} 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          alt="Video thumbnail"
        />
        <div className="absolute inset-0 bg-slate-900/20" />
        <div className="relative z-10 text-white font-bold">אין סרטון לשיעור זה</div>
      </div>
    )
  }

  // Basic check for YouTube/Vimeo to wrap in iframe if needed
  const isYoutube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")
  const isVimeo = videoUrl.includes("vimeo.com")

  const getEmbedUrl = (url: string) => {
    if (isYoutube) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
      const match = url.match(regExp)
      return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : url
    }
    if (isVimeo) {
      const regExp = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/
      const match = url.match(regExp)
      return match ? `https://player.vimeo.com/video/${match[3]}?autoplay=1` : url
    }
    return url
  }

  const getYoutubeThumbnail = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`
    }
    return null
  }

  const activeThumbnail = isYoutube ? (getYoutubeThumbnail(videoUrl) || thumbnailUrl) : thumbnailUrl

  if (isPlaying) {
    return (
      <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-lg border-4 border-white relative">
        {(isYoutube || isVimeo) ? (
          <iframe
            src={getEmbedUrl(videoUrl)}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-full"
          />
        )}
      </div>
    )
  }

  return (
    <div 
      className="aspect-video bg-slate-900 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg relative group border-4 border-white cursor-pointer"
      onClick={() => setIsPlaying(true)}
    >
      <img 
        src={activeThumbnail || "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=400&h=200&auto=format&fit=crop"} 
        className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-1000"
        alt="Video thumbnail"
      />
      <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 transition-colors" />
      
      {/* Play Icon Overlay */}
      <div className="relative z-10 w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-white transition-all duration-300">
        <Play className="w-8 h-8 text-slate-900 fill-slate-900 translate-x-0.5" />
      </div>

      <div className="absolute bottom-6 right-6 z-10">
        <span className="text-white font-black text-lg drop-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">לצפייה בשיעור</span>
      </div>
    </div>
  )
}

