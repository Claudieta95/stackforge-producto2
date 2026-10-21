import { usuarios } from "./datos.js";

// Elementos del formulario
const formulario = document.getElementById("formulario-login");
const mensaje = document.getElementById("mensaje-login");
const enlaceLogin = document.getElementById("enlace-login");
const botonCerrar = document.getElementById("cerrar-sesion");

// Mostrar el correo si hay una sesión iniciada
function mostrarSesion() {
    const emailGuardado = sessionStorage.getItem("usuarioEmail");

    if (emailGuardado) {
        enlaceLogin.textContent = emailGuardado;
        botonCerrar.hidden = false;
    } else {
        enlaceLogin.textContent = "Iniciar sesión";
        botonCerrar.hidden = true;
    }
}

mostrarSesion();

// Comprobar el correo y la contraseña
formulario.addEventListener("submit", function(evento) {
    evento.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const usuario = usuarios.find(function(u) {
        return u.email === email && u.password === password;
    });

    if (usuario) {
        sessionStorage.setItem("usuarioEmail", usuario.email);

        mensaje.textContent = "Inicio de sesión correcto.";
        mensaje.className = "mt-3 text-success";
    } else {
        sessionStorage.removeItem("usuarioEmail");

        mensaje.textContent = "Correo electrónico o contraseña incorrectos.";
        mensaje.className = "mt-3 text-danger";
    }

    mostrarSesion();
});

// Cerrar sesión
botonCerrar.addEventListener("click", function() {
    sessionStorage.removeItem("usuarioEmail");

    formulario.reset();
    mensaje.textContent = "";

    mostrarSesion();
});