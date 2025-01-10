const timer = document.getElementById('timer');
let timeLeft = 60;

const timerInterval = setInterval(() => {
    timeLeft--;
    timer.textContent = timeLeft;
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        window.location.href = '../templates/index.html';
    }
}, 1000);
