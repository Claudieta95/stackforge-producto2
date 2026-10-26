import {
    obtenerUsuarios,
    guardarUsuario,
    eliminarUsuario,
    obtenerUsuarioActivo,
    cerrarSesion
} from "./almacenaje.js";

const tablaUsuarios = document.getElementById("tablaUsuarios");
const formUsuario = document.getElementById("formUsuario");

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

        fila.innerHTML = `
            <td>${usuario.nombre}</td>
            <td>${usuario.email}</td>
            <td>${usuario.password}</td>
            <td>
                <button type="button" class="btn boton-borrar">
                Borrar
                </button>
            </td>
        `;

        // Encontrar el botón de esta fila
        const botonBorrar = fila.querySelector(".boton-borrar");

        // Añadir el evento click
        botonBorrar.addEventListener("click", function() {
            eliminarUsuario(usuario.email);
            mostrarUsuarios();
            mostrarUsuarioActivo();
        });

            // Añadir la fila a la tabla
            tablaUsuarios.appendChild(fila);
            });
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

        alert("Usuario registrado correctamente.");

    } catch (error) {
        alert(error.message);
    }
});

    // Cerrar sesión
    document.getElementById("cerrar-sesion").addEventListener("click", function() {
        cerrarSesion();
        mostrarUsuarioActivo();
});
