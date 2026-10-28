"use strict";

// Gestión de usuarios con localStorage

const CLAVE_USUARIOS = "stackforge_usuarios";
const CLAVE_USUARIO_ACTIVO = "usuarioEmail";

export function obtenerUsuarios() {
    const datos = localStorage.getItem(CLAVE_USUARIOS);

    try {
        const usuarios = datos ? JSON.parse(datos) : [];
        return Array.isArray(usuarios) ? usuarios : [];
    } catch (error) {
        console.error("Error al recuperar usuarios:", error);
        return [];
    }
}

export function guardarUsuario(usuario) {
    if (!usuario.nombre?.trim() ||
        !usuario.email?.trim() ||
        !usuario.password?.trim()) {
        throw new Error("Todos los campos son obligatorios.");
    }

    const usuarios = obtenerUsuarios();
    const email = usuario.email.trim().toLowerCase();

    if (usuarios.some(u => u.email.toLowerCase() === email)) {
        throw new Error("Ya existe un usuario con ese correo.");
    }

    usuarios.push({
        nombre: usuario.nombre.trim(),
        email,
        password: usuario.password
    });

    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
}

export function eliminarUsuario(email) {
    const emailNormalizado = email.trim().toLowerCase();

    const usuarios = obtenerUsuarios();
    const actualizados = usuarios.filter(
        usuario => usuario.email !== emailNormalizado
    );

    localStorage.setItem(
        CLAVE_USUARIOS,
        JSON.stringify(actualizados)
    );

    if (localStorage.getItem(CLAVE_USUARIO_ACTIVO) === emailNormalizado) {
        cerrarSesion();
    }
}

export function loguearUsuario(email, password) {
    const emailNormalizado = email.trim().toLowerCase();

    const usuario = obtenerUsuarios().find(
        u => u.email === emailNormalizado &&
             u.password === password
    );

    if (usuario) {
        localStorage.setItem(CLAVE_USUARIO_ACTIVO, usuario.email);
    }

    return usuario || null;
}

export function obtenerUsuarioActivo() {
    const email = localStorage.getItem(CLAVE_USUARIO_ACTIVO);

    if (!email) {
        return null;
    }

    return obtenerUsuarios().find(
        usuario => usuario.email === email
    ) || null;
}

export function cerrarSesion() {
    localStorage.removeItem(CLAVE_USUARIO_ACTIVO);
}


// Conexión con IndexedDB

const NOMBRE_BD = "StackForgeDB";
const VERSION_BD = 1;

const TABLA_INTERCAMBIOS = "intercambios";
const TABLA_SELECCIONES = "selecciones";

export function abrirBaseDatos() {
    return new Promise((resolve, reject) => {
        const solicitud = indexedDB.open(NOMBRE_BD, VERSION_BD);

        solicitud.onupgradeneeded = (evento) => {
            const db = evento.target.result;

            if (!db.objectStoreNames.contains(TABLA_INTERCAMBIOS)) {
                db.createObjectStore(TABLA_INTERCAMBIOS, {
                    keyPath: "id",
                    autoIncrement: true
                });
            }

            if (!db.objectStoreNames.contains(TABLA_SELECCIONES)) {
                db.createObjectStore(TABLA_SELECCIONES, {
                    keyPath: "idIntercambio"
                });
            }
        };

        solicitud.onsuccess = () => {
            resolve(solicitud.result);
        };

        solicitud.onerror = () => {
            reject(solicitud.error);
        };

        solicitud.onblocked = () => {
            reject(new Error("La base de datos está bloqueada."));
        };
    });
}

// Ejecuta operaciones de lectura y escritura en IndexedDB

async function ejecutarOperacion(tabla, modo, operacion) {
    const db = await abrirBaseDatos();

    return new Promise((resolve, reject) => {
        let resultado;
        let finalizado = false;

        try {
            const transaccion = db.transaction(tabla, modo);
            const almacen = transaccion.objectStore(tabla);
            const solicitud = operacion(almacen);

            solicitud.onsuccess = () => {
                resultado = solicitud.result;
            };

            transaccion.oncomplete = () => {
                finalizado = true;
                db.close();
                resolve(resultado);
            };

            transaccion.onerror = () => {
                if (!finalizado) {
                    finalizado = true;
                    db.close();
                    reject(transaccion.error);
                }
            };

            transaccion.onabort = () => {
                if (!finalizado) {
                    finalizado = true;
                    db.close();
                    reject(transaccion.error ||
                        new Error("Operación cancelada."));
                }
            };
        } catch (error) {
            db.close();
            reject(error);
        }
    });
}


// Gestión de intercambios con IndexedDB

export async function guardarIntercambio(intercambio) {
    if (!intercambio.titulo?.trim() ||
        !intercambio.email?.trim() ||
        !intercambio.fecha ||
        !intercambio.descripcion?.trim() ||
        !["Ofrezco idioma", "Busco idioma"].includes(intercambio.tipo)) {
        throw new Error("Los datos del intercambio no son válidos.");
    }

    const nuevoIntercambio = {
        titulo: intercambio.titulo.trim(),
        email: intercambio.email.trim().toLowerCase(),
        fecha: intercambio.fecha,
        descripcion: intercambio.descripcion.trim(),
        tipo: intercambio.tipo
    };

    return ejecutarOperacion(
        TABLA_INTERCAMBIOS,
        "readwrite",
        almacen => almacen.add(nuevoIntercambio)
    );
}

export async function obtenerIntercambios() {
    return ejecutarOperacion(
        TABLA_INTERCAMBIOS,
        "readonly",
        almacen => almacen.getAll()
    );
}

export async function eliminarIntercambio(id) {
    const db = await abrirBaseDatos();

    return new Promise((resolve, reject) => {
        const transaccion = db.transaction(
            [TABLA_INTERCAMBIOS, TABLA_SELECCIONES],
            "readwrite"
        );

        transaccion.objectStore(TABLA_INTERCAMBIOS).delete(id);
        transaccion.objectStore(TABLA_SELECCIONES).delete(id);

        transaccion.oncomplete = () => {
            db.close();
            resolve();
        };

        transaccion.onerror = () => {
            db.close();
            reject(transaccion.error);
        };

        transaccion.onabort = () => {
            db.close();
            reject(transaccion.error);
        };
    });
}


// Selecciones del Dashboard con IndexedDB

export async function guardarSeleccion(idIntercambio) {
    return ejecutarOperacion(
        TABLA_SELECCIONES,
        "readwrite",
        almacen => almacen.put({ idIntercambio })
    );
}

export async function obtenerSelecciones() {
    return ejecutarOperacion(
        TABLA_SELECCIONES,
        "readonly",
        almacen => almacen.getAll()
    );
}

export async function eliminarSeleccion(idIntercambio) {
    return ejecutarOperacion(
        TABLA_SELECCIONES,
        "readwrite",
        almacen => almacen.delete(idIntercambio)
    );
}
