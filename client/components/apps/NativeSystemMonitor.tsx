import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Monitor, Cpu, MemoryStick, HardDrive, Wifi, 
  Battery, Thermometer, Activity, RefreshCw,
  Server, Zap, Clock, Database, Globe
} from 'lucide-react'
import { useThemeStore } from '@/store/theme-store'
import { useTauriIntegration } from '@/hooks/useTauriIntegration'
import { cn } from '@/lib/utils'

interface SystemMetrics {
  cpu: {
    usage: number
    cores: number
    frequency: number
    temperature?: number
  }
  memory: {
    total: number
    used: number
    available: number
    cached?: number
  }
  disk: {
    total: number
    used: number
    free: number
  }
  network: {
    upload: number
    download: number
    latency?: number
  }
  system: {
    uptime: number
    processes: number
    loadAverage: number[]
  }
}

interface MetricCardProps {
  title: string
  icon: React.ReactNode
  value: string
  subvalue?: string
  percentage?: number
  color: string
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, icon, value, subvalue, percentage, color 
}) => {
  const { settings: themeSettings } = useThemeStore()
  
  return (
    <motion.div
      className={cn(
        "p-4 rounded-xl border transition-all duration-300 hover:scale-105",
        themeSettings.mode === 'dark' 
          ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
          : 'bg-white border-gray-200 hover:bg-gray-50'
      )}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={cn("p-2 rounded-lg", `bg-${color}-500/20`)}>
          <div className={cn("text-lg", `text-${color}-500`)}>
            {icon}
          </div>
        </div>
        {percentage !== undefined && (
          <div className={cn(
            "text-xs px-2 py-1 rounded-full",
            percentage > 80 ? 'bg-red-500/20 text-red-500' :
            percentage > 60 ? 'bg-yellow-500/20 text-yellow-500' :
            'bg-green-500/20 text-green-500'
          )}>
            {percentage.toFixed(1)}%
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        <div className="text-xl font-bold">{value}</div>
        {subvalue && (
          <div className="text-sm text-gray-400 mt-1">{subvalue}</div>
        )}
      </div>
      
      {percentage !== undefined && (
        <div className="mt-3">
          <div className={cn(
            "w-full bg-gray-200 rounded-full h-2",
            themeSettings.mode === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          )}>
            <motion.div
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                percentage > 80 ? 'bg-red-500' :
                percentage > 60 ? 'bg-yellow-500' :
                'bg-green-500'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}
    </motion.div>
  )
}

export const NativeSystemMonitor: React.FC = () => {
  const { settings: themeSettings } = useThemeStore()
  const { isNative, systemInfo, performanceInfo, systemControls } = useTauriIntegration()
  
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: { usage: 0, cores: 4, frequency: 2400 },
    memory: { total: 8192, used: 4096, available: 4096 },
    disk: { total: 512000, used: 256000, free: 256000 },
    network: { upload: 0, download: 0 },
    system: { uptime: 0, processes: 150, loadAverage: [0.5, 0.7, 0.6] }
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Generate mock metrics for demo
  const generateMockMetrics = (): SystemMetrics => ({
    cpu: {
      usage: Math.random() * 100,
      cores: systemInfo?.cpu_count || 4,
      frequency: 2400 + Math.random() * 800,
      temperature: 45 + Math.random() * 30
    },
    memory: {
      total: 8192,
      used: 3000 + Math.random() * 2000,
      available: 8192 - (3000 + Math.random() * 2000),
      cached: 1000 + Math.random() * 500
    },
    disk: {
      total: 512000,
      used: 200000 + Math.random() * 100000,
      free: 512000 - (200000 + Math.random() * 100000)
    },
    network: {
      upload: Math.random() * 1000,
      download: Math.random() * 5000,
      latency: 10 + Math.random() * 50
    },
    system: {
      uptime: Date.now() - (Math.random() * 86400000), // Random uptime up to 24h
      processes: 120 + Math.floor(Math.random() * 80),
      loadAverage: [Math.random(), Math.random(), Math.random()]
    }
  })

  // Load system metrics
  const loadMetrics = async () => {
    setIsLoading(true)
    
    try {
      if (isNative && performanceInfo) {
        // TODO: Parse actual performance info from Tauri
        // For now, generate mock data
        setMetrics(generateMockMetrics())
      } else {
        // Web fallback with mock data
        setMetrics(generateMockMetrics())
      }
    } catch (error) {
      console.error('Failed to load system metrics:', error)
    }
    
    setIsLoading(false)
  }

  // Auto-refresh metrics
  useEffect(() => {
    loadMetrics()
    
    if (autoRefresh) {
      const interval = setInterval(loadMetrics, 2000) // Update every 2 seconds
      return () => clearInterval(interval)
    }
  }, [isNative, performanceInfo, autoRefresh])

  // Format bytes
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Format uptime
  const formatUptime = (timestamp: number): string => {
    const now = Date.now()
    const uptimeMs = now - timestamp
    const hours = Math.floor(uptimeMs / (1000 * 60 * 60))
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className={cn(
      "h-full overflow-auto",
      themeSettings.mode === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    )}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">System Monitor</h1>
            <p className="text-gray-500 mt-1">
              {isNative ? 'Native' : 'Web'} • {systemInfo?.platform || 'Unknown'} • {systemInfo?.arch || 'Unknown'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={cn(
                "px-3 py-2 rounded-lg text-sm transition-colors",
                autoRefresh 
                  ? 'bg-green-500/20 text-green-500' 
                  : 'bg-gray-500/20 text-gray-500'
              )}
            >
              {autoRefresh ? 'Auto Refresh' : 'Manual'}
            </button>
            
            <button
              onClick={loadMetrics}
              className="p-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* CPU */}
          <MetricCard
            title="CPU Usage"
            icon={<Cpu className="w-5 h-5" />}
            value={`${metrics.cpu.usage.toFixed(1)}%`}
            subvalue={`${metrics.cpu.cores} cores • ${metrics.cpu.frequency.toFixed(0)} MHz`}
            percentage={metrics.cpu.usage}
            color="blue"
          />

          {/* Memory */}
          <MetricCard
            title="Memory"
            icon={<MemoryStick className="w-5 h-5" />}
            value={formatBytes(metrics.memory.used * 1024 * 1024)}
            subvalue={`of ${formatBytes(metrics.memory.total * 1024 * 1024)}`}
            percentage={(metrics.memory.used / metrics.memory.total) * 100}
            color="green"
          />

          {/* Disk */}
          <MetricCard
            title="Storage"
            icon={<HardDrive className="w-5 h-5" />}
            value={formatBytes(metrics.disk.used * 1024 * 1024)}
            subvalue={`of ${formatBytes(metrics.disk.total * 1024 * 1024)}`}
            percentage={(metrics.disk.used / metrics.disk.total) * 100}
            color="purple"
          />

          {/* Network Upload */}
          <MetricCard
            title="Network Upload"
            icon={<Wifi className="w-5 h-5" />}
            value={`${(metrics.network.upload / 1024).toFixed(1)} KB/s`}
            subvalue={metrics.network.latency ? `${metrics.network.latency.toFixed(0)}ms latency` : undefined}
            color="orange"
          />

          {/* Network Download */}
          <MetricCard
            title="Network Download"
            icon={<Globe className="w-5 h-5" />}
            value={`${(metrics.network.download / 1024).toFixed(1)} KB/s`}
            subvalue="Incoming traffic"
            color="cyan"
          />

          {/* System Info */}
          <MetricCard
            title="System"
            icon={<Server className="w-5 h-5" />}
            value={`${metrics.system.processes}`}
            subvalue={`processes • ${formatUptime(metrics.system.uptime)} uptime`}
            color="indigo"
          />

          {/* Temperature (if available) */}
          {metrics.cpu.temperature && (
            <MetricCard
              title="Temperature"
              icon={<Thermometer className="w-5 h-5" />}
              value={`${metrics.cpu.temperature.toFixed(1)}°C`}
              subvalue="CPU temperature"
              percentage={(metrics.cpu.temperature / 100) * 100}
              color="red"
            />
          )}

          {/* Load Average */}
          <MetricCard
            title="Load Average"
            icon={<Activity className="w-5 h-5" />}
            value={metrics.system.loadAverage[0].toFixed(2)}
            subvalue={`${metrics.system.loadAverage[1].toFixed(2)} • ${metrics.system.loadAverage[2].toFixed(2)}`}
            color="yellow"
          />

          {/* Performance Score */}
          <MetricCard
            title="Performance"
            icon={<Zap className="w-5 h-5" />}
            value={`${(100 - metrics.cpu.usage).toFixed(0)}%`}
            subvalue="System efficiency"
            percentage={100 - metrics.cpu.usage}
            color="emerald"
          />
        </div>

        {/* System Information */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">System Information</h2>
          <div className={cn(
            "p-4 rounded-xl border",
            themeSettings.mode === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          )}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Platform:</span>
                <span className="ml-2 font-mono">{systemInfo?.platform || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-gray-500">Architecture:</span>
                <span className="ml-2 font-mono">{systemInfo?.arch || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-gray-500">Hostname:</span>
                <span className="ml-2 font-mono">{systemInfo?.hostname || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-gray-500">Runtime:</span>
                <span className="ml-2 font-mono">{isNative ? 'Tauri Native' : 'Web Browser'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NativeSystemMonitor
