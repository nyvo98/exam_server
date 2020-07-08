
import Services from '../controller/test'
const express = require('express')
const router = express.Router()

router.get('/', Services.get)
router.get('/soon', Services.getListCommingsoon)

router.get('/me/:id', Services.getById)

router.post('/', Services.create)
router.post('/submit', Services.onSubmitTest)
router.post('/addUser', Services.pushUserToTest)

router.put('/', Services.update)

router.delete('/', Services.delete)

module.exports = router
