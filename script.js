const pinInput = document.getElementById('pin-input');
const message = document.getElementById('message');
const keyboard = document.getElementById('keyboard');
const warning = document.getElementById('warning');
const correctPins = ['123456', '234567', '345678', '456789'];
let attempts = 0;
let pin = '';
let locked = false;
let incorrectAttempt = false;


function createKeyboard() {
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'C'];
    numbers.forEach(number => {
        const button = document.createElement('button');
        button.className = 'key';
        button.textContent = number;
        button.addEventListener('click', () => {
            if (number === 'C') {
                clearPin();
            } else {
                addDigit(number);
            }
        });
        keyboard.appendChild(button);
    });
    const enterButton = document.createElement('button');
    enterButton.className = 'key';
    enterButton.textContent = 'Enter';
    enterButton.addEventListener('click', checkPin);
    keyboard.appendChild(enterButton);
}

function addDigit(digit) {
    if (pin.length < 6) {
        pin += digit;
        pinInput.textContent = pin.replace(/./g, '*');
    }
}

function clearPin() {
    pin = '';
    pinInput.textContent = '';
}

function checkPin() {
    if (locked) return;
    if (correctPins.includes(pin)) {
        window.location.href = 'success.html';
    } else {
        attempts++;
        incorrectAttempt = true;
        showWarning();
        setTimeout(clearPin, 1500);
        if (attempts >= 3) {
            window.location.href = 'error.html';
        }
    }
}

function showWarning() {
    warning.textContent = "INCORRECT PIN";
    warning.style.display = "block";
    setTimeout(() => {
        warning.style.display = "none";
    }, 1500);
}

createKeyboard();
