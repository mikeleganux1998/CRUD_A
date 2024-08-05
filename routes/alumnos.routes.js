const express = require('express')
const router = express.Router()


let alumnosController = require('../controllers/alumnos.controller')


router.get('/getAlumnos/', alumnosController.getAlumnos)
router.get('/editAlumno/:id', alumnosController.editAlumno)

router.post('/createAlumno/', alumnosController.createAlumno)

router.put('/updateAlumno/:id', alumnosController.updateAlumno)

router.delete('/deleteAlumno/:id', alumnosController.deleteAlumno)


module.exports = router