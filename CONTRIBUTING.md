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

## How to Use

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
