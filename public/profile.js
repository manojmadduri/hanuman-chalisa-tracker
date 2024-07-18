document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    console.log('Token:', token);
    if (!token) {
        console.log('No token found, redirecting to login.');
        window.location.href = 'login.html';
    } else {
        fetchUserData(token);
    }

    const ctx = document.getElementById('recitation-chart').getContext('2d');
    const recitationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Recitations',
                data: [],
                backgroundColor: 'rgba(255, 165, 0, 0.5)',
                borderColor: 'rgba(255, 165, 0, 1)',
                borderWidth: 1,
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                }
            }
        }
    });

    function fetchUserData(token) {
        fetch('/user-data', {
            headers: {
                'Authorization': token,
            }
        })
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Data received:', data);
            document.getElementById('username').textContent = data.username;
            document.getElementById('user-total-recitations').textContent = data.totalRecitations;
            document.getElementById('daily-goal').textContent = data.dailyGoal;
            document.getElementById('weekly-goal').textContent = data.weeklyGoal;

            recitationChart.data.labels = data.recitationStats.labels;
            recitationChart.data.datasets[0].data = data.recitationStats.data;
            recitationChart.update();
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            window.location.href = 'login.html';
        });
    }

    document.getElementById('recitation-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const count = document.getElementById('count').value.trim();
        const token = localStorage.getItem('token');
        console.log('Submitting recitations with token:', token);

        const response = await fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
            },
            body: JSON.stringify({ count: parseInt(count, 10) }),
        });

        console.log('Submit response status:', response.status);
        fetchUserData(token);
    });
});
