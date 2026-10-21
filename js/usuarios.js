import { usuarios } from "./datos.js";

const tablaUsuarios = document.getElementById("tablaUsuarios");
const formUsuario = document.getElementById("formUsuario");

function mostrarUsuarios() {
    tablaUsuarios.innerHTML = "";

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
            const indice = usuarios.findIndex(function(u) {
                return u.id === usuario.id;
            });

            if (indice !== -1) {
                usuarios.splice(indice, 1);
                mostrarUsuarios();
            }
        });

        // Añadir la fila a la tabla
        tablaUsuarios.appendChild(fila);
    });
}

mostrarUsuarios();

formUsuario.addEventListener("submit", function(event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    console.log(nombre, email, password);

    const nuevoUsuario = {
    id: Math.max(0, ...usuarios.map(u => u.id)) + 1,
    nombre: nombre,
    email: email,
    password: password
};

usuarios.push(nuevoUsuario);

mostrarUsuarios();

formUsuario.reset();

});
