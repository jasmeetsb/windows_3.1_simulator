# Windows 3.1 Simulator

This project is primarily a Vibe Code Test with Gemini 2.5.
A nostalgic web-based simulation of the classic Windows 3.1 operating system interface. This project recreates the look and feel of Windows 3.1 with working windows, classic applications, and the iconic UI elements that defined early desktop computing.

![Windows 3.1 Simulator Screenshot](graphics/win31_start.png)

## Features

- Authentic Windows 3.1 visual design
- Functioning window system with dragging, resizing, and window controls
- Classic applications:
  - Notepad
  - Paintbrush
  - Minesweeper
  - Solitaire
  - File Manager
  - My Computer
- Window tiling and management
- Application groups

## Getting Started

These instructions will help you get a copy of the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v12 or newer)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/windows_3.1_simulator.git
   cd windows_3.1_simulator
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Start the application:
   ```
   npm start
   ```

The application will open in a desktop window using Electron.

### Running in a browser

If you prefer to run the application directly in a browser without Electron:

1. Open the `index.html` file in your web browser
2. Or serve it using a local development server:
   ```
   npx serve
   ```
   Then navigate to `http://localhost:5000` in your browser.

## Project Structure

- `index.html` - Main HTML file
- `style.css` - Styling for the Windows 3.1 interface
- `script.js` - JavaScript for window management and application functionality
- `main.js` - Electron configuration for desktop app functionality
- `icons/` - Classic Windows 3.1 icons
- `graphics/` - Images and visual assets

## Development

### Window System

The simulator implements a custom window management system that handles:
- Window creation and positioning
- Dragging via the title bar
- Resizing using 8-way resize handles
- Z-index (window stacking) management
- Window controls (minimize, maximize, close)

### Adding New Applications

To add a new application:

1. Add its entry to the `applications` object in `script.js`
2. Create an application icon in the `icons/` directory
3. Implement the application's functionality in the `launchApplication()` function

## Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue to discuss new features or improvements.



## Acknowledgments

- Inspired by Microsoft Windows 3.1 (1992)
- Built with vanilla JavaScript, HTML, and CSS
- Uses Electron for desktop application functionality
