console.log("Windows 3.1 Simulator script loaded.");

const desktop = document.getElementById('desktop');
const splashScreen = document.getElementById('splash-screen'); // Get the splash screen element
let highestZIndex = 10;

// --- Window Tiling Variables --- NEW
const tileStartX = 10;
const tileStartY = 10;
const tileOffsetX = 250; // Approximate width + gap for tiling
const tileOffsetY = 200; // Approximate height + gap for tiling
let currentTileX = tileStartX;
let currentTileY = tileStartY;

// --- Splash Screen Logic ---
if (splashScreen) {
    splashScreen.addEventListener('click', () => {
        splashScreen.style.display = 'none'; // Hide splash screen on click
    }, { once: true }); // Remove listener after first click
}

// --- Window Creation --- 
function createWindow(title, content = '<p>Window Content</p>') {
    const winId = `window-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const win = document.createElement('div');
    win.className = 'window';
    win.id = winId;
    const desktop = document.getElementById('desktop'); // Get desktop element

    // --- Tiling Position Logic --- MODIFIED
    // Check if the next window would go off the right edge
    if (currentTileX + tileOffsetX > desktop.clientWidth) {
        currentTileX = tileStartX; // Reset X to the start
        currentTileY += tileOffsetY; // Move to the next row

        // Optional: Check if the next row goes off the bottom edge and reset
        if (currentTileY + tileOffsetY > desktop.clientHeight) {
            currentTileY = tileStartY; // Reset Y to the top row
            // Optionally, you could reset X too, or implement other overflow logic
        }
    }

    win.style.top = `${currentTileY}px`;
    win.style.left = `${currentTileX}px`;
    win.style.zIndex = highestZIndex++;

    // Update next position for the next window in the current row
    currentTileX += tileOffsetX;

    // --- End Tiling Position Logic ---

    win.innerHTML = `
        <div class="title-bar">
            <span class="title">${title}</span>
            <div class="title-bar-controls">
                <button class="minimize" title="Minimize">_</button>
                <button class="maximize" title="Maximize">□</button>
                <button class="close" title="Close">X</button>
            </div>
        </div>
        <div class="menu-bar">
            <div class="menu-item">
                File
                <div class="dropdown-menu hidden">
                    <div>New</div>
                    <div>Open...</div>
                    <div>Save</div>
                    <div>Save As...</div>
                    <div class="separator"></div>
                    <div>Exit</div>
                </div>
            </div>
            <div class="menu-item">
                Edit
                <div class="dropdown-menu hidden">
                    <div>Undo</div>
                    <div class="separator"></div>
                    <div>Cut</div>
                    <div>Copy</div>
                    <div>Paste</div>
                </div>
            </div>
            <!-- Add more menus like View, Help etc. as needed -->
        </div>
        <div class="window-body">
            ${content}
        </div>
        <!-- Resize Handles -->
        <div class="resizer resizer-t"></div>
        <div class="resizer resizer-b"></div>
        <div class="resizer resizer-l"></div>
        <div class="resizer resizer-r"></div>
        <div class="resizer resizer-tl"></div>
        <div class="resizer resizer-tr"></div>
        <div class="resizer resizer-bl"></div>
        <div class="resizer resizer-br"></div>
    `;

    desktop.appendChild(win);
    makeWindowInteractive(win);
    return win;
}

// --- Window Interactivity --- 
function makeWindowInteractive(win) {
    const titleBar = win.querySelector('.title-bar');
    const closeButton = win.querySelector('.close');
    const minimizeButton = win.querySelector('.minimize');
    const maximizeButton = win.querySelector('.maximize');
    let isDragging = false;
    let offsetX, offsetY;
    let isMaximized = false;
    let originalState = { width: '', height: '', top: '', left: '' }; // Store original size/pos
    let minimizedButton = null; // Reference to the taskbar button - KEEPING for logic, but won't be added to DOM

    // Dragging
    if (titleBar) {
        titleBar.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            isDragging = true;
            offsetX = e.clientX - win.offsetLeft;
            offsetY = e.clientY - win.offsetTop;
            win.style.zIndex = highestZIndex++;
            titleBar.style.cursor = 'grabbing';
            win.style.userSelect = 'none';
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    function onMouseMove(e) {
        if (!isDragging) return;
        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;
        const maxW = desktop.clientWidth - win.offsetWidth;
        const maxH = desktop.clientHeight - win.offsetHeight;
        newX = Math.max(0, Math.min(newX, maxW));
        newY = Math.max(0, Math.min(newY, maxH));
        win.style.left = `${newX}px`;
        win.style.top = `${newY}px`;
    }

    function onMouseUp() {
        if (isDragging) {
            isDragging = false;
            if (titleBar) titleBar.style.cursor = 'default';
            win.style.userSelect = 'auto';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    }

    // Bring to front on click
    win.addEventListener('mousedown', () => {
        win.style.zIndex = highestZIndex++;
    });

    // Button Functionality
    if (closeButton) {
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            win.remove(); // Remove window from DOM
        });
    }

    if (minimizeButton) {
        minimizeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            win.style.display = 'none'; // Simple hide for now, no taskbar representation
            console.log('Minimize clicked (no taskbar)');
        });
    }

    if (maximizeButton) {
        maximizeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!isMaximized) {
                originalState = { width: win.style.width, height: win.style.height, top: win.style.top, left: win.style.left };
                win.style.top = '0px';
                win.style.left = '0px';
                win.style.width = desktop.clientWidth + 'px';
                win.style.height = desktop.clientHeight + 'px'; // Maximize to full desktop height
                isMaximized = true;
                maximizeButton.textContent = '❐';
            } else {
                win.style.width = originalState.width;
                win.style.height = originalState.height;
                win.style.top = originalState.top;
                win.style.left = originalState.left;
                isMaximized = false;
                maximizeButton.textContent = '□';
            }
        });
    }

    // --- Menu Bar Interaction --- (Placeholder for future addition)
    const menuItems = win.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        const dropdown = item.querySelector('.dropdown-menu');
        if (!dropdown) return;

        item.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close other open menus in the same window
            win.querySelectorAll('.dropdown-menu').forEach(d => {
                if (d !== dropdown) d.classList.add('hidden');
            });
            // Toggle current menu
            dropdown.classList.toggle('hidden');
        });

        // Add click listeners to dropdown items (placeholder action)
        dropdown.querySelectorAll('div:not(.separator)').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log(`Menu item clicked: ${e.target.textContent}`);
                dropdown.classList.add('hidden'); // Close menu after click
                // Add specific actions here based on e.target.textContent
                if (e.target.textContent === 'Exit') {
                    win.remove(); // Example: Close window on Exit
                }
            });
        });
    });

    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
        if (!win.contains(e.target)) { // Only close if click is outside this window
            win.querySelectorAll('.dropdown-menu').forEach(d => d.classList.add('hidden'));
        } else if (!e.target.closest('.menu-item')) { // Click inside window but not on a menu item
            win.querySelectorAll('.dropdown-menu').forEach(d => d.classList.add('hidden'));
        }
    });

    // --- Resizing Logic ---
    const resizers = win.querySelectorAll('.resizer');
    let isResizing = false;
    let currentResizer = null;
    let startX, startY, initialWidth, initialHeight, initialTop, initialLeft;
    const minWidth = 150; // Minimum window width
    const minHeight = 100; // Minimum window height

    resizers.forEach(resizer => {
        resizer.addEventListener('mousedown', (e) => {
            e.preventDefault(); // Prevent text selection during resize
            e.stopPropagation(); // Stop propagation to prevent window drag
            isResizing = true;
            currentResizer = resizer;
            startX = e.clientX;
            startY = e.clientY;
            initialWidth = win.offsetWidth;
            initialHeight = win.offsetHeight;
            initialTop = win.offsetTop;
            initialLeft = win.offsetLeft;
            win.style.userSelect = 'none'; // Prevent text selection
            console.log(`Resize Start: ${currentResizer.className}, StartX: ${startX}, StartY: ${startY}, InitW: ${initialWidth}, InitH: ${initialHeight}`); // DEBUG

            document.addEventListener('mousemove', doResize);
            document.addEventListener('mouseup', stopResize);
        });
    });

    function doResize(e) {
        if (!isResizing) return;
        console.log(`Resizing: ClientX: ${e.clientX}, ClientY: ${e.clientY}`); // DEBUG

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        let newWidth = initialWidth;
        let newHeight = initialHeight;
        let newTop = initialTop;
        let newLeft = initialLeft;

        if (currentResizer.classList.contains('resizer-r') || currentResizer.classList.contains('resizer-tr') || currentResizer.classList.contains('resizer-br')) {
            newWidth = initialWidth + dx;
        }
        if (currentResizer.classList.contains('resizer-b') || currentResizer.classList.contains('resizer-bl') || currentResizer.classList.contains('resizer-br')) {
            newHeight = initialHeight + dy;
        }
        if (currentResizer.classList.contains('resizer-l') || currentResizer.classList.contains('resizer-tl') || currentResizer.classList.contains('resizer-bl')) {
            newWidth = initialWidth - dx;
            newLeft = initialLeft + dx;
        }
        if (currentResizer.classList.contains('resizer-t') || currentResizer.classList.contains('resizer-tl') || currentResizer.classList.contains('resizer-tr')) {
            newHeight = initialHeight - dy;
            newTop = initialTop + dy;
        }

        // Apply minimum size constraints
        if (newWidth < minWidth) {
            if (currentResizer.classList.contains('resizer-l') || currentResizer.classList.contains('resizer-tl') || currentResizer.classList.contains('resizer-bl')) {
                newLeft = initialLeft + (initialWidth - minWidth);
            }
            newWidth = minWidth;
        }
        if (newHeight < minHeight) {
             if (currentResizer.classList.contains('resizer-t') || currentResizer.classList.contains('resizer-tl') || currentResizer.classList.contains('resizer-tr')) {
                newTop = initialTop + (initialHeight - minHeight);
            }
            newHeight = minHeight;
        }

        // Apply new styles
        win.style.width = `${newWidth}px`;
        win.style.height = `${newHeight}px`;
        win.style.top = `${newTop}px`;
        win.style.left = `${newLeft}px`;
        console.log(`Applied Styles: W: ${newWidth}, H: ${newHeight}, T: ${newTop}, L: ${newLeft}`); // DEBUG

        // Optional: Add logic here to resize internal elements like canvas/textarea if needed
        const canvas = win.querySelector('.paint-canvas');
        if (canvas) {
            // Simple resize - might need adjustment based on toolbar/padding
            canvas.width = newWidth - 20; // Example adjustment
            canvas.height = newHeight - 40; // Example adjustment
            // Re-initialize or redraw canvas content if necessary
        }
        const textarea = win.querySelector('.notepad-textarea');
        if (textarea) {
            // Textarea usually resizes automatically with parent if height/width are 100%
        }
    }

    function stopResize() {
        if (isResizing) {
            console.log("Resize Stop"); // DEBUG
            isResizing = false;
            currentResizer = null;
            win.style.userSelect = 'auto'; // Re-enable text selection
            document.removeEventListener('mousemove', doResize);
            document.removeEventListener('mouseup', stopResize);
        }
    }
}

// --- Initial Setup --- 
// Make existing welcome window interactive
// const initialWindow = document.getElementById('welcome-window');
// if (initialWindow) {
//     makeWindowInteractive(initialWindow);
// }
// Remove or comment out the initial welcome window if not needed, or keep it.

// Define Applications
const applications = {
    "Notepad": { icon: '<img src="icons/notepad.png" alt="Notepad" width="32" height="32">', group: 'Main' }, // Use img tag
    "Paintbrush": { icon: '<img src="icons/paintbrush.png" alt="Paintbrush" width="32" height="32">', group: 'Accessories' }, // Use img tag
    "Minesweeper": { icon: '<img src="icons/minesweeper.png" alt="Minesweeper" width="32" height="32">', group: 'Games' }, // Use img tag
    "Solitaire": { icon: '<img src="icons/solitaire.png" alt="Solitaire" width="32" height="32">', group: 'Games' }, // Added Solitaire
    "File Manager": { icon: '<img src="icons/filemanager.png" alt="File Manager" width="32" height="32">', group: 'Main' }, // Use img tag
    "My Computer": { icon: '<img src="icons/mycomputer.png" alt="My Computer" width="32" height="32">', group: 'Main' } // Updated icon path
};

// Function to create an icon element
function createIconElement(appName, appData) {
    const icon = document.createElement('div');
    icon.className = 'desktop-icon'; // Use the same class, CSS handles positioning inside groups
    icon.innerHTML = `
        <div class="icon-image">${appData.icon}</div>
        <span>${appName}</span>
    `;
    icon.addEventListener('dblclick', () => launchApplication(appName));
    return icon;
}

// Function to launch an application based on its name
function launchApplication(appName) {
     // Avoid creating duplicate windows if one with the same title is already open
    let windowExists = false;
    document.querySelectorAll('.window .title').forEach(titleElement => {
        if (titleElement.textContent === appName) {
            windowExists = true;
            const existingWindow = titleElement.closest('.window');
            if (existingWindow) {
                existingWindow.style.display = 'flex'; // Ensure it's visible if minimized
                existingWindow.style.zIndex = highestZIndex++;
            }
        }
    });

    if (windowExists) return; // Don't open if already open

    let windowContent = `<p>Contents for ${appName}</p>`; // Default content

    // Specific app content logic (moved from old icon listener)
    if (appName === 'Paintbrush') {
        const canvasId = `paint-canvas-${Date.now()}`;
        windowContent = `
            <div class="paint-toolbar">
                <button data-color="#000000" style="background-color: #000000;"></button>
                <button data-color="#FF0000" style="background-color: #FF0000;"></button>
                <button data-color="#0000FF" style="background-color: #0000FF;"></button>
                <button data-color="#00FF00" style="background-color: #00FF00;"></button>
                <button data-color="#FFFF00" style="background-color: #FFFF00;"></button>
                <button data-color="#FFFFFF" class="eraser-button">Erase</button> 
                <span class="separator">|</span>
                <button data-size="2">S</button>
                <button data-size="5">M</button>
                <button data-size="10">L</button>
                <span class="separator">|</span>
                <button class="clear-button">Clear</button>
            </div>
            <canvas id="${canvasId}" class="paint-canvas"></canvas>
        `;
        const newWin = createWindow(appName, windowContent);
        const canvasElement = newWin.querySelector('.paint-canvas');
        const toolbarElement = newWin.querySelector('.paint-toolbar');
        if (canvasElement && toolbarElement) {
            initializeCanvas(canvasElement, toolbarElement);
        } else {
            console.error('Canvas or Toolbar element not found after creating Paintbrush window.');
        }
    } else if (appName === 'Minesweeper') {
        const gameId = `minesweeper-${Date.now()}`;
        windowContent = `
            <div class="minesweeper-game" id="${gameId}">
                <div class="minesweeper-controls">
                    <button class="win31-button restart-button">Restart</button>
                    <span class="mine-count">Mines: ?</span>
                    <span class="timer">Time: 0</span>
                </div>
                <div class="minesweeper-grid"></div>
            </div>
        `;
        const newWin = createWindow(appName, windowContent);
        const gameElement = newWin.querySelector(`#${gameId}`);
        if (gameElement) {
            initializeMinesweeper(gameElement);
        } else {
            console.error('Minesweeper game element not found after creating window.');
        }
    } else if (appName === 'Notepad') {
        windowContent = `<textarea class="notepad-textarea"></textarea>`;
        const newWin = createWindow(appName, windowContent);
        const windowBody = newWin.querySelector('.window-body');
        if (windowBody) {
            windowBody.style.padding = '0';
        }
    } else {
        // For apps like "File Manager", "My Computer" or others with default content
        createWindow(appName, windowContent);
    }
}

// Function to create a group window
function createGroupWindow(groupName, appsInGroup) {
    let iconsHtml = '';
    appsInGroup.forEach(appName => {
        const appData = applications[appName];
        if (appData) {
            // Create icon HTML string (simpler than creating elements one by one here)
            iconsHtml += `
                <div class="desktop-icon" data-appname="${appName}">
                    <div class="icon-image">${appData.icon}</div>
                    <span>${appName}</span>
                </div>
            `;
        }
    });

    const groupWindow = createWindow(groupName, iconsHtml);
    const groupBody = groupWindow.querySelector('.window-body');
    groupBody.classList.add('group-window-body'); // Add class for specific styling

    // Add event listeners to the icons *after* they are in the DOM
    groupBody.querySelectorAll('.desktop-icon').forEach(iconElement => {
        iconElement.addEventListener('dblclick', () => {
            const appName = iconElement.dataset.appname;
            if (appName) {
                launchApplication(appName);
            }
        });
    });
}

// Create default group windows on startup
const groups = {};
Object.entries(applications).forEach(([appName, appData]) => {
    if (!groups[appData.group]) {
        groups[appData.group] = [];
    }
    groups[appData.group].push(appName);
});

Object.entries(groups).forEach(([groupName, appsInGroup]) => {
    createGroupWindow(groupName, appsInGroup);
});

// --- Canvas Drawing Logic ---
function initializeCanvas(canvas, toolbar) {
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let currentColor = '#000000';
    let currentSize = 2;

    // Set initial canvas size (can be adjusted)
    // Match the body size initially, but might need resizing logic later
    const windowBody = canvas.closest('.window-body');
    if (windowBody) {
        // Give it a default size or try to fit the parent
        canvas.width = windowBody.clientWidth - 20; // Account for padding
        canvas.height = windowBody.clientHeight - 20;
    }

    ctx.strokeStyle = currentColor; // Default draw color
    ctx.lineWidth = currentSize; // Default line width
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    function draw(e) {
        if (!isDrawing) return;
        // Calculate mouse position relative to the canvas
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        [lastX, lastY] = [x, y];
    }

    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        [lastX, lastY] = [e.clientX - rect.left, e.clientY - rect.top];
        // Optional: draw a dot on click
        // ctx.beginPath();
        // ctx.arc(lastX, lastY, ctx.lineWidth / 2, 0, Math.PI * 2);
        // ctx.fill();
    });

    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseout', () => isDrawing = false); // Stop drawing if mouse leaves canvas

    // Toolbar functionality
    toolbar.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const color = e.target.dataset.color;
            const size = e.target.dataset.size;
            if (color) {
                currentColor = color;
                ctx.strokeStyle = currentColor;
            }
            if (size) {
                currentSize = size;
                ctx.lineWidth = currentSize;
            }
            if (e.target.classList.contains('clear-button')) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    });
}

// --- Minesweeper Game Logic ---
function initializeMinesweeper(gameElement) {
    const gridElement = gameElement.querySelector('.minesweeper-grid');
    const restartButton = gameElement.querySelector('.restart-button');
    const mineCountElement = gameElement.querySelector('.mine-count');
    const timerElement = gameElement.querySelector('.timer');

    // Game settings (e.g., Beginner level)
    let rows = 9;
    let cols = 9;
    let mineCount = 10;

    let board = []; // 2D array representing the game board
    let revealedCount = 0;
    let flaggedCount = 0;
    let gameOver = false;
    let gameStarted = false;
    let timerInterval = null;
    let timeElapsed = 0;

    function createBoard() {
        // Initialize empty board
        board = Array(rows).fill(null).map(() => Array(cols).fill(null).map(() => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            neighborMines: 0
        })));

        // Place mines randomly
        let minesPlaced = 0;
        while (minesPlaced < mineCount) {
            const r = Math.floor(Math.random() * rows);
            const c = Math.floor(Math.random() * cols);
            if (!board[r][c].isMine) {
                board[r][c].isMine = true;
                minesPlaced++;
            }
        }

        // Calculate neighbor mine counts
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (!board[r][c].isMine) {
                    let count = 0;
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            if (dr === 0 && dc === 0) continue;
                            const nr = r + dr;
                            const nc = c + dc;
                            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) {
                                count++;
                            }
                        }
                    }
                    board[r][c].neighborMines = count;
                }
            }
        }
    }

    function renderBoard() {
        gridElement.innerHTML = ''; // Clear previous grid
        gridElement.style.gridTemplateColumns = `repeat(${cols}, 20px)`; // Set grid columns via CSS
        revealedCount = 0;
        flaggedCount = 0;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'mine-cell';
                cell.dataset.row = r;
                cell.dataset.col = c;

                const cellData = board[r][c];

                if (cellData.isRevealed) {
                    cell.classList.add('revealed');
                    revealedCount++;
                    if (cellData.isMine) {
                        cell.classList.add('mine');
                        cell.textContent = '💣'; // Mine symbol
                    } else if (cellData.neighborMines > 0) {
                        cell.textContent = cellData.neighborMines;
                        cell.dataset.count = cellData.neighborMines;
                    }
                } else if (cellData.isFlagged) {
                    cell.classList.add('flagged');
                    flaggedCount++;
                }

                cell.addEventListener('click', handleLeftClick);
                cell.addEventListener('contextmenu', handleRightClick); // Right-click for flags
                gridElement.appendChild(cell);
            }
        }
        updateMineCount();
    }

    function handleLeftClick(event) {
        if (gameOver) return;
        const cellElement = event.target;
        const r = parseInt(cellElement.dataset.row);
        const c = parseInt(cellElement.dataset.col);
        const cellData = board[r][c];

        if (cellData.isRevealed || cellData.isFlagged) return;

        if (!gameStarted) {
            startGameTimer();
            gameStarted = true;
            // Optional: Ensure first click is never a mine
            if (cellData.isMine) {
                // Simple approach: regenerate board until first click is safe
                // More complex: move the mine elsewhere
                restartGame();
                // Need to find the new cell element corresponding to r,c and click it again
                const newCellElement = gridElement.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                if(newCellElement) handleLeftClick({ target: newCellElement }); // Re-trigger click
                return;
            }
        }


        revealCell(r, c);

        if (cellData.isMine) {
            endGame(false); // Lost
        } else {
            checkWinCondition();
        }
    }

    function handleRightClick(event) {
        event.preventDefault(); // Prevent browser context menu
        if (gameOver) return;
        const cellElement = event.target;
        const r = parseInt(cellElement.dataset.row);
        const c = parseInt(cellElement.dataset.col);
        const cellData = board[r][c];

        if (cellData.isRevealed) return;

        if (!gameStarted) {
             startGameTimer();
             gameStarted = true;
        }

        cellData.isFlagged = !cellData.isFlagged;
        renderBoard(); // Re-render to show/hide flag
        checkWinCondition(); // Check win after flagging/unflagging
    }

    function revealCell(r, c) {
        if (r < 0 || r >= rows || c < 0 || c >= cols) return; // Out of bounds
        const cellData = board[r][c];
        if (cellData.isRevealed || cellData.isFlagged) return; // Already revealed or flagged

        cellData.isRevealed = true;
        const cellElement = gridElement.querySelector(`[data-row="${r}"][data-col="${c}"]`);
        if (cellElement) {
             cellElement.classList.add('revealed');
             if (cellData.isMine) {
                 cellElement.classList.add('mine');
                 cellElement.textContent = '💣';
             } else if (cellData.neighborMines > 0) {
                 cellElement.textContent = cellData.neighborMines;
                 cellElement.dataset.count = cellData.neighborMines;
             }
        }


        // If revealed cell is empty (0 neighbors), reveal adjacent cells (flood fill)
        if (!cellData.isMine && cellData.neighborMines === 0) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    revealCell(r + dr, c + dc);
                }
            }
        }
         // Update revealed count after revealing
        revealedCount = 0;
        for (let rr = 0; rr < rows; rr++) {
            for (let cc = 0; cc < cols; cc++) {
                if (board[rr][cc].isRevealed) revealedCount++;
            }
        }
    }

     function revealAllMines() {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (board[r][c].isMine) {
                    const cellElement = gridElement.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                    if (cellElement && !board[r][c].isRevealed) {
                         cellElement.classList.add('revealed', 'mine');
                         cellElement.textContent = '💣';
                    }
                    // Optionally mark incorrectly flagged cells
                    if (board[r][c].isFlagged && !board[r][c].isMine) {
                         // Add style for incorrect flag
                    }
                }
            }
        }
    }

    function checkWinCondition() {
        const nonMineCells = rows * cols - mineCount;
        // Count revealed non-mine cells
        let revealedNonMines = 0;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (board[r][c].isRevealed && !board[r][c].isMine) {
                    revealedNonMines++;
                }
            }
        }

        if (revealedNonMines === nonMineCells) {
            endGame(true); // Won
        }
    }

    function startGameTimer() {
        if (timerInterval) clearInterval(timerInterval); // Clear existing timer
        timeElapsed = 0;
        timerElement.textContent = `Time: ${timeElapsed}`;
        timerInterval = setInterval(() => {
            timeElapsed++;
            timerElement.textContent = `Time: ${timeElapsed}`;
        }, 1000);
    }

    function stopGameTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    function updateMineCount() {
         mineCountElement.textContent = `Mines: ${mineCount - flaggedCount}`;
    }


    function endGame(isWin) {
        gameOver = true;
        stopGameTimer();
        revealAllMines(); // Show all mines at the end
        setTimeout(() => { // Delay alert slightly
             if (isWin) {
                 alert("You win!");
             } else {
                 alert("Game Over!");
             }
        }, 100); // 100ms delay
    }

    function restartGame() {
        gameOver = false;
        gameStarted = false;
        stopGameTimer();
        timeElapsed = 0;
        timerElement.textContent = `Time: 0`;
        createBoard();
        renderBoard();
    }

    // Initial setup
    restartButton.addEventListener('click', restartGame);
    restartGame(); // Start the first game
}
