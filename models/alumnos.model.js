const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const phonesModel = require('../models/phones.model');

const alumnoSchema = new Schema({
    status: { type: String, enum: ['activo', 'inactivo'], required: true },
    nombre: { type: String, required: true },
    apellidos: { type: String, required: true },
    calle: { type: String, required: true },
    colonia: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    fotografia: { type: String, required: true },
    telefonos: [{
        type: Schema.Types.ObjectId,
        ref: phonesModel,
        required: true
    }],
}, { timestamps: true }); // Add timestamps option

module.exports = mongoose.model('Alumnos', alumnoSchema);
