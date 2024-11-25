Create a beautiful sidebar 

here's some code. simplify it.


Sidebar.tsx

import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import type { BusinessConfig } from '../content/config';
import { 
  MessageSquare, 
  Activity,
  Code,
  Rocket,
  FileText,
  type LucideIcon 
} from 'lucide-react';

// Map icon names to Lucide components
const IconMap: Record<string, LucideIcon> = {
  MessageSquare,
  Activity,
  Code,
  Rocket,
  FileText,
};

interface SidebarProps {
  navigation: BusinessConfig['navigation']['sidebar'];
}

export function MainSidebar({ navigation }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePath, setActivePath] = useState('');

  useEffect(() => {
    setActivePath(window.location.pathname);
  }, []);

  return (
    <aside 
      className={cn(
        "fixed left-0 h-screen w-[60px] group hover:w-[240px] bg-black text-white",
        "transition-all duration-300 ease-in-out z-50",
        isOpen && "w-[240px]"
      )}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Logo Section - Now clickable */}
      <a 
        href="/"
        className="h-16 flex items-center border-b border-white/10 hover:bg-white/5 transition-colors"
      >
        <div className="min-w-[60px] flex items-center justify-center">
          <img 
            src="/ONE.svg" 
            alt="ONE Logo" 
            className="w-10 h-10 brightness-0 invert"
          />
        </div>
        <span className="ml-3 font-semibold text-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
          ONE
        </span>
      </a>

      {/* Navigation */}
      <nav className="h-[calc(100vh-4rem)] flex flex-col">
        <div className="flex-1 py-4">
          {navigation?.map((item) => {
            const Icon = item.icon?.name ? IconMap[item.icon.name] : null;
            const isActive = activePath === item.path;
            
            return (
              <Button
                key={item.path}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-white/80 hover:text-white hover:bg-white/10",
                  "flex items-center h-11 px-4 py-2 relative",
                  isActive && "text-white bg-white/5"
                )}
                asChild
              >
                <a href={item.path} className="flex items-center">
                  {Icon && (
                    <span className={cn(
                      "min-w-[20px] w-5 h-5 mr-4",
                      item.icon?.class,
                      isActive && "text-primary"
                    )}>
                      <Icon className="w-full h-full" />
                    </span>
                  )}
                  <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
                    {item.title}
                  </span>
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
                  )}
                </a>
              </Button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
} 

here's an example layout.astro
---
import { getConfig, getMetadata } from '../lib/config';
import { cn } from '../lib/utils';
import Header from '../components/Header.astro';
import { MainSidebar } from "../components/Sidebar";
import Footer from '../components/Footer.astro';

interface Props {
  title: string;
  description?: string;
  image?: string;
  type?: string;
  children: any;
  showFooter?: boolean;
}

const { title, description, image, type, showFooter = true } = Astro.props;
const config = await getConfig();
const metadata = getMetadata(config, Astro.props);
---

<!DOCTYPE html>
<html 
  lang="en"
  class="scroll-smooth"
  dir="ltr"
>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{metadata.title}</title>
    <meta name="description" content={metadata.description} />
    
    <!-- Preload critical assets -->
    <link rel="preconnect" href="https://rsms.me/" crossorigin />
    <link 
      rel="preload" 
      href="https://rsms.me/inter/inter.css" 
      as="style" 
    />
    <link 
      rel="stylesheet"
      href="https://rsms.me/inter/inter.css"
      media="print"
      onload="this.media='all'"
    />
    <noscript>
      <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
    </noscript>
    
    <!-- Inline critical CSS -->
    <style is:inline>
      /* Critical CSS */
      :root {
        color-scheme: light;
      }
      
      body {
        margin: 0;
        background: #ffffff;
        color: #1a1a1a;
        font-family: system-ui, -apple-system, sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      
      .sidebar {
        transition: width 0.2s ease-in-out;
        will-change: width;
      }
    </style>

    <!-- OpenGraph -->
    <meta property="og:title" content={metadata.openGraph.title} />
    <meta property="og:description" content={metadata.openGraph.description} />
    <meta property="og:image" content={metadata.openGraph.image} />
    
    <!-- Twitter -->
    <meta name="twitter:card" content={metadata.twitter.card} />
    <meta name="twitter:title" content={metadata.twitter.title} />
    <meta name="twitter:description" content={metadata.twitter.description} />
    <meta name="twitter:image" content={metadata.twitter.image} />
    <link rel="icon" type="image/svg+xml" href={config.brand.favicon.svg} />

    <!-- Add meta tags for accessibility -->
    <meta name="theme-color" content="#ffffff" />
    <meta name="color-scheme" content="light" />
    
    <!-- Add aria-description for screen readers -->
    <meta 
      name="aria-description" 
      content={metadata.description} 
    />

    <!-- Accessibility meta tags -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="format-detection" content="telephone=no" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    
    <!-- Add keyboard navigation hint -->
    <script>
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          document.body.classList.add('user-is-tabbing');
        }
      });
      
      window.addEventListener('mousedown', () => {
        document.body.classList.remove('user-is-tabbing');
      });
    </script>
  </head>
  <body 
    class={cn(
      "min-h-screen bg-background antialiased flex flex-col",
      type === 'chat' && "overflow-hidden"
    )}
    role="document"
  >
    <!-- Improve skip link -->
    <a 
      href="#main-content" 
      class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:outline focus:outline-2 focus:outline-offset-2 focus:rounded"
    >
      Skip to main content
    </a>
    
    <div class="flex flex-1" role="presentation">
      <div 
        id="sidebar-container"
        class={cn(
          "fixed left-0 h-screen sidebar",
          "transform transition-transform duration-200",
          "lg:translate-x-0",
          type === 'chat' ? 'z-50' : 'z-40'
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <MainSidebar 
          navigation={config.navigation.sidebar} 
          client:load 
        />
      </div>
      
      <div class="flex-1 ml-[60px] flex flex-col" role="presentation">
        <header role="banner">
          <Header 
            buttons={config.navigation.top.buttons}
            logo={config.navigation.top.logo}
          />
        </header>
        
        <main 
          id="main-content"
          class={cn(
            "container mx-auto flex-1",
            type === 'chat' ? 'p-0' : 'px-4 py-8'
          )}
          tabindex="-1"
          aria-label="Main content"
        >
          <slot />
        </main>

        {showFooter && type !== 'chat' && (
          <footer role="contentinfo">
            <Footer 
              columns={config.footer.columns}
              bottom={config.footer.bottom}
            />
          </footer>
        )}
      </div>
    </div>
  </body>
</html>

<style is:global>
  :root {
    /* System font stacks */
    --font-sans: {config.brand.fonts.system.sans};
    --font-serif: {config.brand.fonts.system.serif};
    --font-mono: {config.brand.fonts.system.mono};
    
    /* Semantic font assignments */
    --font-heading: {config.brand.fonts.heading};
    --font-body: {config.brand.fonts.body};
    --font-code: {config.brand.fonts.code};
    
    /* Add high contrast focus styles */
    --focus-ring-color: #005fcc;
    --focus-ring-offset: 3px;
  }

  html {
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    font-weight: 600;
    letter-spacing: -0.025em;
  }

  pre, code {
    font-family: var(--font-mono);
  }

  blockquote {
    font-family: var(--font-serif);
  }

  /* Improve focus styles */
  :focus-visible {
    outline: 2px solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  /* Improve text contrast */
  body {
    color: #1a1a1a;
    line-height: 1.5;
    letter-spacing: 0.01em;
  }

  /* Improve heading contrast and spacing */
  h1, h2, h3, h4, h5, h6 {
    color: #000000;
    margin-block: 0.75em;
  }

  /* Add reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
    
    .sidebar {
      transition: none !important;
    }
  }

  /* Improve keyboard navigation visibility */
  .user-is-tabbing :focus {
    outline: 3px solid var(--focus-ring-color) !important;
    outline-offset: var(--focus-ring-offset) !important;
  }

  /* Improve link underlines for better visibility */
  a:not([class]) {
    text-decoration-thickness: 1px;
    text-underline-offset: 0.2em;
  }

  /* Improve button focus states */
  button:focus {
    outline: 2px solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  /* Add visible focus styles for interactive elements */
  a:focus,
  button:focus,
  input:focus,
  select:focus,
  textarea:focus {
    outline: 2px solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  /* Improve text selection contrast */
  ::selection {
    background-color: #005fcc;
    color: white;
  }

  /* Hide elements with aria-hidden */
  [aria-hidden="true"] {
    display: none !important;
  }

  /* Improve skip link visibility */
  .sr-only:not(:focus):not(:active) {
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }
</style>

<script>
  import { isSidebarOpen } from '@/stores/sidebar';

  const sidebarContainer = document.getElementById('sidebar-container');
  const sidebarTrigger = document.getElementById('sidebar-trigger');
  
  const isMobile = () => window.innerWidth < 640;

  if (isMobile()) {
    sidebarTrigger?.addEventListener('mouseenter', () => {
      isSidebarOpen.set(true);
    });

    sidebarContainer?.addEventListener('mouseleave', () => {
      isSidebarOpen.set(false);
    });
  }

  isSidebarOpen.subscribe((isOpen: boolean) => {
    if (sidebarContainer && isMobile()) {
      sidebarContainer.classList.toggle('hidden', !isOpen);
    }
  });

  if (isMobile()) {
    sidebarContainer?.classList.add('hidden');
  }

  window.addEventListener('resize', () => {
    if (sidebarContainer) {
      if (!isMobile()) {
        sidebarContainer.classList.remove('hidden');
      } else if (!isSidebarOpen.get()) {
        sidebarContainer.classList.add('hidden');
      }
    }
  });
</script> 

here a store for the sidebar. 
import { atom } from 'nanostores'

export const isSidebarOpen = atom(false) 

app/globals.css
@layer base {
  :root {
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
 
  .dark {
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224.3 76.3% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}