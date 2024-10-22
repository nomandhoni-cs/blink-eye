<p align="center">
  <img src="https://raw.githubusercontent.com/nomandhoni-cs/blink-eye/master/application/assets/blink-eye-logo.png" alt="Blink Eye App logo">
</p>
<h1 align="center">Blink Eye</h1>

Blink Eye is a minimalist eye care reminder app designed to reduce eye strain during extended screen usage. It provides customizable timers, full-screen popups, audio mute functionality for a seamless user experience.

## Features

- Customizable reminder timers.
- Full-screen popups with a 20-second countdown to prompt users to look away.
- Audio mute during reminders to enhance focus.
- Customizable dashboard for settings and preferences
- Multilingual support
- Quick access links for easy navigation:
  - [Donate](https://www.buymeacoffee.com/nomandhoni)
  - [GitHub Repository](https://github.com/nomandhoni-cs/blink-eye)
  - [Official Website](https://blinkeye.vercel.app/)

## The 20-20-20 Rule

The **20-20-20 rule** is a guideline to reduce eye strain caused by staring at screens for extended periods. It suggests that for every **20 minutes** spent looking at a screen, you should take a **20-second break** and focus your eyes on something at least **20 feet away**.

### Benefits:

- **Reduces Eye Strain:** Regular breaks help prevent eye fatigue and strain caused by prolonged screen time.
- **Improves Focus:** Taking short breaks can help maintain focus and productivity throughout the day.
- **Prevents Dry Eyes:** Looking away from the screen allows your eyes to blink more frequently, reducing the risk of dry eyes.
- **Promotes Eye Health:** Focusing on distant objects helps relax eye muscles and reduce the risk of developing vision-related issues.


## Building the app

### Windows

<details open>

<summary><b>Using Script</b></summary></h4>

1. Clone the repository:

    ```console
    git clone https://github.com/nomandhoni-cs/blink-eye.git
    ```

2. Change working directory

    ```console
    cd blink-eye/application
    ```
3. Create and activate a virtual environment (optional):

    ```console
    python -m venv .venv && .\.venv\Scripts\Activate.bat
    ```

4. Run the build script:

    ```console
    build_windows.bat
    ```

</details>


<details>

<summary><b>Manually</b></summary></h4>

1. Clone the repository:

    ```console
    git clone https://github.com/nomandhoni-cs/blink-eye.git
    ```

2. Change working directory:
    ```console
    cd blink-eye/application
    ```

3. Create and activate a virtual environment (optional):
    ```console
    python -m venv .venv && .\.venv\Scripts\Activate.bat
    ```

4. Install the dependencies

    ```console
    pip install -r REQUIREMENTS.txt
    ```
    
5. Run the Application

    ```console
    python blink-eye.py
    ```

6. If you want to make `.exe` by yourself

    ```console
    pyinstaller --name BlinkEye --onefile --windowed --icon="./assets/blink-eye-logo.ico" --add-data="./assets/*;./assets" --add-data="./font/*;./font" --add-data="./data/*;./data" --hidden-import plyer.platforms.win.notification --clean main.py
    ```

</details>

### Linux (Fedora Workstation)

1. Clone the repository:

    ```console
    git clone https://github.com/nomandhoni-cs/blink-eye.git
    ```

2. Create and activate a virtual environment (optional):

    ```console
    python -m venv .venv --system-site-packages && source ./.venv/bin/activate
    ```

3. Run the build script:

    ```console
    bash ./build_fedora.sh
    ```


## Usage

- The app will display a full-screen popup every 20 minutes with a 20-second countdown to remind you to look away and reduce eye strain.

- Click the "Skip Reminder" button to close the popup for the current session.

- Audio will be automatically muted during reminders and restored afterward.


## License

- **MIT License:** Open-source use. [MIT License Details](./LICENSE.txt)
- **Commercial License:** For business purposes. Contact Noman Dhoni at [alnoman.dhoni@gmail.com](mailto:alnoman.dhoni@gmail.com?subject=Blink%20Eye:%20) for licensing options.

## Contact

For inquiries and support, please contact Noman Dhoni:

- Email: [alnoman.dhoni@gmail.com](mailto:alnoman.dhoni@gmail.com?subject=Blink%20Eye:%20)
- Twitter: [@nomandhoni](https://twitter.com/nomandhoni/)

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

- Contributions for improving the dashboard, enhancing customizability, and adding new languages for multilingual support are particularly appreciated.

Follow the [CONTRIBUTING.md](./CONTRIBUTING.md) for the instruction
