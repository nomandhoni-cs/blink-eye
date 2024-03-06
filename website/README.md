# Vini Boilerplate

A Next.js template for building apps with Radix UI and Tailwind CSS.

# Use this template

```bash
  pnpm create next-app -e https://github.com/vinihvc/vini-boilerplate
```

## Features

- Radix
- Tailwind 
- Lucide icons
- Dark mode ready
- Storybook
- Biome
- Husky + lint-staged
- [shadcn/ui](https://ui.shadcn.com/) components

### Class Merging

The `cn` util handles conditional classes and class merging.

### Input

```ts
cn("px-2 bg-neutral-100 py-2 bg-neutral-200");
// Outputs `p-2 bg-neutral-200`
```

## License

Licensed under the [MIT license](https://github.com/shadcn/ui/blob/main/LICENSE.md).
