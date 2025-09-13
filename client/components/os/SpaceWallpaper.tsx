import React from 'react'
import { motion } from 'framer-motion'

export const SpaceWallpaper: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Base deep space gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900" />
      
      {/* Nebula layers */}
      <motion.div
        className="absolute inset-0 opacity-60"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 120,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear',
        }}
        style={{
          background: `
            radial-gradient(ellipse 800px 600px at 20% 40%, rgba(147, 51, 234, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse 600px 800px at 80% 70%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse 400px 300px at 60% 20%, rgba(236, 72, 153, 0.25) 0%, transparent 50%)
          `,
          backgroundSize: '200% 200%',
        }}
      />
      
      {/* Secondary nebula layer */}
      <motion.div
        className="absolute inset-0 opacity-40"
        animate={{
          backgroundPosition: ['100% 0%', '0% 100%'],
        }}
        transition={{
          duration: 100,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear',
        }}
        style={{
          background: `
            radial-gradient(ellipse 1000px 400px at 40% 80%, rgba(168, 85, 247, 0.2) 0%, transparent 60%),
            radial-gradient(ellipse 300px 600px at 90% 30%, rgba(34, 197, 94, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 500px 500px at 10% 60%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)
          `,
          backgroundSize: '250% 250%',
        }}
      />
      
      {/* Dust and gas clouds */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%'],
        }}
        transition={{
          duration: 200,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear',
        }}
        style={{
          background: `
            radial-gradient(ellipse 1200px 200px at 50% 30%, rgba(255, 255, 255, 0.02) 0%, transparent 70%),
            radial-gradient(ellipse 800px 150px at 20% 70%, rgba(139, 92, 246, 0.05) 0%, transparent 70%),
            radial-gradient(ellipse 600px 100px at 80% 90%, rgba(79, 70, 229, 0.03) 0%, transparent 70%)
          `,
          backgroundSize: '300% 300%',
        }}
      />
      
      {/* Large distant stars */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={`star-large-${i}`}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            filter: 'blur(0.5px)',
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: 'easeInOut',
          }}
        />
      ))}
      
      {/* Medium stars */}
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={`star-medium-${i}`}
          className="absolute w-0.5 h-0.5 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}
      
      {/* Small twinkling stars */}
      {Array.from({ length: 100 }).map((_, i) => (
        <motion.div
          key={`star-small-${i}`}
          className="absolute w-px h-px bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
      
      {/* Shooting stars */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={`meteor-${i}`}
          className="absolute w-1 h-px bg-gradient-to-r from-white to-transparent"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            transformOrigin: 'left center',
          }}
          animate={{
            x: [0, 300],
            y: [0, 200],
            opacity: [0, 1, 0],
            scaleX: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 10 + i * 15,
            ease: 'easeOut',
          }}
        />
      ))}
      
      {/* Slow-moving cosmic dust */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          background: `
            radial-gradient(2px 2px at 20% 30%, rgba(255, 255, 255, 0.1), transparent),
            radial-gradient(2px 2px at 40% 70%, rgba(255, 255, 255, 0.1), transparent),
            radial-gradient(1px 1px at 90% 40%, rgba(255, 255, 255, 0.1), transparent),
            radial-gradient(1px 1px at 10% 80%, rgba(255, 255, 255, 0.1), transparent)
          `,
          backgroundSize: '200px 200px, 300px 300px, 150px 150px, 250px 250px',
        }}
      />
      
      {/* Galactic core glow */}
      <motion.div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-1/3 opacity-10"
        animate={{
          opacity: [0.05, 0.15, 0.05],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: 'radial-gradient(ellipse 100% 100% at center bottom, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}
