// components/shared/WelcomeOverlay.tsx
import { CheckCircle } from 'lucide-react'

interface WelcomeOverlayProps {
  isVisible: boolean
  title?: string
  subtitle?: string
}

export const WelcomeOverlay = ({ 
  isVisible, 
  title = "Welcome Back!", 
  subtitle = "Successfully authenticated to platform" 
}: WelcomeOverlayProps) => {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-teal-500/20 backdrop-blur-sm
                   animate-in fade-in duration-500
                   after:animate-in after:fade-out after:duration-1000 after:delay-2000
                   data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:duration-500 data-[state=closed]:delay-2500">
      
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-green-200/50 max-w-md w-full
                       animate-in zoom-in duration-700 delay-300
                       animate-out zoom-out duration-500 delay-2000">
          
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mx-auto mb-4 
                           flex items-center justify-center relative overflow-hidden
                           animate-in zoom-in duration-500 delay-500
                           animate-bounce">
              <CheckCircle className="w-10 h-10 text-green-600 z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 
                             animate-pulse duration-1000"></div>
            </div>
            
            <h2 className="text-2xl font-bold text-green-900 mb-2
                          animate-in slide-in-from-bottom-4 duration-500 delay-700">
              {title}
            </h2>
            
            <p className="text-green-700/80 text-sm
                          animate-in slide-in-from-bottom-4 duration-500 delay-900">
              {subtitle}
            </p>
          </div>

          <div className="flex justify-center space-x-2 mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-200"></div>
          </div>

          <div className="relative h-1 bg-green-100 rounded-full overflow-hidden">
            <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full
                           animate-[width_1.2s_ease-in-out] w-0 
                           [animation-fill-mode:forwards]
                           [animation-name:progress-bar]"></div>
          </div>
        </div>
      </div>
    </div>
  )
}