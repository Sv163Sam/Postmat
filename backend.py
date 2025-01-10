import uvicorn
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Tuple
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi import Request

app = FastAPI()

# Настройка статических файлов и шаблонов
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


# Словарь для хранения посылок: parcel_id -> (cell_id, pin_code)
parcel_storage: Dict[str, Tuple[int, str]] = {
    "parcel_001": (1, '123456'),
    "parcel_002": (2, '234567'),
    "parcel_003": (3, '345678'),
    "parcel_004": (4, '456789'),
}


# Модели данных
class ParcelRequest(BaseModel):
    parcel_id: str


class ParcelPickup(BaseModel):
    parcel_id: str
    pincode: str


class ParcelLoad(BaseModel):
    cell_number: int


@app.get("/", response_class=HTMLResponse)
async def read_index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/roof_open")
async def open_roof():
    # Логика открытия крыши
    return {"status": "roof opened"}


@app.post("/parcel_unload_request/{parcel_id}")
async def parcel_unload_request(parcel_id: str):
    # Логика получения разрешения на выгрузку
    if parcel_id in parcel_storage:
        return {"status": "unload request approved"}
    raise HTTPException(status_code=404, detail="Parcel not found")


@app.post("/takeoff_request")
async def takeoff_request():
    # Логика получения разрешения на взлёт дрона
    return {"status": "takeoff approved"}


@app.post("/roof_close")
async def close_roof():
    # Логика закрытия крыши
    return {"status": "roof closed"}


@app.post("/parcel_pickup")
async def parcel_pickup(request: ParcelPickup):
    # Логика обработки получения посылки
    parcel_id = request.parcel_id
    pincode = request.pincode

    if parcel_id not in parcel_storage:
        raise HTTPException(status_code=404, detail="Parcel not found")

    if parcel_storage[parcel_id][1] != pincode:
        raise HTTPException(status_code=400, detail="Invalid PIN code")

    del parcel_storage[parcel_id]
    return {"status": "parcel picked up"}


@app.post("/parcel_request/{pincode}")
async def parcel_request(pincode: str):
    # Логика обработки запроса от планшета
    for parcel_id, (cell_id, stored_pincode) in parcel_storage.items():
        if stored_pincode == pincode:
            return {"parcel_id": parcel_id}
    raise HTTPException(status_code=404, detail="Parcel not found")


@app.post("/parcel_received/{parcel_id}")
async def parcel_received(parcel_id: str):
    if parcel_id in parcel_storage:
        raise HTTPException(status_code=400, detail="Parcel ID already exists")
    # Логика уведомления о получении посылки
    pin_code = ""
    parcel_storage[parcel_id] = (len(parcel_storage) + 1, pin_code)
    return {"pin_code": pin_code}


@app.post("/parcel_givedaway/{parcel_id}")
async def parcel_givedaway(parcel_id: str):
    # Логика обработки выдачи посылки
    if parcel_id not in parcel_storage:
        raise HTTPException(status_code=404, detail="Parcel not found")

    del parcel_storage[parcel_id]
    return {"status": "parcel given away"}


@app.post("/parcel_load")
async def parcel_load(cell_number: ParcelLoad):
    if cell_number.cell_number < 1:
        raise HTTPException(status_code=400, detail="Cell number must be greater than 0")
    # Логика загрузки посылки на конвейер и в постомат
    return {"status": f"Parcel loaded into cell {cell_number.cell_number}"}


@app.post("/parcel_takeaway/{cell_number}")
async def parcel_takeaway(cell_number: int):
    if cell_number < 1:
        raise HTTPException(status_code=400, detail="Cell number must be greater than 0")
    # Логика выдачи посылки из ячейки
    return {"status": f"Parcel taken from cell {cell_number}"}


@app.get("/get_status")
async def get_status():
    # Логика получения статуса железа
    system_status = {
        "roof": "",
        "drone": "",
        "parcels_in_storage": len(parcel_storage),
        "last_maintenance": ""
    }
    return {"status": "All systems functional", "details": system_status}


if __name__ == "__main__":
    uvicorn.run("backend:app", host="127.0.0.1", port=8000, reload=True)
