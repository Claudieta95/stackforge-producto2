"use strict";

import {
    obtenerIntercambios,
    obtenerSelecciones,
    guardarSeleccion,
    eliminarSeleccion,
    obtenerUsuarioActivo,
    cerrarSesion
} from "./almacenaje.js";

const disponibles = document.getElementById("lista-intercambios");
const seleccionados = document.getElementById("lista-seleccionados");
const mensaje = document.getElementById("mensaje-dashboard");

const usuarioActivo = document.getElementById("usuarioActivo");
const enlaceLogin = document.getElementById("enlace-login");
const botonCerrar = document.getElementById("cerrar-sesion");

let intercambios = [];
let selecciones = [];

// Mostrar el usuario activo
function mostrarUsuarioActivo() {
    const usuario = obtenerUsuarioActivo();

    usuarioActivo.textContent = usuario ? usuario.nombre : "-no login-";
    enlaceLogin.hidden = Boolean(usuario);
    botonCerrar.hidden = !usuario;
}

// Cerrar sesión
botonCerrar.addEventListener("click", function() {
    cerrarSesion();
    mostrarUsuarioActivo();
});

// Crear una tarjeta
function crearTarjeta(intercambio) {
    const columna = document.createElement("div");
    columna.className = "col-12";

    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta-intercambio h-100";

    const esOferta = intercambio.tipo === "Ofrezco idioma";

    tarjeta.classList.add(
        esOferta ? "tarjeta-oferta" : "tarjeta-peticion"
    );

    tarjeta.draggable = true;

    const titulo = document.createElement("h3");
    titulo.textContent = intercambio.tipo;

    const nombre = document.createElement("p");
    nombre.textContent = "Título: " + intercambio.titulo;

    const fecha = document.createElement("p");
    const partesFecha = intercambio.fecha.split("-");
    fecha.textContent = "Fecha: " +
        partesFecha[2] + "/" + partesFecha[1] + "/" + partesFecha[0];

    const email = document.createElement("p");
    email.textContent = "Email: " + intercambio.email;

    const descripcion = document.createElement("p");
    descripcion.textContent = "Descripción: " + intercambio.descripcion;

    tarjeta.append(titulo, nombre, fecha, email, descripcion);

    tarjeta.addEventListener("dragstart", function(evento) {
        evento.dataTransfer.setData(
            "text/plain",
            String(intercambio.id)
        );
    });

    columna.appendChild(tarjeta);
    return columna;
}

// Mostrar disponibles y seleccionados
function mostrarIntercambios() {
    disponibles.innerHTML = "";
    seleccionados.innerHTML = "";

    intercambios.forEach(function(intercambio) {
        const tarjeta = crearTarjeta(intercambio);

        if (selecciones.includes(intercambio.id)) {
            seleccionados.appendChild(tarjeta);
        } else {
            disponibles.appendChild(tarjeta);
        }
    });
}

// Permitir arrastrar tarjetas entre las dos zonas
function prepararZona(contenedor, seleccionar) {
    contenedor.addEventListener("dragover", function(evento) {
        evento.preventDefault();
    });

    contenedor.addEventListener("drop", async function(evento) {
        evento.preventDefault();

        const id = Number(
            evento.dataTransfer.getData("text/plain")
        );

        if (!intercambios.some(intercambio => intercambio.id === id)) {
            return;
        }

        try {
            if (seleccionar) {
                await guardarSeleccion(id);

                if (!selecciones.includes(id)) {
                    selecciones.push(id);
                }
            } else {
                await eliminarSeleccion(id);
                selecciones = selecciones.filter(
                    seleccionado => seleccionado !== id
                );
            }

            mostrarIntercambios();
            mensaje.textContent = "Selección guardada.";

        } catch (error) {
            console.error(error);
            mensaje.textContent = "Error al guardar la selección.";
        }
    });
}

// Cargar los datos de IndexedDB
async function iniciarDashboard() {
    mostrarUsuarioActivo();

    prepararZona(disponibles, false);
    prepararZona(seleccionados, true);

    try {
        intercambios = await obtenerIntercambios();

        const datosGuardados = await obtenerSelecciones();

        selecciones = datosGuardados.map(
            seleccion => seleccion.idIntercambio
        );

        mostrarIntercambios();

    } catch (error) {
        console.error(error);
        mensaje.textContent = "Error al cargar los intercambios.";
    }
}

iniciarDashboard();
