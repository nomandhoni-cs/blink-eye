# 🚀 Astro 5 + Shadcn/UI Starter Kit

A lightning-fast starter template combining Astro's performance with Shadcn's beautiful components.

### 🎨  Screenshots
![Dark Mode](https://astro-shadcn.agentc.app/screenshots/screenshot-dark.png)
![Light Mode](https://astro-shadcn.agentc.app/screenshots/screenshot-light.png)


## ⚡ Quick Start

```bash
# Clone the repository
git clone https://github.com/agentc-app/astro-shadcn.git

# Navigate to project
cd astro-shadcn

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:4321` - You're ready to go! 🎉

## 🎨 Pre-installed Components

All Shadcn/UI components are pre-configured for Astro:

```astro
---
// Example usage in .astro file
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
---

<Button>Click me!</Button>
```

### Available Components
- ✅ Accordion
- ✅ Alert Dialog
- ✅ Avatar
- ✅ Badge
- ✅ Button
- ✅ Card
- ✅ Dialog
- ... and more!

## 🛠️ Project Structure

```text
your-project/
├── src/
│   ├── components/
│   │   └── ui/          # All Shadcn components
│   ├── layouts/
│   │   └── Layout.astro # Base layout
│   └── pages/
│       └── index.astro  # Homepage
├── astro.config.mjs     # Astro configuration
└── tailwind.config.cjs  # Tailwind configuration
```

## 🔧 Configuration

### Astro is Setup
```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [
    tailwind(),
    react(), // Required for Shadcn components
  ],
  // Error suppression
  vite: {
    build: {
      suppressWarnings: true,
    }
  }
});
```

### Using Components

```astro
---
// src/pages/index.astro
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
---

<Card>
  <CardHeader>
    <CardTitle>Welcome to Astro + Shadcn!</CardTitle>
  </CardHeader>
  <Button client:load>Interactive Button</Button>
</Card>
```

## 🚀 Development Workflow

1. **Start Development**
   ```bash
   npm run dev
   ```

2. **Using React Components in Astro**
   ```astro
   ---
   // Always add client:load for interactive components
   import { Dialog } from "@/components/ui/dialog"
   ---
   
   <Dialog client:load>
     <!-- Dialog content -->
   </Dialog>
   ```

3. **Build for Production**
   ```bash
   npm run build
   npm run preview # Test the production build
   ```

## 🔍 Troubleshooting

### Common Issues Solved

✅ **Component Hydration**: All interactive components use `client:load`
✅ **Build Warnings**: Suppressed in configuration
✅ **Path Aliases**: Pre-configured for easy imports
✅ **React Integration**: Properly set up for Shadcn

### Quick Fixes

1. **Clear Cache**
   ```bash
   rm -rf dist node_modules .astro
   npm install
   ```

2. **Restart Dev Server**
   ```bash
   # Kill the dev server and restart
   npm run dev
   ```

## 💡 Pro Tips

1. **Component Usage in Astro**
   ```astro
   ---
   // Always import in the frontmatter
   import { Button } from "@/components/ui/button"
   ---
   
   <!-- Use in template -->
   <Button client:load>Click me!</Button>
   ```

2. **Styling with Tailwind**
   ```astro
   <div class="dark:bg-slate-800">
     <Button class="m-4">Styled Button</Button>
   </div>
   ```

3. **Layout Usage**
   ```astro
   ---
   import Layout from '../layouts/Layout.astro';
   ---
   
   <Layout title="Home">
     <!-- Your content -->
   </Layout>
   ```

## 📊 Performance & Screenshots

### ⚡ Lighthouse Scores
![Desktop Performance](https://astro-shadcn.agentc.app/screenshots/lighthouse-desktop.png)
![Mobile Performance](https://astro-shadcn.agentc.app/screenshots/lighthouse-mobile.png)

Perfect scores across all metrics:
- 🚀 Performance: 100
- ♿ Accessibility: 100
- 🔧 Best Practices: 100
- 🔍 SEO: 100



## 📚 Quick Links

- [Astro Documentation](https://docs.astro.build)
- [Shadcn/UI Components](https://ui.shadcn.com/docs/components/accordion)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 🤝 Need Help?

- Join [Astro Discord](https://astro.build/chat)
- Check [Astro Documentation](https://docs.astro.build)
- File an [Issue on GitHub](https://github.com/agentc-app/astro-shadcn/issues)

---

Built with 🚀 Astro and 🎨 Shadcn/UI by [AgentC](https://agentc.app)
