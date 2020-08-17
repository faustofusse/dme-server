const mongoose = require('mongoose');
const { DATABASE_URI } = require('../utils/constants');

mongoose.connect(DATABASE_URI, { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true })
    .then(db => console.log('Base de Datos Conectada.'))
    .catch(err => console.error(err));

module.exports = mongoose;  