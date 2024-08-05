const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const phoneSchema = new Schema({
    number: {
        type: String,
        unique: true,
        required: true,
    },
});


module.exports = mongoose.model('phones', phoneSchema);
