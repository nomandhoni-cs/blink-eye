import { atom } from 'nanostores'

export type LayoutType = 'sidebar' | 'header'

// Create the store with proper typing
export const layoutStore = atom<LayoutType>('sidebar')

// Helper functions
export function setLayout(layout: LayoutType) {
  layoutStore.set(layout)
  if (window.innerWidth >= 768) { // Only save preference on desktop
    localStorage.setItem('layoutPreference', layout)
  }
  document.documentElement.setAttribute('data-layout', layout)
}

export function initLayout() {
  const isMobile = window.innerWidth < 768
  if (isMobile) {
    setLayout('header')
    return
  }
  
  const savedLayout = localStorage.getItem('layoutPreference') as LayoutType | null
  setLayout(savedLayout || 'sidebar')
} 