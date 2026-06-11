const express = require('express');
const db = require('./database'); // Conexión a la base de datos SQLite

// NOTA: Si no renombraste el archivo "shema.js" a "schema.js", 
// cambia la línea de abajo a: const { searchSchema } = require('./shema');
const { searchSchema } = require('./schema'); 

const app = express();
const PORT = 4321; // Puerto solicitado en los comandos xh

// Middleware para permitir que la API entienda JSON
app.use(express.json());

// ==========================================
// SERVIR IMÁGENES ESTÁTICAS (/imagenes/*)
// ==========================================
// Expone la carpeta public/imagenes para acceder directamente desde el navegador
app.use('/imagenes', express.static('public/imagenes'));


// ==========================================
// RUTAS DE LA API
// ==========================================

// 1. / (Información del API)
app.get('/', (req, res) => {
    res.status(200).json({
        mensaje: "API de la Copa Mundial de la FIFA",
        endpoints: [
            "/mundiales", 
            "/mundial/:slug", 
            "/campeon/:pais", 
            "/random", 
            "/search/:text", 
            "/imagenes/*"
        ]
    });
});

// 2. /mundiales (Listar todas las ediciones)
app.get('/mundiales', (req, res) => {
    const includeFull = req.query.include === 'full';
    
    db.all("SELECT * FROM mundiales", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Error interno del servidor" });
        }
        
        // Si se solicita include=full, se devuelve la estructura completa
        if (includeFull) {
            return res.status(200).json(rows);
        }
        
        // Si no se especifica full, devolvemos la estructura básica (sin resumen ni descripción)
        const resumenMundiales = rows.map(row => ({
            nombre: row.nombre,
            anio: row.anio,
            sede: row.sede,
            campeon: row.campeon,
            subcampeon: row.subcampeon,
            goleador: row.goleador,
            equipos: row.equipos,
            imagen: row.imagen,
            slug: row.slug
        }));
        
        res.status(200).json(resumenMundiales);
    });
});

// 3. /mundial/:slug (Consultar por identificador único)
app.get('/mundial/:slug', (req, res) => {
    const { slug } = req.params;
    
    db.get("SELECT * FROM mundiales WHERE slug = ?", [slug], (err, row) => {
        if (err) {
            return res.status(500).json({ error: "Error interno del servidor" });
        }
        
        // Código 404 si el recurso no existe
        if (!row) {
            return res.status(404).json({ error: "Not Found", mensaje: "No existe el recurso solicitado" });
        }
        
        res.status(200).json(row);
    });
});

// 4. /campeon/:pais (Slugs de las ediciones ganadas por ese país)
app.get('/campeon/:pais', (req, res) => {
    const { pais } = req.params;
    
    // COLLATE NOCASE permite buscar sin importar mayúsculas o minúsculas
    db.all("SELECT slug FROM mundiales WHERE campeon COLLATE NOCASE = ?", [pais], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Error interno del servidor" });
        }
        
        // Mapeamos para retornar únicamente el arreglo con los slugs correspondientes
        const slugs = rows.map(row => row.slug);
        res.status(200).json(slugs);
    });
});

// 5. /random (Obtener una edición al azar)
app.get('/random', (req, res) => {
    db.get("SELECT * FROM mundiales ORDER BY RANDOM() LIMIT 1", [], (err, row) => {
        if (err) {
            return res.status(500).json({ error: "Error interno del servidor" });
        }
        res.status(200).json(row);
    });
});

// 6. /search/:text (Buscar por texto con validación de Zod)
app.get('/search/:text', (req, res) => {
    const { text } = req.params;
    
    // Validación de entrada utilizando el esquema de Zod
    const validation = searchSchema.safeParse({ text });
    
    // Código 400: La validación de entrada falló
    if (!validation.success) {
        return res.status(400).json({
            error: "Bad Request",
            detalles: validation.error.errors[0].message
        });
    }
    
    const queryText = `%${text}%`;
    const query = `
        SELECT * FROM mundiales 
        WHERE nombre LIKE ? OR resumen LIKE ? OR descripcion LIKE ?
    `;
    
    db.all(query, [queryText, queryText, queryText], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Error interno del servidor" });
        }
        res.status(200).json(rows);
    });
});

// ==========================================
// MANEJO DE RUTAS NO DEFINIDAS (404)
// ==========================================
app.use((req, res) => {
    res.status(404).json({
        error: "Not Found",
        mensaje: "La ruta solicitada no está definida."
    });
});

// Inicialización del servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`🖼️  Ruta de imágenes activa en http://localhost:${PORT}/imagenes/*`);
});