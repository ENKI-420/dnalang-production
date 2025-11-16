'use client'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: number
  unit?: string
  description?: string
  trend?: 'up' | 'down' | 'neutral'
  color?: string
  history?: number[]
  formatValue?: (value: number) => string
}

export function MetricCard({
  label,
  value,
  unit = '',
  description,
  trend,
  color = '#78a9ff',
  history = [],
  formatValue = (v) => v.toFixed(3)
}: MetricCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <Card className="bg-ibm-gray-90 border-ibm-gray-80 p-4 hover:border-ibm-gray-70 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-xs text-ibm-gray-50 mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <span 
              className="text-2xl font-mono font-bold" 
              style={{ color }}
            >
              {formatValue(value)}
            </span>
            {unit && <span className="text-xs text-ibm-gray-50">{unit}</span>}
          </div>
        </div>
        
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${
            trend === 'up' ? 'text-green-400' : 
            trend === 'down' ? 'text-red-400' : 
            'text-ibm-gray-50'
          }`}>
            <TrendIcon className="h-3 w-3" />
          </div>
        )}
      </div>

      {description && (
        <p className="text-xs text-ibm-gray-60 mb-3">{description}</p>
      )}

      <Progress 
        value={Math.min(value * 100, 100)} 
        className="h-1.5 bg-ibm-gray-100"
        style={{ 
          '--progress-background': color 
        } as React.CSSProperties}
      />

      {history.length > 0 && (
        <div className="mt-3 h-8 flex items-end gap-0.5">
          {history.map((val, i) => (
            <div
              key={i}
              className="flex-1 rounded-t transition-all"
              style={{
                height: `${Math.min((val / Math.max(...history)) * 100, 100)}%`,
                backgroundColor: color,
                opacity: 0.4 + (i / history.length) * 0.6,
                minHeight: '2px'
              }}
              title={formatValue(val)}
            />
          ))}
        </div>
      )}
    </Card>
  )
}
