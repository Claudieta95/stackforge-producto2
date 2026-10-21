import { intercambios, usuarios } from "./datos.js";

const contenedor = document.getElementById("lista-intercambios");

intercambios.forEach(function(intercambio) {

    // Buscar el usuario que ha publicado el intercambio
    const usuario = usuarios.find(function(u) {
        return u.id === intercambio.usuarioId;
    });

    // Elegir el color según el tipo de intercambio
    const tipoTarjeta = intercambio.tipo === "oferta"
        ? "tarjeta-oferta"
        : "tarjeta-peticion";

    const nombreTipo = intercambio.tipo === "oferta"
        ? "Oferta de idioma"
        : "Petición de idioma";

    // Mostrar la fecha en formato día/mes/año
    const partesFecha = intercambio.fecha.split("-");
    const fecha = partesFecha[2] + "/" + partesFecha[1] + "/" + partesFecha[0];

    // Crear la tarjeta
    const columna = document.createElement("div");
    columna.className = "col-12 col-md-6";

    columna.innerHTML = `
        <div class="tarjeta-intercambio ${tipoTarjeta} h-100">
            <h3>${nombreTipo}</h3>
            <p>Título: ${intercambio.titulo}</p>
            <p>Fecha: ${fecha}</p>
            <p>${intercambio.idiomaOfrecido} → ${intercambio.idiomaSolicitado}</p>
            <p>Modalidad: ${intercambio.modalidad}</p>
            <p>Usuario: ${usuario ? usuario.nombre : "Desconocido"}</p>
            <p>Descripción: ${intercambio.descripcion}</p>
        </div>
    `;

    contenedor.appendChild(columna);
});

// Mostrar el usuario que ha iniciado sesión
const enlaceLogin = document.getElementById("enlace-login");
const botonCerrar = document.getElementById("cerrar-sesion");

const usuarioEmail = sessionStorage.getItem("usuarioEmail");

if (usuarioEmail) {
    enlaceLogin.textContent = usuarioEmail;
    botonCerrar.hidden = false;
}

// Cerrar sesión
botonCerrar.addEventListener("click", function() {
    sessionStorage.removeItem("usuarioEmail");

    enlaceLogin.textContent = "Iniciar sesión";
    botonCerrar.hidden = true;
});
