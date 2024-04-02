<p align="center">
  <img src="https://raw.githubusercontent.com/nomandhoni-cs/blink-eye/master/blink-eye-logo.png" alt="Blink Eye App logo">
</p>
<h1 align="center">Blink Eye</h1>

Blink Eye is a minimalist eye care reminder app designed to reduce eye strain during extended screen usage. It provides customizable timers, full-screen popups, audio mute functionalityfor a seamless user experience.

## Features

- Customizable reminder timers.
- Full-screen popups with a 20-second countdown to prompt users to look away.
- Audio mute during reminders to enhance focus.
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

### Using Script

#### Windows

> Run the commands in the Command Prompt (CMD). Not in PowerShell.

1. Clone the repository:

    ```command
    git clone https://github.com/nomandhoni-cs/blink-eye.git
    ```

2. Create and activate a virtual environment (optional):

    ```command
    python -m venv .venv && .\.venv\Scripts\Activate.bat
    ```

3. Run the build script:

    ```command
    build_windows.bat
    ```

#### Linux (Fedora Workstation)

1. Clone the repository:

    ```command
    git clone https://github.com/nomandhoni-cs/blink-eye.git
    ```

2. Create and activate a virtual environment (optional):

    ```command
    python -m venv .venv --system-site-packages && source ./.venv/bin/activate
    ```

3. Run the build script:

    ```command
    bash ./build_fedora.sh
    ```

### Manually (Windows only)

1. Clone the repository:

    ```bash
    git clone https://github.com/nomandhoni-cs/blink-eye.git

2. Install the dependencies

    ```bash
    pip install -r REQUIREMENTS.txt
3. Run the Application

    ```bash
    python blink_eye.py
4. If you want to make ```.exe``` by yourself

    ```bash
    pyinstaller --name BlinkEye --onefile --windowed --icon=blink-eye-logo.ico --hidden-import plyer.platforms.win.notification blink_eye.py


## Usage

- The app will display a full-screen popup every 2 minutes with a 20-second countdown to remind you to look away and reduce eye strain.

- Click the "Skip Reminder" button to close the popup for the current session.

- Audio will be automatically muted during reminders and restored afterward.

## License

- **MIT License:** Open-source use. [MIT License Details](./LICENSE.txt)
- **Commercial License:** For business purposes. Contact Noman Dhoni at alnoman.dhoni@gmail.com for licensing options.

## Contact

For inquiries and support, please contact Noman Dhoni:

- Email: [alnoman.dhoni@gmail.com]
- Twitter: [@nomandhoni]

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

Follow the [CONTRIBUTING.md](https://github.com/nomandhoni-cs/blink-eye/blob/website/CONTRIBUTING.md) for the instruction
