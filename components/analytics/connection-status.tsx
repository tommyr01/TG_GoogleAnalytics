"use client"

import { cn } from "@/lib/utils"

interface ConnectionStatusProps {
  isConnected: boolean
  className?: string
}

export function ConnectionStatus({ isConnected, className }: ConnectionStatusProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="flex items-center space-x-2 px-2 py-1 rounded-full border text-xs font-medium">
        <div
          className={cn(
            "size-2 rounded-full",
            isConnected
              ? "bg-green-500 animate-pulse"
              : "bg-red-500"
          )}
        />
        <span
          className={cn(
            "font-medium",
            isConnected
              ? "text-green-700 dark:text-green-400"
              : "text-red-700 dark:text-red-400"
          )}
        >
          {isConnected ? "Live" : "Disconnected"}
        </span>
      </div>
    </div>
  )
}