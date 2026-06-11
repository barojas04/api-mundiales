# API REST - Copa Mundial de la FIFA

Esta es una API RESTful construida con Node.js y Express que expone información sobre distintas ediciones de la Copa Mundial de la FIFA. Utiliza SQLite para la persistencia de datos y Zod para la validación de entradas.

## Cómo ejecutar el proyecto

1. Instala las dependencias necesarias ejecutando: `npm install`
2. Inicia el servidor en modo desarrollo con: `npm run dev`
3. La API estará disponible en `http://localhost:4321`

## Cómo poblar la Base de Datos
El archivo `database.js` está configurado para que, al ejecutar el servidor por primera vez, verifique si la tabla `mundiales` está vacía. Si no hay registros, la base de datos se poblará automáticamente con 6 ediciones.