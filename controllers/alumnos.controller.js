const AlumnosModel = require('../models/alumnos.model');
const phonesModel = require('../models/phones.model');


module.exports = {
    getAlumnos: async (req, res) => {
        try {
            const alumnos = await AlumnosModel.aggregate([
                {
                    $lookup: {
                        from: 'phones', // Nombre de la colección de teléfonos
                        localField: 'telefonos', // Campo en AlumnosModel que contiene los IDs de teléfonos
                        foreignField: '_id', // Campo en phonesModel que es el ID
                        as: 'telefonosDetails' // Nombre del nuevo campo en el resultado que contendrá los documentos de teléfonos
                    }
                },

                {
                    $project: {
                        status: 1,
                        nombre: 1,
                        apellidos: 1,
                        calle: 1,
                        colonia: 1,
                        correo: 1,
                        fotografia: 1,
                        telefonosDetails: {
                            number: 1 // Campos a incluir en telefonosDetails
                        }
                    }
                }
            ]);


            res.status(200).json({
                success: true,
                alumnos
            });
        } catch (err) {
            res.status(500).send(err.message);
        }
    },

    createAlumno: async (req, res) => {
        try {
            let body = req.body;
            let telefonos_array = body.telefonos;

            // Verificar si alguno de los números de teléfono ya existe
            const existingPhones = await phonesModel.find({number: {$in: telefonos_array}});
            if (existingPhones.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Los siguientes números de teléfono ya existen: ${existingPhones.map(phone => phone.number).join(', ')}`
                });
            }

            // Crear nuevos registros de teléfono y obtener sus IDs
            const newPhoneRecords = await phonesModel.insertMany(telefonos_array.map(number => ({number})));
            const phoneIds = newPhoneRecords.map(phone => phone._id);

            // Crear el nuevo alumno con los IDs de los teléfonos
            const newAlumno = new AlumnosModel({
                status: body.status,
                nombre: body.nombre,
                apellidos: body.apellidos,
                calle: body.calle,
                colonia: body.colonia,
                correo: body.correo,
                fotografia: body.fotografia,
                telefonos: phoneIds
            });

            await newAlumno.save();
            res.status(200).json({
                success: true,
                message: 'Alumno creado',
                alumno: newAlumno
            });
        } catch (err) {
            console.error(err)
            res.status(500).send(err.message);
        }
    },

    editAlumno: async (req, res) => {
        try {
            let {id} = req.params;

            const alumno = await AlumnosModel.findById(id).populate({
                path: 'telefonos',
                select: 'number',
                model: phonesModel
            });

            console.log("alumno----------------", alumno);

            res.status(200).json({
                success: true,
                alumno
            })


        } catch (err) {
            res.status(500).send(err.message);
        }
    },

    updateAlumno: async (req, res) => {
        try {
            const { id } = req.params;
            const body = req.body;
            let telefonos_array = body.telefonos;

            // Encontrar el alumno que se está actualizando
            const alumno = await AlumnosModel.findById(id).populate('telefonos');
            if (!alumno) {
                return res.status(404).json({
                    success: false,
                    message: 'Alumno no encontrado'
                });
            }

            // Obtener los números de teléfono actuales del alumno
            const oldPhoneNumbers = alumno.telefonos.map(phone => phone.number);

            // Encontrar teléfonos existentes en la base de datos
            const existingPhones = await phonesModel.find({ number: { $in: telefonos_array } });
            const existingPhoneNumbers = existingPhones.map(phone => phone.number);

            // Verificar si los números de teléfono existen y no están asociados al alumno actual
            const duplicatePhones = existingPhoneNumbers.filter(number =>
                !oldPhoneNumbers.includes(number)
            );

            if (duplicatePhones.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Los siguientes números de teléfono ya existen: ${duplicatePhones.join(', ')}`
                });
            }

            // Actualizar los registros de teléfono y obtener sus IDs
            const newPhoneRecords = await phonesModel.insertMany(
                telefonos_array
                    .filter(number => !oldPhoneNumbers.includes(number))
                    .map(number => ({ number }))
            );
            const newPhoneIds = newPhoneRecords.map(phone => phone._id);

            // Eliminar teléfonos antiguos que ya no están en el nuevo registro
            await phonesModel.deleteMany({
                _id: { $in: alumno.telefonos.filter(id => !newPhoneIds.includes(id)) }
            });

            // Actualizar el alumno con los nuevos IDs de teléfonos
            await AlumnosModel.findByIdAndUpdate(id, {
                ...body,
                telefonos: [...newPhoneIds, ...alumno.telefonos]
            });

            res.status(200).json({
                success: true,
                message: 'Datos actualizados'
            });
        } catch (err) {
            res.status(500).send(err.message);
        }
    },

    deleteAlumno: async (req, res) => {
        try {
            const {id} = req.params;
            const alumno = await AlumnosModel.findById(id);

            if (alumno) {
                // Eliminar registros de teléfono asociados
                await phonesModel.deleteMany({_id: {$in: alumno.telefonos}});
                // Eliminar el alumno
                await AlumnosModel.findByIdAndDelete(id);
                res.status(200).json({
                    success: true,
                    message: "Alumno eliminado"
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: "Alumno no encontrado"
                });
            }
        } catch (err) {
            res.status(500).send(err.message);
        }
    }
}