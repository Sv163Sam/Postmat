const timer = document.getElementById('timer');
let timeLeft = 30;

const timerInterval = setInterval(() => {
    timeLeft--;
    timer.textContent = timeLeft;
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        window.location.href = 'index.html';
    }
}, 1000);
