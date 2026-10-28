import {
    obtenerUsuarios,
    guardarUsuario,
    eliminarUsuario,
    obtenerUsuarioActivo,
    cerrarSesion
} from "./almacenaje.js";

const tablaUsuarios = document.getElementById("tablaUsuarios");
const formUsuario = document.getElementById("formUsuario");
const mensajeUsuario = document.getElementById("mensajeUsuario");

// Mostrar el usuario que ha iniciado sesión
function mostrarUsuarioActivo() {
    const usuario = obtenerUsuarioActivo();

    const elemento = document.getElementById("usuarioActivo");
    const enlaceLogin = document.getElementById("enlace-login");
    const botonCerrarSesion = document.getElementById("cerrar-sesion");

    if (usuario) {
        elemento.textContent = usuario.nombre;
        enlaceLogin.hidden = true;
        botonCerrarSesion.hidden = false;
    } else {
        elemento.textContent = "-no login-";
        enlaceLogin.hidden = false;
        botonCerrarSesion.hidden = true;
    }
}

function mostrarUsuarios() {
    tablaUsuarios.innerHTML = "";

    const usuarios = obtenerUsuarios();

    usuarios.forEach(function(usuario) {
        const fila = document.createElement("tr");

        // Crear las celdas de la tabla
        const celdaNombre = document.createElement("td");
        celdaNombre.textContent = usuario.nombre;

        const celdaEmail = document.createElement("td");
        celdaEmail.textContent = usuario.email;

        const celdaPassword = document.createElement("td");
        celdaPassword.textContent = usuario.password;

        const celdaAcciones = document.createElement("td");

        // Crear el botón de borrar
        const botonBorrar = document.createElement("button");
        botonBorrar.type = "button";
        botonBorrar.className = "btn boton-borrar";
        botonBorrar.textContent = "Borrar";

        // Añadir el botón a la celda
        celdaAcciones.appendChild(botonBorrar);

        // Añadir las celdas a la fila
        fila.appendChild(celdaNombre);
        fila.appendChild(celdaEmail);
        fila.appendChild(celdaPassword);
        fila.appendChild(celdaAcciones);

        // Añadir el evento click
        botonBorrar.addEventListener("click", function() {

        const confirmar = confirm(
            `¿Estás seguro de que quieres eliminar a ${usuario.nombre}?`
        );

        if (confirmar) {
            eliminarUsuario(usuario.email);
            mostrarUsuarios();
            mostrarUsuarioActivo();

            mostrarMensaje("Usuario eliminado correctamente.", "success");
        }
    });

            // Añadir la fila a la tabla
            tablaUsuarios.appendChild(fila);
            });
        }

    // Mostrar mensajes de éxito o error
    function mostrarMensaje(texto, tipo) {
        mensajeUsuario.textContent = texto;

        mensajeUsuario.className = `alert alert-${tipo}`;
    }

    mostrarUsuarios();
    mostrarUsuarioActivo();

    formUsuario.addEventListener("submit", function(event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const nuevoUsuario = {
        nombre: nombre,
        email: email,
        password: password
    };

    try {
        guardarUsuario(nuevoUsuario);

        mostrarUsuarios();
        formUsuario.reset();

        mostrarMensaje("Usuario registrado correctamente.", "success");

    } catch (error) {
        mostrarMensaje(error.message, "danger");
    }
});

    // Cerrar sesión
    document.getElementById("cerrar-sesion").addEventListener("click", function() {
        cerrarSesion();
        mostrarUsuarioActivo();
});
