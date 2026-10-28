// Importamos los métodos del módulo centralizado del Producto 2 de tu equipo
import { guardarIntercambio, obtenerIntercambios, eliminarIntercambio, obtenerUsuarioActivo } from "./almacenaje.js";

// ========================================================
// 1. CONSULTA Y RENDERIZACIÓN DINÁMICA DE LA TABLA
// ========================================================
async function actualizarInterfaz() {
    const tablaCuerpo = document.getElementById("tabla-intercambios-cuerpo");
    if (!tablaCuerpo) return;

    // Vaciamos el cuerpo de la tabla para evitar duplicaciones físicas en pantalla
    tablaCuerpo.innerHTML = "";

    let listaIntercambios = [];
    try {
        // Operación asíncrona para obtener los registros desde IndexedDB
        listaIntercambios = await obtenerIntercambios();
    } catch (error) {
        console.error("Error al recuperar los intercambios de la base de datos:", error);
    }

    // Inicializadores de control para el balance estadístico del Canvas
    let conteoOfrezco = 0;
    let conteoBusco = 0;

    listaIntercambios.forEach(intercambio => {
        // Conteo basado en las cadenas validadas en almacenaje.js
        if (intercambio.tipo === "Ofrezco idioma") conteoOfrezco++;
        if (intercambio.tipo === "Busco idioma") conteoBusco++;

        // Adaptamos el formato de fecha para la presentación (DD/MM/YYYY)
        const partes = intercambio.fecha.split("-");
        const fechaFormateada = partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : intercambio.fecha;

        // Inyección técnica de filas en la tabla
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td class="fw-semibold">${intercambio.titulo}</td>
            <td><a href="mailto:${intercambio.email}" class="text-secondary text-decoration-none">${intercambio.email}</a></td>
            <td><small class="text-muted">${fechaFormateada}</small></td>
            <td><p class="mb-0 text-truncate" style="max-width: 150px;">${intercambio.descripcion}</p></td>
            <td>
                <span class="badge ${intercambio.tipo === 'Ofrezco idioma' ? 'bg-primary' : 'bg-success'}">
                    ${intercambio.tipo}
                </span>
            </td>
            <td class="text-center">
                <button class="btn btn-danger btn-sm px-2 btn-eliminar" data-id="${intercambio.id}">Borrar</button>
            </td>
        `;
        tablaCuerpo.appendChild(fila);
    });

    // Delegación y asignación de listeners a los botones de eliminación generados
    document.querySelectorAll(".btn-eliminar").forEach(boton => {
        boton.addEventListener("click", async (e) => {
            const idStr = e.target.getAttribute("data-id");
            // Conversión explícita a entero debido a que la keyPath autoincremental es numérica
            const idNum = parseInt(idStr, 10);
            
            try {
                // Invocación asíncrona al motor de borrado de IndexedDB
                await eliminarIntercambio(idNum);
                // Refrescamos la vista de forma reactiva tras completar la transacción
                actualizarInterfaz();
            } catch (error) {
                console.error("Error al ejecutar la baja en IndexedDB:", error);
            }
        });
    });

    // Redibujamos las barras del gráfico Canvas pasándole los totales actualizados
    renderizarGraficoCanvas(conteoOfrezco, conteoBusco);
}

// ========================================================
// 2. GENERACIÓN DEL GRÁFICO ESTADÍSTICO (CANVAS API)
// ========================================================
function renderizarGraficoCanvas(ofrezco, busco) {
    const canvas = document.getElementById("grafico-intercambios");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Reseteamos el lienzo para evitar solapamientos gráficos
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const lineaBaseY = 130; 
    const anchoBarra = 35;
    
    // Multiplicador de escala proporcional para dar presencia física a los rectángulos
    const factorEscala = 25; 
    const altoOfrezco = ofrezco * factorEscala;
    const altoBusco = busco * factorEscala;

    // Barra 1: Ofrezco idioma (Azul)
    ctx.fillStyle = "#0d6efd";
    ctx.fillRect(40, lineaBaseY - altoOfrezco, anchoBarra, altoOfrezco);
    ctx.fillStyle = "#212529";
    ctx.font = "bold 11px system-ui";
    ctx.fillText(`Ofrezco (${ofrezco})`, 25, lineaBaseY + 18);

    // Barra 2: Busco idioma (Verde)
    ctx.fillStyle = "#198754";
    ctx.fillRect(140, lineaBaseY - altoBusco, anchoBarra, altoBusco);
    ctx.fillStyle = "#212529";
    ctx.font = "bold 11px system-ui";
    ctx.fillText(`Busco (${busco})`, 130, lineaBaseY + 18);
}

// ========================================================
// 3. CAPTURA Y ALTA DE REGISTROS EN INDEXEDDB
// ========================================================
async function ejecutarAlta(event) {
    event.preventDefault(); // Detiene la recarga síncrona de la página del navegador

    // Estructuración del objeto literal interceptando los inputs del DOM
    const nuevoIntercambio = {
        titulo: document.getElementById("input-titulo").value.trim(),
        email: document.getElementById("input-email").value.trim(),
        fecha: document.getElementById("input-fecha").value,
        descripcion: document.getElementById("textarea-descripcion").value.trim(),
        tipo: document.getElementById("select-tipo").value // Carga "Ofrezco idioma" o "Busco idioma"
    };

    try {
        // Transacción asíncrona de guardado controlado en IndexedDB
        await guardarIntercambio(nuevoIntercambio);
        
        // Reseteamos las cajas del formulario y actualizamos los listados
        document.getElementById("form-intercambio").reset();
        actualizarInterfaz();
    } catch (error) {
        alert("Fallo en la inserción: " + error.message);
    }
}

// ========================================================
// 4. INICIALIZACIÓN DE COMPONENTES (ESCUCHADORES)
// ========================================================
document.addEventListener("DOMContentLoaded", () => {
    // Primera renderización analizando el estado síncrono de IndexedDB
    actualizarInterfaz();

    // Vinculamos el listener de control al submit del formulario
    const formulario = document.getElementById("form-intercambio");
    if (formulario) {
        formulario.addEventListener("submit", ejecutarAlta);
    }

    // Comprobación dinámica de sesión del usuario a través del módulo central
    const usuarioActivoContenedor = document.getElementById("usuarioActivo");
    if (usuarioActivoContenedor) {
        const usuarioLogueado = obtenerUsuarioActivo();
        // Muestra el correo electrónico si existe una sesión activa en localStorage
        usuarioActivoContenedor.textContent = usuarioLogueado ? usuarioLogueado.email : "-no login-";
    }
});
