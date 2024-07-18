document.getElementById('search-btn').addEventListener('click', async () => {
    const username = document.getElementById('search-name').value.trim().toLowerCase();
    const token = localStorage.getItem('token');
    const response = await fetch(`/search?username=${encodeURIComponent(username)}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    const result = await response.json();
    document.getElementById('search-result').textContent = `${capitalizeFirstLetter(username)} has recited ${result.totalRecitations || 0} times.`;
});

async function updateTotalRecitations() {
    const response = await fetch('/total');
    const result = await response.json();
    document.getElementById('total-recitations').textContent = result.total;
}

async function updateLeaderboard() {
    const response = await fetch('/leaderboard');
    const result = await response.json();
    const leaderboard = document.getElementById('leaderboard');
    leaderboard.innerHTML = '';
    result.leaderboard.forEach((item, index) => {
        const li = document.createElement('li');
        let symbol = '';
        if (index === 0) {
            symbol = ' 👑';
        } else if (index === 1) {
            symbol = ' 🥈';
        }
        li.textContent = `${capitalizeFirstLetter(item.username)}: ${item.totalRecitations}${symbol}`;
        leaderboard.appendChild(li);
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Update leaderboard and total recitations when the page loads
window.addEventListener('DOMContentLoaded', () => {
    updateTotalRecitations();
    updateLeaderboard();
});
