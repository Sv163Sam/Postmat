const pinInput = document.getElementById('pin-input');
const pinBoxes = document.querySelectorAll('.pin-box');
const message = document.getElementById('message');
const keyboard = document.getElementById('keyboard');
const warning = document.getElementById('warning');
const correctPins = ['123456', '234567', '345678', '456789'];
let attempts = 0;
let pin = '';
let locked = false;

document.addEventListener('touchmove', function(event) {
    if (event.touches.length > 1) {
        event.preventDefault(); // Предотвращает масштабирование при использовании двух пальцев
    }
}, { passive: false });


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

async function checkPin1() {
    if (locked) return;

    if (correctPins.includes(pin)) {
        // Запрос на сервер для получения разрешения на выдачу посылки
        const response = await fetch('/parcel_request/' + pin, {
            method: 'POST', // Указываем метод POST
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Parcel ID:', data.parcel_id);
            window.location.href = '../static/success.html';
        } else {
            attempts++;
            console.log('Response status:', response.status);
            showWarning();
            setTimeout(clearPin, 1500);
            if (attempts >= 3) {
                window.location.href = '../static/error.html';
            }
        }
        clearPin()
    } else {
        attempts++;
        showWarning();
        setTimeout(clearPin, 1500);
        if (attempts >= 3) {
            window.location.href = '../static/error.html';
        }
    }
}

async function checkPin() {
    if (locked) return;

    if (correctPins.includes(pin)) {
        const response = await fetch('/parcel_request/' + pin, { method: 'POST', headers: {
        'Content-Type': 'application/json',
        'x-api-key': "1"
    }, });

        if (response.ok) {
            const data = await response.json();
            console.log('Parcel ID:', data.parcel_id);

            // Проверяем статус железа
            const statusResponse = await fetch('/get_status');
            if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                console.log('System Status:', statusData);

                // Открываем крышу
                const roofOpenResponse = await fetch('/roof_open', { method: 'POST' });
                if (roofOpenResponse.ok) {
                    console.log('Roof opened');

                    // Разрешаем выгрузку посылки
                    const unloadResponse = await fetch('/parcel_unload_request/' + data.parcel_id, { method: 'POST' });
                    if (unloadResponse.ok) {
                        console.log('Unload request approved');

                        // Уведомляем о том, что посылка была опущена
                        const pickupResponse = await fetch('/parcel_pickup', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ parcel_id: data.parcel_id, pincode: pin })
                        });

                        if (pickupResponse.ok) {
                            console.log('Parcel picked up');

                            // Запрашиваем загрузку в ячейку
                            const cellNumber = 1; // Замените на нужный номер ячейки
                            const loadResponse = await fetch('/parcel_load', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ cell_number: cellNumber }) // Обратите внимание на это изменение
                            });
                            if (loadResponse.ok) {
                                console.log('Parcel loaded into cell');

                                // Закрываем крышу
                                const roofCloseResponse = await fetch('/roof_close', { method: 'POST' });
                                if (roofCloseResponse.ok) {
                                    console.log('Roof closed');

                                    // Запрашиваем разрешение дрону на взлет
                                    const takeoffResponse = await fetch('/takeoff_request', { method: 'POST' });
                                    if (takeoffResponse.ok) {
                                        console.log('Drone takeoff approved');

                                        // Уведомляем о получении посылки
                                        const receivedResponse = await fetch('/parcel_received/' + data.parcel_id, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ parcel_id: data.parcel_id, pincode: pin })
                                        });

                                        if (receivedResponse.ok) {
                                            console.log('Parcel received');

                                            // Выдаем посылку пользователю
                                            const giveawayResponse = await fetch('/parcel_givedaway/' + data.parcel_id, { method: 'POST' });
                                            if (giveawayResponse.ok) {
                                                console.log('Parcel' + data.parcel_id + 'successfully given away to user');
                                                window.location.href = '../static/success.html';
                                            } else {
                                                console.error('Failed to give away the parcel');
                                            }
                                        } else {
                                            console.error('Failed to confirm parcel received');
                                        }
                                    } else {
                                        console.error('Failed to approve drone takeoff');
                                    }
                                } else {
                                    console.error('Failed to close roof');
                                }
                            } else {
                                console.error('Failed to load parcel into cell');
                            }
                        } else {
                            console.error('Failed to confirm parcel pickup');
                        }
                    } else {
                        console.error('Failed to approve unload request');
                    }
                } else {
                    console.error('Failed to open roof');
                }
            } else {
                console.error('Failed to get system status');
            }
        } else {
            attempts++;
            console.log('Response status:', response.status);
            showWarning();
            setTimeout(clearPin, 1500);
            if (attempts >= 3) {
                window.location.href = '../static/error.html';
            }
        }
        clearPin();
    } else {
        attempts++;
        showWarning();
        setTimeout(clearPin, 1500);
        if (attempts >= 3) {
            window.location.href = '../static/error.html';
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
