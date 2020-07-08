
import Services from '../controller/user'
const express = require('express')
const router = express.Router()

router.get('/', Services.get)
router.get('/deleted', Services.getUserDeleted)
router.get('/me', Services.getById)

router.post('/register', Services.register)

router.post('/signIn', Services.signIn)

router.post('/pw/reset', Services.resetPassword)

router.post('/pw/change', Services.changePassword)

router.put('/', Services.update)

router.delete('/', Services.delete)

module.exports = router
