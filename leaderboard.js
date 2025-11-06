const themes = [
    {
        name: "pink",
        bodyBg: "url(https://i.ibb.co/w7JM7Rm/pink141.gif)",
        canvasBg: "#fa9bcb",
        borderColor: "white",
        buttonBg: "#ffb3d9",
        buttonHover: "#ff80bf",
        textColor: "white",
        cellBg: "#873c5aff", // Light pink background for cells
        cellBgAlt: "#cf0a5cff" // Slightly darker pink for alternating rows
    },
    {
        name: "green",
        bodyBg: "url(https://i.ibb.co/qRrdWts/natfl009.jpg)",
        canvasBg: "#8A9A5B",
        borderColor: "#2d5016",
        buttonBg: "#b3ca9b",
        buttonHover: "#8fb573",
        textColor: "#ffff",
        cellBg: "#e8f0e1", // Light green background for cells
        cellBgAlt: "#d4e2c9" // Slightly darker green for alternating rows
    },
    {
        name: "blue",
        bodyBg: "url(https://i.ibb.co/6Z42wK3/ss024.gif)",
        canvasBg: "#b1d7f7ff",
        borderColor: "#1a365d",
        buttonBg: "#88bcf8ff",
        buttonHover: "#4a9cff",
        textColor: "#1a365d",
        cellBg: "#e3f2fd", // Light blue background for cells
        cellBgAlt: "#bbdefb" // Slightly darker blue for alternating rows
    },
    {
        name: "red",
        bodyBg: "url(https://i.ibb.co/YQmHm1Z/red050.jpg)",
        canvasBg: "#8B0000",
        borderColor: "#b10505ff",
        buttonBg: "#b30101ff",
        buttonHover: "#8e0d0dff",
        textColor: "#060606ff",
        cellBg: "#ffeaea", // Light red background for cells
        cellBgAlt: "#ffd6d6" // Slightly darker red for alternating rows
    },
    {
        name: "chess",
        bodyBg: "url(https://i.ibb.co/hsJzvvL/misc026.jpg)",
        canvasBg: "#A9A9A9",
        borderColor: "#f8f6faff",
        buttonBg: "#A9A9A9",
        buttonHover: "#ffffffff",
        textColor: "#f6f7f2ff",
        cellBg: "#f0f0f0", // Light gray background for cells
        cellBgAlt: "#e0e0e0" // Slightly darker gray for alternating rows
    }
];

let currentThemeIndex = 0;

// Leaderboard functionality
function initializeLeaderboard() {
    const table = document.getElementById("leaderboardTable");
    console.log("Initializing leaderboard...");

    if (!table) {
        console.error("Leaderboard table not found!");
        return;
    }

    const topScores = JSON.parse(localStorage.getItem("snakeTopScores")) || [];
    console.log("Top scores found:", topScores);

    // Clear existing rows except header
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // Handle empty state
    if (topScores.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="3" style="text-align: center; padding: 20px;">No scores yet! Play the game to set some records.</td>`;
        table.appendChild(row);
        return;
    }

    // Show top 10 scores or all available scores if less than 10
    const limit = Math.min(topScores.length, 10);

    for (let i = 0; i < limit; i++) {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${i + 1}</td><td>${topScores[i].name}</td><td>${topScores[i].score}</td>`;
        table.appendChild(row);
    }

    loadThemeForLeaderboard();
}

// Theme application for leaderboard page
function loadThemeForLeaderboard() {
    const savedTheme = localStorage.getItem('currentTheme');
    if (!savedTheme) return;

    const theme = JSON.parse(savedTheme);

    // Apply theme to page elements
    document.body.style.backgroundImage = theme.bodyBg;
    document.body.style.color = theme.textColor;

    // Update table borders and colors
    const table = document.getElementById('leaderboardTable');
    if (table) {
        const thCells = table.getElementsByTagName('th');
        const tdCells = table.getElementsByTagName('td');
        const rows = table.getElementsByTagName('tr');

        // Style header cells
        for (let cell of thCells) {
            cell.style.borderColor = theme.borderColor;
            cell.style.backgroundColor = theme.buttonBg;
            cell.style.color = theme.textColor;
        }

    }

    // Update button colors
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.style.backgroundColor = theme.buttonBg;
        button.style.color = theme.textColor;
        button.style.border = `1px solid ${theme.borderColor}`;
    });
}

function changeTheme() {
    const savedIndex = localStorage.getItem('currentThemeIndex');
    if (savedIndex !== null) {
        currentThemeIndex = parseInt(savedIndex);
    }

    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    const newTheme = themes[currentThemeIndex];

    // Apply theme immediately
    document.body.style.backgroundImage = newTheme.bodyBg;
    document.body.style.color = newTheme.textColor;

    // Update table
    const table = document.getElementById('leaderboardTable');
    if (table) {
        const thCells = table.getElementsByTagName('th');
        const tdCells = table.getElementsByTagName('td');
        const rows = table.getElementsByTagName('tr');

        // Style header cells
        for (let cell of thCells) {
            cell.style.borderColor = newTheme.borderColor;
            cell.style.backgroundColor = newTheme.buttonBg;
            cell.style.color = newTheme.textColor;
        }

        // Style data cells with alternating colors
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const cells = row.getElementsByTagName('td');
            for (let cell of cells) {
                cell.style.borderColor = newTheme.borderColor;
                cell.style.color = newTheme.textColor;
                // Apply alternating background colors
                if (i % 2 === 0) {
                    cell.style.backgroundColor = newTheme.cellBg || '#ffffff';
                } else {
                    cell.style.backgroundColor = newTheme.cellBgAlt || '#f5f5f5';
                }
            }
        }
    }

    // Update buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.style.backgroundColor = newTheme.buttonBg;
        button.style.color = newTheme.textColor;
        button.style.border = `1px solid ${newTheme.borderColor}`;
    });

    // Save theme
    localStorage.setItem('currentThemeIndex', currentThemeIndex.toString());
    localStorage.setItem('currentTheme', JSON.stringify(newTheme));
}

// Initialize the leaderboard page
document.addEventListener('DOMContentLoaded', function() {
    console.log("Leaderboard page loaded");

    // Initialize leaderboard
    initializeLeaderboard();

    // Load and apply theme
    loadThemeForLeaderboard();

    // Set up back button
    const backButton = document.querySelector('button[onclick*="index.html"]');
    if (backButton) {
        // Remove existing onclick and use event listener
        backButton.onclick = null;
        backButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // Set up theme button
    const themeBtn = document.getElementById('theme-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', changeTheme);
    }
});