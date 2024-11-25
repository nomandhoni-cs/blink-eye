import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ModeToggle } from '@/components/ModeToggle'
import { 
  Home,
  FileText,
  Scale,
  LayoutPanelTop,
  Menu,
  type LucideIcon 
} from 'lucide-react'
import { useStore } from '@nanostores/react'
import { layoutStore, setLayout, type LayoutType } from '@/stores/layout'

const icons: Record<string, LucideIcon> = {
  Home,
  FileText,
  Scale,
}

interface SidebarProps {
  navigation: {
    title: string
    path: string
    icon: string
  }[]
  layout?: 'sidebar' | 'header'
  onLayoutChange?: (layout: 'sidebar' | 'header') => void
}

function isHeaderLayout(layout: unknown): layout is 'header' {
  return layout === 'header'
}

export function Sidebar({ navigation }: Omit<SidebarProps, 'layout' | 'onLayoutChange'>) {
  const [activePath, setActivePath] = useState('')
  const [isHovered, setIsHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const currentLayout = useStore(layoutStore) as LayoutType

  useEffect(() => {
    const checkLayout = () => {
      const isMobileView = window.innerWidth < 768
      setIsMobile(isMobileView)
      
      if (isMobileView) {
        setLayout('header')
      }
    }

    checkLayout()
    window.addEventListener('resize', checkLayout)
    return () => window.removeEventListener('resize', checkLayout)
  }, [])

  useEffect(() => {
    setActivePath(window.location.pathname)
  }, [])

  useEffect(() => {
    setIsHovered(false)
  }, [currentLayout])

  if (isMobile) {
    return (
      <>
        <header className="fixed top-0 left-0 right-0 h-16 bg-[var(--sidebar-bg)] z-40 flex items-center px-4">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-[hsl(var(--sidebar-fg))]"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1 flex justify-center">
            <img src="/logo.png" alt="Logo" className="h-8" />
          </div>
          
          <ModeToggle />
        </header>

        {/* Mobile Sidebar - Now slides from left */}
        <aside 
          className={cn(
            "fixed inset-y-0 left-0 w-64 bg-[var(--sidebar-bg)] z-50 transform transition-transform duration-200 ease-in-out",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
            "flex flex-col"
          )}
        >
          <div className="h-16 flex items-center px-4">
            <img src="/logo.png" alt="Logo" className="h-8" />
          </div>
          
          <nav className="flex-1 py-4">
            {navigation.map((item) => {
              const Icon = icons[item.icon]
              const isActive = activePath === item.path
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center h-11 px-4 text-[hsl(var(--sidebar-fg)_/_0.8)]",
                    "hover:bg-[var(--sidebar-hover)] hover:text-[hsl(var(--sidebar-fg))]",
                    isActive && "bg-[var(--sidebar-active)] text-[hsl(var(--sidebar-fg))]"
                  )}
                >
                  {Icon && <Icon className="w-5 h-5 mr-3" />}
                  <span>{item.title}</span>
                </a>
              )
            })}
          </nav>

          <div className="p-4 border-t border-[var(--sidebar-hover)]">
            <ModeToggle />
          </div>
        </aside>

        {/* Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </>
    )
  }

  if (currentLayout === 'header') {
    return (
      <header className="fixed top-0 left-0 right-0 h-16 bg-[var(--sidebar-bg)] z-40 flex items-center px-5">
        <div className="flex items-center h-full">
          <img src="/logo.png" alt="Logo" className="h-8" />
        </div>
        
        <nav className="flex items-center space-x-6 ml-8 flex-1">
          {navigation.map((item) => {
            const Icon = icons[item.icon]
            const isActive = activePath === item.path
            return (
              <a
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center text-[hsl(var(--sidebar-fg)_/_0.8)] hover:text-[hsl(var(--sidebar-fg))]",
                  "hover:bg-[var(--sidebar-hover)] px-3 py-2 rounded-md transition-colors",
                  isActive && "text-[hsl(var(--sidebar-fg))] bg-[var(--sidebar-active)]"
                )}
              >
                {Icon && <Icon className="w-5 h-5 mr-2" />}
                <span>{item.title}</span>
              </a>
            )
          })}
        </nav>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setLayout('sidebar')}
            className="text-[hsl(var(--sidebar-fg)_/_0.8)] hover:text-[hsl(var(--sidebar-fg))]
                       p-2 hover:bg-[var(--sidebar-hover)] rounded-md transition-colors"
          >
            <LayoutPanelTop className="w-5 h-5" />
          </button>
          <ModeToggle />
        </div>
      </header>
    )
  }

  return (
    <aside 
      className={cn(
        "group fixed left-0 h-screen w-16 hover:w-64",
        "bg-[var(--sidebar-bg)] hover:z-50",
        "transition-all duration-200 ease-out z-30",
        "flex flex-col",
        isHovered && "sidebar-expanded"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <a 
        href="/"
        className="h-16 flex items-center hover:bg-[var(--sidebar-hover)] transition-colors px-4"
      >
        <div className="flex items-center justify-center w-full">
          <img 
            src={isHovered || isHeaderLayout(currentLayout) ? "/logo.png" : "/icon.svg"} 
            alt="Logo" 
            className={cn(
              "transition-all duration-200",
              isHovered ? "h-8" : "h-6"
            )}
          />
        </div>
      </a>

      {/* Nav */}
      <nav className="flex-1 py-4">
        {navigation?.map((item) => {
          const Icon = icons[item.icon]
          const isActive = activePath === item.path
          
          return (
            <a
              key={item.path}
              href={item.path}
              className={cn(
                "group flex items-center h-11 w-full hover:bg-[var(--sidebar-hover)] relative overflow-hidden",
                "before:absolute before:inset-0 before:bg-white/5 before:translate-x-[-100%] before:hover:translate-x-0 before:transition-transform before:duration-300",
                isActive && "bg-[var(--sidebar-active)]"
              )}
            >
              <div className="min-w-[64px] flex items-center justify-center relative z-10">
                {Icon && <Icon className="sidebar-icon" />}
              </div>
              <span className="sidebar-text relative z-10">
                {item.title}
              </span>
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[hsl(var(--sidebar-fg))]" />
              )}
            </a>
          )
        })}
      </nav>

      {/* Layout Switcher and Theme Toggle */}
      <div className="py-4 border-t border-[var(--sidebar-hover)]">
        <button
          onClick={() => setLayout('header')}
          className={cn(
            "group flex items-center h-11 w-full hover:bg-[var(--sidebar-hover)] relative overflow-hidden",
            "before:absolute before:inset-0 before:bg-white/5 before:translate-x-[-100%] before:hover:translate-x-0 before:transition-transform before:duration-300"
          )}
        >
          <div className="min-w-[64px] flex items-center justify-center relative z-10">
            <LayoutPanelTop className="sidebar-icon" />
          </div>
          <span className="sidebar-text">
            Switch Layout
          </span>
        </button>
        <div 
          className={cn(
            "group flex items-center h-11 w-full hover:bg-[var(--sidebar-hover)] relative overflow-hidden",
            "before:absolute before:inset-0 before:bg-white/5 before:translate-x-[-100%] before:hover:translate-x-0 before:transition-transform before:duration-300"
          )}
        >
          <div className="min-w-[64px] flex items-center justify-center relative z-10">
            <ModeToggle />
          </div>
          <span className="sidebar-text">
            Switch Theme
          </span>
        </div>
      </div>
    </aside>
  )
} 