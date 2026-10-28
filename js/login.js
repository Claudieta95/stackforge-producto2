import {
    loguearUsuario,
    obtenerUsuarioActivo,
    cerrarSesion
} from "./almacenaje.js";

// Elementos de la página
const formulario = document.getElementById("formulario-login");
const mensaje = document.getElementById("mensaje-login");
const usuarioActivo = document.getElementById("usuarioActivo");
const botonCerrar = document.getElementById("cerrar-sesion");

// Mostrar el usuario que ha iniciado sesión
function mostrarSesion() {
    const usuario = obtenerUsuarioActivo();

    if (usuario) {
        usuarioActivo.textContent = usuario.nombre;
        botonCerrar.hidden = false;
    } else {
        usuarioActivo.textContent = "-no login-";
        botonCerrar.hidden = true;
    }
}

// Comprobar los datos del formulario
formulario.addEventListener("submit", function(evento) {
    evento.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        mensaje.textContent = "Introduce el correo y la contraseña.";
        mensaje.className = "mt-3 text-danger";
        return;
    }

    const usuario = loguearUsuario(email, password);

    if (usuario) {
        mensaje.textContent = "Inicio de sesión correcto.";
        mensaje.className = "mt-3 text-success";
        formulario.reset();
    } else {
        mensaje.textContent = "Correo electrónico o contraseña incorrectos.";
        mensaje.className = "mt-3 text-danger";
    }

    mostrarSesion();
});

// Cerrar la sesión
botonCerrar.addEventListener("click", function() {
    cerrarSesion();

    formulario.reset();
    mensaje.textContent = "";

    mostrarSesion();
});

// Comprobar si ya había una sesión iniciada
mostrarSesion();
