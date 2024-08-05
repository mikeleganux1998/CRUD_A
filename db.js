const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

mongoose.connect('mongodb://localhost:27017/CRUD_ALUMNO', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Conectado a la base de datos', 'CRUD_ALUMNO');
}).catch((e) => {
    console.error('Error al conectarse a la base de datos', e);
});

module.exports = mongoose;
