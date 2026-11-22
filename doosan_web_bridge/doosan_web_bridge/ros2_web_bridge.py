from flask import Flask, request, jsonify
import subprocess
import threading
from pathlib import Path

app = Flask(__name__)

# ==========================================
# CONFIGURACIÓN
# ==========================================

COMANDO_ROS2 = [
    "ros2",
    "run",
    "doosan_control",
    "manolis_trajectory"
]

# Orígenes permitidos durante las pruebas locales
ORIGENES_PERMITIDOS = {
    "http://127.0.0.1:5500",
    "http://localhost:5500"
}

SABORES_VALIDOS = {
    "Blackberry",
    "Vanilla",
    "Chocolate",
    "Strawberry",
    "Cookies & Cream",
    "Cookie Dough",
    "Coffee",
    "Dulce de Leche",
    "Mint Chocolate Chip",
    "Cherries & Chocolate",
    "Coconut",
    "Tiramisu"
}

proceso_ros2 = None
bloqueo = threading.Lock()

ARCHIVO_LOG = Path(__file__).with_name(
    "ros2_manolis.log"
)


# ==========================================
# PERMITIR CONEXIÓN DESDE LIVE SERVER
# ==========================================

@app.after_request
def configurar_cors(respuesta):

    origen = request.headers.get("Origin")

    if origen in ORIGENES_PERMITIDOS:
        respuesta.headers["Access-Control-Allow-Origin"] = origen
        respuesta.headers["Vary"] = "Origin"
        respuesta.headers["Access-Control-Allow-Headers"] = (
            "Content-Type"
        )
        respuesta.headers["Access-Control-Allow-Methods"] = (
            "POST, OPTIONS"
        )

    return respuesta


# ==========================================
# RECIBIR PEDIDO DESDE LA WEB
# ==========================================

@app.route("/api/pedido", methods=["POST", "OPTIONS"])
def recibir_pedido():

    global proceso_ros2

    if request.method == "OPTIONS":
        return "", 204

    pedido = request.get_json(silent=True)

    if not isinstance(pedido, dict):
        return jsonify({
            "ok": False,
            "error": "El pedido debe estar en formato JSON"
        }), 400

    sabores = pedido.get("sabores", [])
    cantidad = pedido.get("cantidad", 1)

    # Validación básica del pedido
    if (
        not isinstance(sabores, list)
        or not 1 <= len(sabores) <= 2
        or len(set(
            s for s in sabores if isinstance(s, str)
        )) != len(sabores)
        or any(s not in SABORES_VALIDOS for s in sabores)
    ):
        return jsonify({
            "ok": False,
            "error": "Selección de sabores inválida"
        }), 400

    if (
        type(cantidad) is not int
        or not 1 <= cantidad <= 10
    ):
        return jsonify({
            "ok": False,
            "error": "Cantidad inválida"
        }), 400

    if pedido.get("presentacion") != "vaso":
        return jsonify({
            "ok": False,
            "error": "Presentación inválida"
        }), 400

    # Evitar ejecutar dos nodos simultáneamente
    with bloqueo:

        if (
            proceso_ros2 is not None
            and proceso_ros2.poll() is None
        ):
            return jsonify({
                "ok": False,
                "error": "El nodo ROS 2 sigue en ejecución"
            }), 409

        try:
            # Registrar la salida del nodo
            with open(
                ARCHIVO_LOG,
                "a",
                encoding="utf-8"
            ) as archivo:

                proceso_ros2 = subprocess.Popen(
                    COMANDO_ROS2,
                    stdout=archivo,
                    stderr=subprocess.STDOUT,
                    start_new_session=True
                )

        except OSError as error:

            return jsonify({
                "ok": False,
                "error": str(error)
            }), 500

    print("\n=================================")
    print("NUEVO PEDIDO MANOLIS")
    print("Sabores:", sabores)
    print("Cantidad:", cantidad)
    print("Nodo iniciado. PID:", proceso_ros2.pid)
    print("=================================\n")

    return jsonify({
        "ok": True,
        "mensaje": "Nodo ROS 2 iniciado",
        "pid": proceso_ros2.pid
    }), 202

def main(args=None):

    print("Puente Manolis - ROS 2 iniciado")

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False,
        threaded=True
    )

if __name__ == "__main__":
    main()