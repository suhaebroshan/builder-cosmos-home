import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallpaperStore, startWallpaperCarousel, stopWallpaperCarousel } from '@/store/wallpaper-store'
import { SpaceWallpaper } from './SpaceWallpaper'

export const DynamicWallpaper: React.FC = () => {
  const {
    settings,
    getCurrentWallpaper,
    getWallpaper
  } = useWallpaperStore()
  
  const [currentWallpaperData, setCurrentWallpaperData] = useState(getCurrentWallpaper())
  const videoRef = useRef<HTMLVideoElement>(null)

  // Update wallpaper when settings change
  useEffect(() => {
    setCurrentWallpaperData(getCurrentWallpaper())
  }, [settings.currentWallpaper, getCurrentWallpaper])

  // Handle carousel mode
  useEffect(() => {
    if (settings.wallpaperMode === 'carousel') {
      startWallpaperCarousel()
    } else {
      stopWallpaperCarousel()
    }

    return () => stopWallpaperCarousel()
  }, [settings.wallpaperMode, settings.carouselInterval])

  // Handle video wallpaper
  useEffect(() => {
    if (settings.wallpaperMode === 'video' && settings.videoWallpaper) {
      const videoWallpaper = getWallpaper(settings.videoWallpaper)
      if (videoWallpaper && videoRef.current) {
        videoRef.current.src = videoWallpaper.url
        videoRef.current.play()
      }
    }
  }, [settings.wallpaperMode, settings.videoWallpaper, getWallpaper])

  const renderWallpaper = () => {
    switch (settings.wallpaperMode) {
      case 'video':
        if (settings.videoWallpaper) {
          const videoWallpaper = getWallpaper(settings.videoWallpaper)
          if (videoWallpaper) {
            return (
              <motion.video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                style={{
                  opacity: settings.opacity / 100,
                  filter: `blur(${settings.blur}px)`
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: settings.opacity / 100 }}
                transition={{ duration: 0.5 }}
              >
                <source src={videoWallpaper.url} type="video/mp4" />
              </motion.video>
            )
          }
        }
        break

      case 'single':
      case 'carousel':
        if (currentWallpaperData) {
          if (currentWallpaperData.type === 'image') {
            return (
              <motion.div
                className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${currentWallpaperData.url})`,
                  opacity: settings.opacity / 100,
                  filter: `blur(${settings.blur}px)`
                }}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: settings.opacity / 100, scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                key={currentWallpaperData.id}
              />
            )
          } else if (currentWallpaperData.type === 'video') {
            return (
              <motion.video
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                style={{
                  opacity: settings.opacity / 100,
                  filter: `blur(${settings.blur}px)`
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: settings.opacity / 100 }}
                transition={{ duration: 0.5 }}
                key={currentWallpaperData.id}
              >
                <source src={currentWallpaperData.url} type="video/mp4" />
              </motion.video>
            )
          }
        }
        break

      default:
        break
    }

    // Fallback to space wallpaper
    return <SpaceWallpaper />
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence mode="wait">
        {renderWallpaper()}
      </AnimatePresence>
      
      {/* Overlay for additional effects */}
      <div 
        className="absolute inset-0 bg-black transition-opacity duration-500"
        style={{ opacity: (100 - settings.opacity) / 100 * 0.3 }}
      />
      
      {/* Quantum grid overlay for futuristic effect */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>
    </div>
  )
}
