const { z } = require('zod');

const searchSchema = z.object({
    text: z.string().min(3, "El texto de búsqueda debe tener al menos 3 caracteres")
});

module.exports = { searchSchema };