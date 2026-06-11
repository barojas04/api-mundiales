const sqlite3 = require('sqlite3').verbose();


const db = new sqlite3.Database('./mundiales.sqlite', (err) => {
    if (err) {
        console.error('Error al conectar con SQLite:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
    }
});

db.serialize(() => {
    
    db.run(`CREATE TABLE IF NOT EXISTS mundiales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        anio INTEGER,
        sede TEXT,
        campeon TEXT,
        subcampeon TEXT,
        goleador TEXT,
        equipos INTEGER,
        imagen TEXT,
        slug TEXT UNIQUE,
        resumen TEXT,
        descripcion TEXT
    )`);

    
    db.get("SELECT COUNT(*) AS count FROM mundiales", (err, row) => {
        if (row.count === 0) {
            console.log("Poblando la base de datos con 6 ediciones del Mundial...");
            const stmt = db.prepare(`INSERT INTO mundiales (nombre, anio, sede, campeon, subcampeon, goleador, equipos, imagen, slug, resumen, descripcion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

            const mundiales = [
                ["Copa Mundial Qatar 2022", 2022, "Qatar", "Argentina", "Francia", "Kylian Mbappe", 32, "qatar-2022.avif", "qatar-2022", "Argentina campeón tras una final épica ante Francia.", "Primer Mundial en Medio Oriente; Argentina ganó en penales su tercer título."],
                ["Copa Mundial Rusia 2018", 2018, "Rusia", "Francia", "Croacia", "Harry Kane", 32, "rusia-2018.avif", "rusia-2018", "Francia consigue su segunda estrella.", "Un torneo marcado por el uso del VAR por primera vez; Francia derrotó a Croacia en la final."],
                ["Copa Mundial Brasil 2014", 2014, "Brasil", "Alemania", "Argentina", "James Rodriguez", 32, "brasil-2014.avif", "brasil-2014", "Alemania tetracampeón con gol de Götze.", "Mundial recordado por el 7-1 de Alemania a Brasil y la final definida en tiempos extra."],
                ["Copa Mundial Sudáfrica 2010", 2010, "Sudáfrica", "España", "Países Bajos", "Thomas Müller", 32, "sudafrica-2010.avif", "sudafrica-2010", "España gana su primer mundial gracias a Iniesta.", "Primer mundial en continente africano, famoso por las vuvuzelas y el pulpo Paul."],
                ["Copa Mundial Alemania 2006", 2006, "Alemania", "Italia", "Francia", "Miroslav Klose", 32, "alemania-2006.avif", "alemania-2006", "Italia tetracampeón en la despedida de Zidane.", "Final recordada por el cabezazo de Zidane a Materazzi; Italia ganó en penales."],
                ["Copa Mundial Corea/Japón 2002", 2002, "Corea del Sur y Japón", "Brasil", "Alemania", "Ronaldo", 32, "corea-japon-2002.avif", "corea-japon-2002", "Brasil pentacampeón con un Ronaldo estelar.", "Primer mundial organizado por dos países y primero en Asia; Brasil dominó el torneo."]
            ];

            mundiales.forEach(m => stmt.run(m));
            stmt.finalize();
            console.log("Datos iniciales insertados correctamente.");
        }
    });
});

module.exports = db;