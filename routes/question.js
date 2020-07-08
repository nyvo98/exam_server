
import Services from '../controller/question'
const express = require('express')
const router = express.Router()

router.get('/', Services.get)

router.get('/me/:id', Services.getById)

router.post('/', Services.create)

router.post('/uploadTest', Services.uploadFile)

router.put('/', Services.update)

router.delete('/', Services.delete)

module.exports = router
