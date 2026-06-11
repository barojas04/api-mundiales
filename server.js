const express = require('express');
const db = require('./database'); 


const { searchSchema } = require('./schema'); 

const app = express();
const PORT = 4321; 


app.use(express.json());


app.use('/imagenes', express.static('public/imagenes'));



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


app.get('/mundiales', (req, res) => {
    const includeFull = req.query.include === 'full';
    
    db.all("SELECT * FROM mundiales", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Error interno del servidor" });
        }
        
        
        if (includeFull) {
            return res.status(200).json(rows);
        }
        
        
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


app.get('/mundial/:slug', (req, res) => {
    const { slug } = req.params;
    
    db.get("SELECT * FROM mundiales WHERE slug = ?", [slug], (err, row) => {
        if (err) {
            return res.status(500).json({ error: "Error interno del servidor" });
        }
        
        
        if (!row) {
            return res.status(404).json({ error: "Not Found", mensaje: "No existe el recurso solicitado" });
        }
        
        res.status(200).json(row);
    });
});


app.get('/campeon/:pais', (req, res) => {
    const { pais } = req.params;
    
    
    db.all("SELECT slug FROM mundiales WHERE campeon COLLATE NOCASE = ?", [pais], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Error interno del servidor" });
        }
        
        
        const slugs = rows.map(row => row.slug);
        res.status(200).json(slugs);
    });
});


app.get('/random', (req, res) => {
    db.get("SELECT * FROM mundiales ORDER BY RANDOM() LIMIT 1", [], (err, row) => {
        if (err) {
            return res.status(500).json({ error: "Error interno del servidor" });
        }
        res.status(200).json(row);
    });
});


app.get('/search/:text', (req, res) => {
    const { text } = req.params;
    
    
    const validation = searchSchema.safeParse({ text });
    
    
    if (!validation.success) {
        return res.status(400).json({
            error: "Bad Request",
            detalles: "El texto de búsqueda debe tener al menos 3 caracteres"
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


app.use((req, res) => {
    res.status(404).json({
        error: "Not Found",
        mensaje: "La ruta solicitada no está definida."
    });
});


app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`🖼️  Ruta de imágenes activa en http://localhost:${PORT}/imagenes/*`);
});