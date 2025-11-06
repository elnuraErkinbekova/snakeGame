// Get the canvas and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;

const gridSize = 10; // Size of the grid cells
const foodColors = [
    '#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93',
    '#ff7b00', '#f15bb5', '#00bbf9', '#00f5d4', '#9b5de5',
    '#ff9f1c', '#ffbf69', '#2ec4b6', '#cbf3f0', '#8ecae6',
    '#219ebc', '#ff006e', '#fb5607', '#8338ec', '#3a86ff'
];

const themes = [
    {
        name: "pink",
        bodyBg: "url(https://i.ibb.co/w7JM7Rm/pink141.gif)",
        canvasBg: "#fa9bcb",
        borderColor: "white",
        buttonBg: "#ffb3d9",
        buttonHover: "#ff80bf",
        textColor: "white",
    },

    {
        name: "green",
        bodyBg: "url(https://i.ibb.co/qRrdWts/natfl009.jpg)",
        canvasBg: "#8A9A5B",
        borderColor: "#2d5016",
        buttonBg: "#b3ca9b",
        buttonHover: "#8fb573",
        textColor: "#ffff",
    },

    {
        name: "blue",
        bodyBg: "url(https://i.ibb.co/6Z42wK3/ss024.gif)",
        canvasBg: "#b1d7f7ff",
        borderColor: "#1a365d",
        buttonBg: "#88bcf8ff",
        buttonHover: "#4a9cff",
        textColor: "#1a365d",
    },

    {
        name: "red",
        bodyBg: "url(https://i.ibb.co/YQmHm1Z/red050.jpg)",
        canvasBg: "#8B0000",
        borderColor: "#b10505ff",
        buttonBg: "#b30101ff",
        buttonHover: "#8e0d0dff",
        textColor: "#060606ff",
    },

    {
        name: "chess",
        bodyBg: "url(https://i.ibb.co/hsJzvvL/misc026.jpg)",
        canvasBg: "#A9A9A9",
        borderColor: "#f8f6faff",
        buttonBg: "#A9A9A9",
        buttonHover: "#ffffffff",
        textColor: "#f6f7f2ff",
    }
];

let snake = [{ x: 160, y: 160 }, { x: 150, y: 160 }, { x: 140, y: 160 }];
let food = { x: 420, y: 220 };
let direction = { x: gridSize, y: 0 }; // Initial direction (moving right)
let score = 0;
let gameInterval;
let isGameOver = false;
let gameStarted = false;
let foodColor = foodColors[Math.floor(Math.random() * foodColors.length)];
let playerName = null;
let topScores = JSON.parse(localStorage.getItem("snakeTopScores")) || [];
let currentThemeIndex = 0;

// Function to start/restart the game
function startGame() {
    if (!playerName) {
        playerName = prompt("Enter your name:");
        if (!playerName) {
            alert("Please enter a name to start!");
            return;
        }
    }

    // Initialize game variables
    snake = [{ x: 160, y: 160 }, { x: 150, y: 160 }, { x: 140, y: 160 }];
    food = { x: 420, y: 220 };
    direction = { x: gridSize, y: 0 };
    score = 0;
    isGameOver = false;
    gameStarted = true;
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 100); // Start the game loop

    // Remove any existing "Click to Start" message
    drawGame();
}

// Function to end the game
function endGame() {
    clearInterval(gameInterval);
    isGameOver = true;

    const personalTop = localStorage.getItem(`${playerName}_topScore`) || 0;
    if (score > personalTop) {
        localStorage.setItem(`${playerName}_topScore`, score);
    }

    // Update top scores array
    let existingPlayerIndex = topScores.findIndex(p => p.name === playerName);
    if (existingPlayerIndex !== -1) {
        if (score > topScores[existingPlayerIndex].score) {
            topScores[existingPlayerIndex].score = score;
        }
    } else {
        topScores.push({ name: playerName, score });
    }

    // Sort and limit to top 10 scores
    topScores.sort((a, b) => b.score - a.score);

    // Remove duplicates and keep only the highest score per player
    const uniqueTopScores = [];
    const seenNames = new Set();

    for (const player of topScores) {
        if (!seenNames.has(player.name)) {
            seenNames.add(player.name);
            uniqueTopScores.push(player);
        }
    }

    // Keep only top 10 unique players
    topScores = uniqueTopScores.slice(0, 10);
    localStorage.setItem("snakeTopScores", JSON.stringify(topScores));

    drawGame();
    updateOverallTop();
}

// Function to handle keyboard input
function changeDirection(event) {
    if (isGameOver) return;

    if (event.key === 'ArrowUp' && direction.y === 0) {
        direction = { x: 0, y: -gridSize };
    } else if (event.key === 'ArrowDown' && direction.y === 0) {
        direction = { x: 0, y: gridSize };
    } else if (event.key === 'ArrowLeft' && direction.x === 0) {
        direction = { x: -gridSize, y: 0 };
    } else if (event.key === 'ArrowRight' && direction.x === 0) {
        direction = { x: gridSize, y: 0 };
    }
}

// Function to detect collision with walls or self
function detectCollision() {
    const head = snake[0];
    // Wall collision
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        return true;
    }
    // Self-collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

// Function to handle food consumption
function eatFood() {
    const head = snake[0];
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        // Fix: Add proper segment instead of empty object
        const tail = snake[snake.length - 1];
        snake.push({ x: tail.x, y: tail.y });
        
        // Generate new food location
        food = {
            x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
            y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
        };

        foodColor = foodColors[Math.floor(Math.random() * foodColors.length)];
    }
}

// Function to update the game state and redraw the canvas
function gameLoop() {
    if (detectCollision()) {
        endGame();
        return;
    }

    // Move the snake
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head); // Add new head to the snake

    eatFood(); // Check if food is eaten

    if (!isGameOver) {
        snake.pop(); // Remove the last segment of the snake; if not, game over
    }

    drawGame();
}

// Function to draw the game on the canvas
function drawGame() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Draw the snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Draw the head
            ctx.fillStyle = '#95ac7d';
        } else {
            // Draw the body
            ctx.fillStyle = '#b3ca9b';
        }
        ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
    });

    // Draw the food
    ctx.fillStyle = foodColor;
    ctx.beginPath();
    ctx.arc(food.x + gridSize / 2, food.y + gridSize / 2, gridSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw the score
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);

    if (playerName) {
        const personalTop = localStorage.getItem(`${playerName}_topScore`) || 0;
        ctx.fillText(`Top (${playerName}): ${personalTop}`, canvas.width - 200, 30);
    }

    // If the game is over, show a message
    if (isGameOver) {
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 85, canvas.height / 2);
        ctx.font = '20px Arial';
        ctx.fillText('Score: ' + score, canvas.width / 2 - 40, canvas.height / 2 + 30);
        ctx.fillText('Press R to Restart or S to Stop', canvas.width / 2 - 135, canvas.height / 2 + 60);
    } else if (!gameStarted) {
        // If the game has not started, show the "Click to Start" message
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.fillText('Click to Start', canvas.width / 2 - 85, canvas.height / 2);
    }
}

// Combined keyboard event handler for both game control and restart
window.addEventListener('keydown', (event) => {
    if (isGameOver) {
        if (event.key.toLowerCase() === 'r') {
            startGame(); // Restart same player
        } else if (event.key.toLowerCase() === 's') {
            playerName = null;
            isGameOver = false;
            gameStarted = false;
            score = 0;
            drawGame(); // Re-show "Click to Start"
        }
    } else {
        changeDirection(event);
    }
});

// Event listener for clicking the canvas to start or restart the game
canvas.addEventListener('click', () => {
    if (isGameOver) {
        startGame(); // Restart the game if it's over
    } else if (!gameStarted) {
        startGame(); // Start the game if not started
    }
});

// Update overall top
function updateOverallTop() {
    const topScores = JSON.parse(localStorage.getItem("snakeTopScores")) || [];
    const top = topScores.length ? topScores[0].score : 0;
    const overallTopElement = document.getElementById("overallTop");
    if (overallTopElement) {
        overallTopElement.textContent = top;
    }
}

function changeTheme() {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    const newTheme = themes[currentThemeIndex];
    applyTheme(newTheme);
    saveTheme();

    // Also save the full theme object for the leaderboard
    localStorage.setItem('currentTheme', JSON.stringify(newTheme));
}

function applyTheme(theme) {
    document.body.style.backgroundImage = theme.bodyBg;
    document.body.style.color = theme.textColor;

    if (canvas) {
        canvas.style.backgroundColor = theme.canvasBg;
        canvas.style.borderColor = theme.borderColor;
    }

    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.style.backgroundColor = theme.buttonBg;
        button.style.color = theme.textColor;
        button.style.border = `1px solid ${theme.borderColor}`;
    });
}

function saveTheme() {
    localStorage.setItem('currentThemeIndex', currentThemeIndex.toString());
    localStorage.setItem('currentTheme', JSON.stringify(themes[currentThemeIndex]));
}

function loadTheme() {
    const savedIndex = localStorage.getItem('currentThemeIndex');
    if (savedIndex !== null) {
        currentThemeIndex = parseInt(savedIndex);
        applyTheme(themes[currentThemeIndex]);
    }
}

// Initialize the game page
document.addEventListener('DOMContentLoaded', function() {
    // Load saved theme first
    loadTheme();

    // Initialize game
    drawGame(); // Show "Click to Start"
    updateOverallTop();

    // Set up leaderboard button
    const viewLeaderboardBtn = document.getElementById("viewLeaderboard");
    if (viewLeaderboardBtn) {
        viewLeaderboardBtn.addEventListener("click", () => {
            window.location.href = "leaderboard.html";
        });
    }

    // Position theme button
    const themeBtn = document.getElementById('theme-btn');
    if (themeBtn) {
        themeBtn.style.position = 'fixed';
        themeBtn.style.bottom = '20px';
        themeBtn.style.right = '20px';
    }
});