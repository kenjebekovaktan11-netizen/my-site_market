from flask import Flask,request, jsonify
from flask_cors import CORS
import json
import os
app = Flask(__name__)
CORS(app)
DB_FILE = "cars_db.json"

# если файла нет — создаем
if not os.path.exists(DB_FILE):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump([], f, ensure_ascii=False)

def read_cars():
    with open(DB_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_cars(cars):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(cars, f, ensure_ascii=False, indent=2)

# Получить все объявления
@app.route("/api/cars", methods=["GET"])
def get_cars():
    cars = read_cars()
    return jsonify(cars)

# Добавить объявление
@app.route("/api/cars", methods=["POST"])
def add_car():
    data = request.json

    if not data:
        return jsonify({"error": "Нет данных"}), 400

    cars = read_cars()

    # Генерация ID
    data["id"] = str(len(cars) + 1)
    data["isUser"] = True

    cars.insert(0, data)
    save_cars(cars)

    return jsonify(data), 201

# Удалить объявление
@app.route("/api/cars/<car_id>", methods=["DELETE"])
def delete_car(car_id):
    cars = read_cars()
    cars = [car for car in cars if str(car.get("id")) != str(car_id)]
    save_cars(cars)
    return jsonify({"success": True})

if __name__ == "__main__":
    app.run(debug=True, port=5000)