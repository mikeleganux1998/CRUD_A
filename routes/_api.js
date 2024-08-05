const express = require('express')
const router = express.Router()

router.use('/alumnos', require('./alumnos.routes'))


module.exports = router
