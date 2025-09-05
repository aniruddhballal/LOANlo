// components/shared/DashboardLayout.tsx
import type { ReactNode } from 'react'
import { WelcomeOverlay } from './WelcomeOverlay'
import { DashboardHeader } from './DashboardHeader'
import { useLoginOverlay } from './hooks/useLoginOverlay'

interface DashboardLayoutProps {
  title: string
  subtitle?: string
  welcomeTitle?: string
  welcomeSubtitle?: string
  children: ReactNode
}

export const DashboardLayout = ({ 
  title, 
  subtitle, 
  welcomeTitle, 
  welcomeSubtitle, 
  children 
}: DashboardLayoutProps) => {
  const justLoggedIn = useLoginOverlay()

  return (
    <div className="min-h-screen bg-slate-50">
      <WelcomeOverlay 
        isVisible={justLoggedIn}
        title={welcomeTitle}
        subtitle={welcomeSubtitle}
      />

      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 opacity-60"></div>
      
      <div className={`relative z-10 transition-all duration-1000 ease-out ${
        justLoggedIn ? 'scale-95 opacity-50 blur-sm' : 'scale-100 opacity-100 blur-0'
      }`}>
        <DashboardHeader title={title} subtitle={subtitle} />
        
        <main className={`max-w-7xl mx-auto px-6 lg:px-8 py-8 transition-all duration-1000 delay-300 ${
          justLoggedIn ? 'animate-in slide-in-from-bottom-8 fade-in' : ''
        }`}>
          {children}
        </main>
      </div>

      <style>{`
        @keyframes progress-bar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  )
}