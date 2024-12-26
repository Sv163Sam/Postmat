const pinInput = document.getElementById('pin-input');
const pinBoxes = document.querySelectorAll('.pin-box');
const message = document.getElementById('message');
const keyboard = document.getElementById('keyboard');
const warning = document.getElementById('warning');
const correctPins = ['123456', '234567', '345678', '456789'];
let attempts = 0;
let pin = '';
let locked = false;


function createKeyboard() {
    pinBoxes.forEach(box => box.textContent = "");
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'CA'];
    numbers.forEach(number => {
        const button = document.createElement('button');
        button.className = 'key';
        button.textContent = number;
        button.addEventListener('click', () => {
            if (number === 'CA') {
                clearPin();
            } else {
                addDigit(number);
            }
        });
        keyboard.appendChild(button);
    });
    const deleteButton = document.createElement('button');
    deleteButton.className = 'key';
    deleteButton.textContent = 'Del';
    deleteButton.addEventListener('click', deleteDigit);
    keyboard.appendChild(deleteButton);
}

function addDigit(digit) {
    if (pin.length < 6) {
        pin += digit;
        pinBoxes[pin.length - 1].textContent = "*";
        if (pin.length === 6) {
            checkPin();
        }
    }
}

function clearPin() {
    pin = '';
    pinBoxes.forEach(box => box.textContent = "");
}

function deleteDigit() {
    if (pin.length > 0) {
        pin = pin.slice(0, -1);
        pinBoxes.forEach((box, index) => {
            if (index < pin.length) {
                box.textContent = "*";
            } else {
                box.textContent = "";
            }
        });
    }
}

function checkPin() {
    if (locked) return;
    if (correctPins.includes(pin)) {
        window.location.href = 'success.html';
    } else {
        attempts++;
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
