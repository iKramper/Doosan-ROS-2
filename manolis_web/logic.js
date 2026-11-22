
/* ==========================================
   MANOLIS - HMI
   SISTEMA DE PEDIDOS DE HELADOS
========================================== */

// ==========================================
// 1. VARIABLES GENERALES
// ==========================================

const MAX_SABORES = 2;
const MAX_CANTIDAD = 10;

let saboresSeleccionados = [];
let cantidad = 1;
let numeroPedido = 0;
let pedidoActual = null;

// Temporizadores para la simulación
let temporizadores = [];


// ==========================================
// 2. ELEMENTOS DEL HTML
// ==========================================

// Tarjetas de sabores
const tarjetas = document.querySelectorAll(".flavor-card");

const contadorSabores =
    document.getElementById("contador-sabores");

const contenedorSabores =
    document.getElementById("sabores-seleccionados");

// Resumen
const resumenSabor1 =
    document.getElementById("resumen-sabor-1");

const resumenSabor2 =
    document.getElementById("resumen-sabor-2");

const resumenCantidad =
    document.getElementById("resumen-cantidad");


// Cantidad
const cantidadTexto =
    document.getElementById("cantidad");

const btnSumar =
    document.getElementById("sumar-cantidad");

const btnRestar =
    document.getElementById("restar-cantidad");

// Confirmación
const btnConfirmar =
    document.getElementById("confirmar-pedido");

const modal =
    document.getElementById("modal-confirmacion");

const detalleModal =
    document.getElementById("detalle-modal");

const btnCerrarModal =
    document.getElementById("cerrar-modal");

const btnCancelar =
    document.getElementById("cancelar-pedido");

const btnEnviar =
    document.getElementById("enviar-pedido");

// Seguimiento
const seccionSeguimiento =
    document.getElementById("seguimiento");

const numeroPedidoTexto =
    document.getElementById("numero-pedido");

const estadoPedido =
    document.getElementById("estado-pedido");

const barraProgreso =
    document.getElementById("barra-progreso");

const mensajeEstado =
    document.getElementById("mensaje-estado");

const btnNuevoPedido =
    document.getElementById("nuevo-pedido");


// ==========================================
// 3. SELECCIÓN DE SABORES
// ==========================================

tarjetas.forEach((tarjeta) => {

    tarjeta.addEventListener("click", () => {

        const sabor = tarjeta.dataset.sabor;

        // No permitir modificar un pedido en preparación
        if (pedidoActual) {
            return;
        }

        // Si el sabor ya está seleccionado, quitarlo
        if (saboresSeleccionados.includes(sabor)) {

            saboresSeleccionados =
                saboresSeleccionados.filter(
                    item => item !== sabor
                );

            tarjeta.classList.remove("selected");

        } else {

            // Verificar que no supere dos sabores
            if (saboresSeleccionados.length >= MAX_SABORES) {

                alert("Solo puedes seleccionar máximo 2 sabores.");
                return;
            }

            saboresSeleccionados.push(sabor);

            tarjeta.classList.add("selected");
        }

        // Actualizar interfaz
        actualizarPedido();

    });

});


// ==========================================
// 4. ACTUALIZAR PEDIDO
// ==========================================

function actualizarPedido() {

    // Contador de sabores
    contadorSabores.textContent =
        `${saboresSeleccionados.length} / 2 seleccionados`;

    // Resumen
    resumenSabor1.textContent =
        saboresSeleccionados[0] || "Sin seleccionar";

    resumenSabor2.textContent =
        saboresSeleccionados[1] || "Sin seleccionar";

    // Cantidad
    cantidadTexto.textContent = cantidad;
    resumenCantidad.textContent = cantidad;

    // Cada sabor representa una porción

    // Actualizar sabores seleccionados
    mostrarSaboresSeleccionados();

    // Habilitar o deshabilitar confirmación
    btnConfirmar.disabled =
        saboresSeleccionados.length === 0;

    btnConfirmar.style.opacity =
        saboresSeleccionados.length === 0 ? "0.5" : "1";

    btnConfirmar.style.cursor =
        saboresSeleccionados.length === 0
            ? "not-allowed"
            : "pointer";
}


// ==========================================
// 5. MOSTRAR SABORES SELECCIONADOS
// ==========================================


function mostrarSaboresSeleccionados() {

    const contenedor = document.getElementById(
        "sabores-seleccionados"
    );

    // Limpiar el contenido anterior
    contenedor.innerHTML = "";

    // Si no hay sabores seleccionados
    if (saboresSeleccionados.length === 0) {

        contenedor.innerHTML = `
            <div class="empty-selection">
                <span>🍨</span>
                <p>Todavía no has seleccionado sabores.</p>
                <a href="#sabores">Explorar sabores</a>
            </div>
        `;

        return;
    }

    // Mostrar los sabores seleccionados
    saboresSeleccionados.forEach((sabor) => {

        const elemento = document.createElement("div");
        elemento.className = "selected-flavor-item";

        const nombre = document.createElement("span");
        nombre.textContent = "🍦 " + sabor;

        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "remove-flavor";
        boton.textContent = "×";

        boton.addEventListener("click", () => {

            // Eliminar sabor del arreglo
            saboresSeleccionados =
                saboresSeleccionados.filter(
                    item => item !== sabor
                );

            // Quitar selección visual
            document.querySelectorAll(".flavor-card")
                .forEach(tarjeta => {

                    if (tarjeta.dataset.sabor === sabor) {
                        tarjeta.classList.remove("selected");
                    }

                });

            actualizarPedido();
        });

        elemento.appendChild(nombre);
        elemento.appendChild(boton);

        contenedor.appendChild(elemento);
    });
}



// ==========================================
// 6. CONTROL DE CANTIDAD
// ==========================================

btnSumar.addEventListener("click", () => {

    if (pedidoActual) return;

    if (cantidad < MAX_CANTIDAD) {
        cantidad++;
        actualizarPedido();
    }

});

btnRestar.addEventListener("click", () => {

    if (pedidoActual) return;

    if (cantidad > 1) {
        cantidad--;
        actualizarPedido();
    }

});


// ==========================================
// 7. VENTANA DE CONFIRMACIÓN
// ==========================================

btnConfirmar.addEventListener("click", () => {

    if (pedidoActual) return;

    if (saboresSeleccionados.length === 0) {
        alert("Debes seleccionar al menos un sabor.");
        return;
    }

    // Crear resumen de confirmación
    const saboresTexto = saboresSeleccionados.join(" + ");

    detalleModal.innerHTML = `
        <p><strong>Sabores:</strong> ${saboresTexto}</p>
        <p><strong>Presentación:</strong> Vaso</p>
        <p><strong>Cantidad:</strong> ${cantidad}</p>
        <p><strong>Porciones por vaso:</strong>
            ${saboresSeleccionados.length}</p>
        <p><strong>Porciones totales:</strong>
            ${saboresSeleccionados.length * cantidad}</p>
    `;

    modal.classList.remove("hidden");

});


// Cerrar modal
function cerrarModal() {
    modal.classList.add("hidden");
}

btnCerrarModal.addEventListener("click", cerrarModal);
btnCancelar.addEventListener("click", cerrarModal);

// Cerrar al hacer clic fuera de la ventana
modal.addEventListener("click", (evento) => {

    if (evento.target === modal) {
        cerrarModal();
    }

});

// Cerrar con Escape
document.addEventListener("keydown", (evento) => {

    if (evento.key === "Escape") {
        cerrarModal();
    }

});


// ==========================================
// 8. CONFIRMAR PEDIDO
// ==========================================

btnEnviar.addEventListener("click", () => {

    if (pedidoActual) return;

    // Generar número de pedido
    numeroPedido++;

    // Crear objeto con información del pedido
    pedidoActual = {

        id: numeroPedido,

        sabores: [...saboresSeleccionados],

        presentacion: "vaso",

        cantidad: cantidad,

        estado: "recibido",

        fecha: new Date().toISOString()

    };

    // Mostrarlo en consola
    console.log("PEDIDO CONFIRMADO:");
    console.log(pedidoActual);

    // Cerrar ventana
    cerrarModal();

    // Mostrar seguimiento
    iniciarSeguimiento();

});


// ==========================================
// 9. SEGUIMIENTO DEL PEDIDO
// ==========================================

function iniciarSeguimiento() {

    // Ocultar configuración
    document.getElementById("personalizar")
        .classList.add("hidden");

    // Mostrar seguimiento
    seccionSeguimiento.classList.remove("hidden");

    // Mostrar ID
    numeroPedidoTexto.textContent =
        `#${String(pedidoActual.id).padStart(3, "0")}`;

    // Reiniciar indicadores
    document.querySelectorAll(".tracking-step")
        .forEach(paso => {

            paso.classList.remove("active", "completed");

        });

    barraProgreso.style.width = "0%";

    // Mostrar primera etapa
    actualizarEstado(
        "recibido",
        "Pedido recibido",
        10,
        0
    );

    // Simular preparación
    simularPreparacion();

    // Desplazar página hacia el seguimiento
    seccionSeguimiento.scrollIntoView({
        behavior: "smooth"
    });

}


// ==========================================
// 10. ACTUALIZAR ESTADO
// ==========================================

function actualizarEstado(
    estado,
    mensaje,
    progreso,
    pasoActual
) {

    pedidoActual.estado = estado;

    estadoPedido.textContent = mensaje;
    mensajeEstado.textContent = mensaje;

    barraProgreso.style.width = `${progreso}%`;

    const pasos =
        document.querySelectorAll(".tracking-step");

    pasos.forEach((paso, indice) => {

        paso.classList.remove("active", "completed");

        if (indice < pasoActual) {
            paso.classList.add("completed");
        }

        if (indice === pasoActual) {
            paso.classList.add("active");
        }

    });

    console.log("Estado del pedido:", estado);

}


// ==========================================
// 11. SIMULACIÓN DE PREPARACIÓN
// ==========================================

function simularPreparacion() {

    // SOLO PARA PRUEBAS DEL HMI
    // Más adelante ROS 2 enviará los estados reales

    const totalSabores = pedidoActual.sabores.length;
    const totalVasos = pedidoActual.cantidad;
    const totalPorciones = totalSabores * totalVasos;

    // Cada porción se simula durante 3 segundos
    const tiempoPorPorcion = 3000;

    // Preparar las porciones en orden
    for (let i = 0; i < totalPorciones; i++) {

        const temporizador = setTimeout(() => {

            const indiceSabor = i % totalSabores;
            const indiceVaso = Math.floor(i / totalSabores) + 1;

            const sabor =
                pedidoActual.sabores[indiceSabor];

            const estado =
                indiceSabor === 0
                    ? "sirviendo_sabor_1"
                    : "sirviendo_sabor_2";

            const paso =
                indiceSabor === 0 ? 1 : 2;

            const progreso =
                Math.round((i / totalPorciones) * 90) + 5;

            actualizarEstado(
                estado,
                `Sirviendo ${sabor} - Vaso ${indiceVaso} de ${totalVasos}`,
                progreso,
                paso
            );

        }, 1000 + i * tiempoPorPorcion);

        temporizadores.push(temporizador);
    }

    // Finalizar preparación
    const tiempoFinal =
        1000 + totalPorciones * tiempoPorPorcion;

    const temporizadorFinal = setTimeout(() => {

        actualizarEstado(
            "finalizado",
            "¡Tu pedido está listo!",
            100,
            3
        );

    }, tiempoFinal);

    temporizadores.push(temporizadorFinal);
}


// ==========================================
// 12. NUEVO PEDIDO
// ==========================================

btnNuevoPedido.addEventListener("click", () => {

    // Detener temporizadores anteriores
    temporizadores.forEach(clearTimeout);
    temporizadores = [];

    // Reiniciar variables
    saboresSeleccionados = [];
    cantidad = 1;
    pedidoActual = null;

    // Quitar selección visual
    tarjetas.forEach((tarjeta) => {
        tarjeta.classList.remove("selected");
    });

    // Ocultar seguimiento
    seccionSeguimiento.classList.add("hidden");

    // Mostrar configuración
    document.getElementById("personalizar")
        .classList.remove("hidden");

    // Actualizar interfaz
    actualizarPedido();

    // Volver al catálogo de sabores
    document.getElementById("sabores")
        .scrollIntoView({
            behavior: "smooth"
        });

});


// ==========================================
// 13. INICIALIZACIÓN
// ==========================================

actualizarPedido();

console.log("HMI MANOLIS INICIADO CORRECTAMENTE");
