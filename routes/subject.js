
import Services from '../controller/subject'
const express = require('express')
const router = express.Router()

router.get('/', Services.get)
router.get('/me', Services.getListOfUser)
router.get('/lecture', Services.getByLecture)

router.get('/me/:id', Services.getById)

router.post('/', Services.create)
router.post('/addUser', Services.addUserToSubject)

router.put('/', Services.update)

router.delete('/', Services.delete)

module.exports = router
