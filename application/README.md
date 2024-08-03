# [Tauri](https://beta.tauri.app/) System Tray App

## Getting Started

This project is created with `Node` and `npm`. Run an `npm install` to get started and make certain you have the [Tauri prerequisites installed](https://beta.tauri.app/start/prerequisites/).

To run the Tauri app in development mode, use:

```shell
npm run tauri dev
```

## Development

The source folder includes two main folders: `src/app-api` and `src/view`. The `app-api` has implemented the Tauri APIs as abstracted pieces to improve the ability shift and move their lifecycle and startup hook as required. The `view` includes the main React view layer.

The Tauri `app-api` functions return API hooks and/or use React Context, see `src/context.ts`, to enable use within the view layers. The `src-tauri` folder implements the minimal required Tauri builder Rust code, and plugin initialization.

To modify the system tray menu items, see the initial array of items in `src/view/App.tsx`. To send notifications, see the example in `src/view/Home.tsx` which fires a notification on button click. The global shortcuts are not exposed through the React Context, but can be modified directly in `src/app-api/setupShortcuts.ts`.

## Background

This was created based off of the [Tauri system tray app template](https://github.com/jbolda/personal-tray-app).
