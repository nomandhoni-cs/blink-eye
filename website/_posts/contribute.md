---
title: "Contribute"
excerpt: "If you want to contribute to Blink Eye, please follow these steps. Contributions are welcome! Feel free to open issues or submit pull requests."
keywords: "contribute, issues, pull requests, contribute to blink eye, contribute to website, contribute to dashboard, contribute to notifier"
coverImage: "https://utfs.io/f/93hqarYp4cDde9Yt7jnAGUrMQKVoXBI75tih4E9gWPzmLdf1"
date: "2024-03-16T05:35:07.322Z"
author:
  name: Noman Dhoni
  picture: "https://p2myfh92qq.ufs.sh/f/93hqarYp4cDdZT8ddjm1DAJj4rLcIU0t8PKSXMxTZOyQYdbC"
ogImage:
  url: "https://utfs.io/f/93hqarYp4cDde9Yt7jnAGUrMQKVoXBI75tih4E9gWPzmLdf1"
---

## Contributing to Blink Eye

Contributions are welcome! Whether you want to report a bug, suggest an improvement, or contribute code, we appreciate your help in making Blink Eye even better.

### How to Contribute

If you would like to contribute to Blink Eye, please follow these steps:

1. **Fork the repository** on GitHub.
2. **Create a new branch** for your feature or fix.
3. **Make your changes** and commit them.
4. **Push your changes** to your fork.
5. **Submit a pull request** to the main repository.

### Thank You!

Thank you for your interest in contributing to Blink Eye! Your contributions help make Blink Eye a more effective and efficient tool for promoting eye health.

# Contribution Guide

Contributions are welcome! Feel free to open issues or submit pull requests.

Contributions for improving the dashboard, enhancing customizability, and adding new languages for multilingual support are particularly appreciated.

### How to Contribute:

1. **Fork** the repository to your GitHub account.

2. **Clone** the repository to your local machine:
   ```console
   git clone https://github.com/your-username/blink-eye.git
   ```
3. **Create a new branch** for your changes:
   ```console
   git checkout -b my-branch
   ```
4. **Make changes** to the code.

5. **Commit** your changes:
   ```console
   git commit -m "commit message"
   ```
6. **Push** your changes to the remote repository:
   ```console
   git push origin my-branch
   ```
7. **Create a pull request** on GitHub.


## Application Setup

### Prerequisites

1. **Tauri** (for building the desktop app)
4. **Rust** (for building the desktop app)
3. **Cargo** (for package management)
2. **Bun** (for package management)

### To build and run Blink Eye (Desktop App):
1. **Install JavaScript dependencies:**

    ```console
    bun install
    ```

2. **Change Directory:**

    ```console
    cd src-tauri
    ```

3. **Install all Cargo dependencies:**

    ```console
    cargo install
    ```
3. **Change Directory:**

    ```console
    cd ..
    ```
4. **Run the app in development mode:**

    ```console
    bun run tauri dev
    ```

## Website Setup

### Prerequisites

3. **Node JS** (for package management)
2. **Bun** (for package management)

### To build and run Blink Eye (Desktop App):

1. **Change Directory:**

    ```console
    cd website
    ```
1. **Install dependencies:**

    ```console
    bun install
    ```

2. **Run the website in development mode:**

    ```console
    bun run dev
    ```



<!-- ## How to Use

Here's how to get started with Blink Eye:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/nomandhoni-cs/blink-eye.git
    ```
2. **Install the dependencies**:
    ```bash
    pip install -r REQUIREMENTS.txt
    ```
3. **Run the application**:
    ```bash
    python blink_eye.py
    ```
4. **Optional: Build .exe file**:
    ```bash
    pyinstaller --name BlinkEye --onefile --windowed --icon="./Assets/blink-eye-logo.ico" --add-data="./Assets/*;./Assets" --add-data="./data/*;./data" --clean blink-eye.py
    ```
    This will create an executable file for Blink Eye.

Feel free to reach out if you have any questions or need further assistance!

## Contributing with Translation 
### Adding or Improving Translations

If you want to contribute by adding or improving the translation of a new or existing language, please head to `/application/data/configuration.json`.

#### Guide for Adding a New Language

1. **Use Native Language Names**:
    - Ensure you use the actual name of the language in its native script, not in English.
      
2. **Update the Languages List**: 
    - Add the new language name in its native script to the `languages` array.
    
    ```json
    {
        "languages": ["English", "বাংলা", "Español", "LanguageNativeName"]
    }
    ```

3. **Upload the Font File**:
    - Upload the font file for the new language to the `/application/font` directory.

4. **Add Font Information**:
    - Define the proper font settings for the new language in the `font` section.
    
    ```json
    "font": {
        "LanguageNativeName": {
            "filename": "YourFontFile.ttf",
            "fontname": "Your Font Name",
            "relsize": 1.0
        }
    }
    ```
    
    #### What is the difference between `filename` and `fontname`?
   
   - **filename**: This is the name of your font file that you uploaded into the font directory.
   - **fontname**: This is the name of the font itself, which can be seen when you open the .ttf file and look for the `Name` at the very top.

   #### What is `relsize`?
   
   - **relsize**: Relative Size, in short `relsize`, is used to maintain the font size globally in the software. A `relsize` of `1` means the original default size for any language. However, in many cases, `1` might feel smaller or bigger for different languages or fonts. It is recommended to adjust this value appropriately for your language.

5. **Add Translations**:
    - Add the translations for Dashboard elements in the `dashboard` section.
    
    ```json
    "dashboard": {
        "timings": {
            "english": "Timings",
            "বাংলা": "সময়",
            "español": "Temporización",
            "languagenativename": "Translation"
        },
        ...
    }
    
    ```

    - Add the translations for Notifier elements in the `notifier` section.
    ```json
    "notifier": {
        "20-ft-msg": {
          "english": "Look 20 feet far away to protect your eyes",
          "বাংলা": "চোখের সুরক্ষার জন্য ২০ ফুট দূরে তাকান",
          "español": "Mira a 20 pies de distancia para proteger tus ojos",
          "languagenativename": "Translation"
        },
       ...
    }
    ``` -->
    
## Contributing to the Website

If anyone wants to contribute to the website, go to the `/website` directory.

#### Technologies Used in this website

- Radix
- Tailwind 
- Lucide icons
- Dark mode ready
- Storybook
- Biome
- Husky + lint-staged
- [shadcn/ui](https://ui.shadcn.com/) components

##### Class Merging

The `cn` util handles conditional classes and class merging.

##### Input

```ts
cn("px-2 bg-neutral-100 py-2 bg-neutral-200");
// Outputs `p-2 bg-neutral-200`
```
