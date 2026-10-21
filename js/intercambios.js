import { intercambios, usuarios } from "./datos.js";

// ========================================================
// 1. MOSTRAR DINÁMICAMENTE TODOS LOS INTERCAMBIOS EXISTENTES
// ========================================================
export function renderizarListadoGestion() {
    const contenedor = document.getElementById("lista-intercambios");
    if (!contenedor) return;

    // Limpiamos el contenedor para evitar duplicados al actualizar el listado
    contenedor.innerHTML = "";

    intercambios.forEach(function(intercambio) {
        // Buscamos el objeto del usuario que publica el intercambio para obtener su nombre
        const usuario = usuarios.find(u => u.id === intercambio.usuarioId);
        const nombreUsuario = usuario ? usuario.nombre : "Desconocido";

        // Diferenciar visualmente: Oferta (Azul) / Petición (Verde) usando tus clases CSS
        const tipoTarjeta = intercambio.tipo === "oferta" ? "tarjeta-oferta" : "tarjeta-peticion";
        const nombreTipo = intercambio.tipo === "oferta" ? "Oferta" : "Petición";

        // Formateamos la fecha a Día/Mes/Año para la visualización en pantalla
        const partesFecha = intercambio.fecha.split("-");
        const fechaFormateada = partesFecha.length === 3 
            ? `${partesFecha[2]}/${partesFecha[1]}/${partesFecha[0]}` 
            : intercambio.fecha;


        // Estructura responsive (Bootstrap col-12 col-md-6)
        const columna = document.createElement("div");
        columna.className = "col-12 col-md-6";

        // Creamos la estructura HTML idéntica al mockup incorporando la opción de eliminar
        columna.innerHTML = `
            <div class="tarjeta-intercambio ${tipoTarjeta} h-100">
                <p><strong>Título:</strong> ${intercambio.titulo}</p>
                <p><strong>Usuario:</strong> ${nombreUsuario}</p>
                <p><strong>Fecha:</strong> ${fechaFormateada}</p>
                <p><strong>Modalidad:</strong> ${intercambio.modalidad}</p>
                <p><strong>Tipo:</strong> ${nombreTipo}</p>
                <p><strong>Descripción:</strong> ${intercambio.descripcion}</p>
                <button class="boton-borrar mt-2" onclick="darDeBajaIntercambio(${intercambio.id})">Borrar</button>
            </div>
        `;

        contenedor.appendChild(columna);
    });
}

// ========================================================
// 2. FORMULARIO PARA DAR DE ALTA UN NUEVO INTERCAMBIO
// ========================================================
export function darDeAltaIntercambio(event) {
    event.preventDefault(); // Utilizar listeners para gestionar eventos evitando recarga

    // Recoger los valores introducidos en el formulario
    const tipoSeleccionado = document.getElementById('select-tipo').value;
    const tituloIntroducido = document.getElementById('input-titulo').value;
    const fechaIntroducida = document.getElementById('input-fecha').value;
    const modalidadIntroducida = document.getElementById('input-modalidad').value;
    const descripcionIntroducida = document.getElementById('textarea-descripcion').value;

    // Crear un objeto JavaScript para el nuevo intercambio con la estructura acordada
    const nuevoIntercambio = {
        id: intercambios.length > 0 ? Math.max(...intercambios.map(i => i.id)) + 1 : 1, // ID Autoincremental
        tipo: tipoSeleccionado,
        titulo: tituloIntroducido,
        idiomaOfrecido: tipoSeleccionado === "oferta" ? "Inglés" : "Español", // Campos descriptivos del intercambio
        idiomaSolicitado: tipoSeleccionado === "oferta" ? "Español" : "Inglés",
        modalidad: modalidadIntroducida,
        usuarioId: 1, // Simulamos de forma estática que somos el usuario logueado María (ID 1)
        fecha: fechaIntroducida,
        descripcion: descripcionIntroducida
    };

    // Añadirlo al array correspondiente (.push)
    intercambios.push(nuevoIntercambio);

    // Actualizar el listado después de añadirlo
    renderizarListadoGestion();

    // Limpiamos el formulario usando JavaScript puro nativo
    document.getElementById('mi-formulario').reset();
}

// ========================================================
// 3. OPCIÓN PARA ELIMINAR / DAR DE BAJA CADA INTERCAMBIO
// ========================================================
export function darDeBajaIntercambio(idAEliminar) {
    // Eliminar el intercambio correspondiente del array buscando su posición
    const indice = intercambios.findIndex(i => i.id === idAEliminar);

    if (indice !== -1) {
        intercambios.splice(indice, 1);
        
        // Actualizar el listado después de eliminarlo para reflejar los cambios
        renderizarListadoGestion();
    }
}

// ========================================================
// 4. MANTENER SEPARADO EL CÓDIGO JAVASCRIPT DEL HTML
// ========================================================

// Exponemos la función a la ventana global para que el evento inline 'onclick' de las tarjetas funcione
window.darDeBajaIntercambio = darDeBajaIntercambio;

// Listener para inicializar la aplicación una vez cargado el HTML5 completo
document.addEventListener('DOMContentLoaded', () => {
    // Ejecutamos nuestro renderizador específico de gestión
    renderizarListadoGestion();

    // Listener para capturar el submit del formulario de la izquierda
    const formulario = document.getElementById('mi-formulario');
    if (formulario) {
        formulario.addEventListener('submit', darDeAltaIntercambio);
    }
});
