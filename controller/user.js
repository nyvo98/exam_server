import BaseAPI from '.'
import { User } from '../model'
import {
  generateToken, convertPasswordHMAC256, genUpdate,
  lowerCase, getLength, generatePassword, sendEmail, generateCodeTest
} from '../common/function'
import { errMess } from '../common/constants'
import e from 'cors'

export default class UserServices {
  static async count (req, res) {
    BaseAPI.authorizationAPI(req, res, async () => {
      const payload = await User.countDocuments({})
      res.json(payload)
    })
  }

  static async getByIDList (idList) {
    let payload = await User.find({ isActive: true, id: { $in: idList } }, { id: 1, firstName: 1, lastName: 1 })
    if (getLength(payload) > 0) {
      payload = payload.map(item => {
        return { id: item.id, name: item.firstName + item.lastName }
      })
    }

    return payload
  }

  static async getById (req, res) {
    BaseAPI.authorizationAPI(req, res, async (createdUser) => {
      try {
        const findUser = await User.findOne({ id: createdUser })
        if (!findUser) return res.json({ success: false, errMess: 'userNotExists' })
        res.json({ success: true, data: findUser })
      } catch (err) {
        res.json({ success: false, errMess: errMess.someThingWentWrong, message: err })
      }
    })
  }

  static async signIn (req, res) {
    const { email, password } = req.body
    const emailFormat = lowerCase(email)
    const findUser = await User.findOne({ id: emailFormat })
    if (!findUser.isActive) return res.json({ success: false, errMess: 'userBlocked' })
    if (!findUser) return res.json({ success: false, errMess: 'notExistsUser' })
    if (findUser.password !== convertPasswordHMAC256(password)) return res.json({ success: false, errMess: 'passwordNotFound' })
    const jwtToken = generateToken(emailFormat)
    res.json({ jwt: jwtToken, data: findUser })
  }

  static async register (req, res) {
    BaseAPI.authorizationAPI(req, res, async (createdUser) => {
      const checkAdmin = await User.findOne({ id: createdUser }, { role: 1 })
      if (!(BaseAPI.checkRoleAdminUser(checkAdmin))) return res.json({ success: false, errMess: 'notPermission' })
      try {
        const { password, email } = req.body
        const emailFormat = lowerCase(email)
        const findOldUser = await User.findOne({ id: emailFormat })
        if (findOldUser) return res.json({ success: false, errMess: 'userExisted' })
        const jwtToken = generateToken(emailFormat)
        const stateCreate = genUpdate(req.body, [
          'name',
          'email',
          'image',
          'code',
          'role',
          'phone'
        ])
        stateCreate.id = emailFormat
        stateCreate.password = convertPasswordHMAC256(password)
        const result = await User.create(stateCreate)
        res.json({ jwtToken, data: result })
      } catch (err) {
        res.json({ success: false, errMess: errMess.someThingWentWrong, message: err })
      }
    })
  }

  static async getByIdLocal (id) {
    const payload = await User.findOne({ id })
    return payload.firstName + payload.lastName
  }

  static async get (req, res) {
    BaseAPI.authorizationAPI(req, res, async (createdUser) => {
      const checkAdmin = await User.findOne({ id: createdUser }, { role: 1 })
      if (!(BaseAPI.checkRoleAdminUser(checkAdmin))) return res.json({ success: false, errMess: 'notPermission' })
      try {
        const payload = await User.find({ isActive: true })
        res.json({ success: true, data: payload })
      } catch (err) {
        res.json({ success: false, errMess: errMess.someThingWentWrong, message: err })
      }
    })
  }

  static async changePassword (req, res) {
    BaseAPI.authorizationAPI(req, res, async (createdUser) => {
      try {
        const { oldPassword, newPassword } = req.body
        const findUser = await User.findOne({ id: createdUser })
        if (!findUser) return res.json({ success: false, errMess: 'notExistsUser' })
        if (!findUser.password === convertPasswordHMAC256(oldPassword)) return res.json({ success: false, errMess: 'wrongPassword' })
        findUser.password = convertPasswordHMAC256(newPassword)
        findUser.save()
        res.json({ success: true, data: findUser })
      } catch (err) {
        res.json({ success: false, errMess: errMess.someThingWentWrong, message: err })
      }
    })
  }

  static async update (req, res) {
    BaseAPI.authorizationAPI(req, res, async (createdUser) => {
      try {
        const updateField = genUpdate(req.body, ['name', 'phone', 'image'])
        const payload = await User.findOneAndUpdate({ id: createdUser }, updateField, { new: true })
        if (!payload) return res.json({ success: false, errMess: 'notExistsData' })
        res.json({ success: true, data: payload })
      } catch (err) {
        res.json({ success: false, errMess: errMess.someThingWentWrong, message: err })
      }
    })
  }

  static async resetPassword (req, res) {
    try {
      const { email } = req.body
      console.log('UserServices -> resetPassword -> email', email)
      const formatEmail = lowerCase(email)
      const findUser = await User.findOne({
        $or: [
          { id: formatEmail },
          { email: formatEmail }
        ]
      })
      console.log('UserServices -> resetPassword -> findUser', findUser)
      if (!findUser) return res.json({ success: false, errMess: 'notExistsUser' })
      const newPassword = generateCodeTest()
      findUser.password = convertPasswordHMAC256(newPassword)
      findUser.save()
      sendEmail(formatEmail, { subject: 'DOQUIZZ - Forgot passwod', password: newPassword }, 'forgotPasswordTest')
      res.json({ success: true })
    } catch (err) {
      res.json({ success: false, errMess: errMess.someThingWentWrong })
    }
  }

  static async delete (req, res) {
    BaseAPI.authorizationAPI(req, res, async (createdUser) => {
      try {
        const { id, isActive } = req.query
        const findUser = await User.findOne({ id: createdUser }, { role: 1 })
        if (!findUser) return res.json({ success: false, errMess: 'notExistsUser' })
        if (!BaseAPI.checkRoleAdminUser(findUser)) return res.json({ success: false, errMess: 'notPermission' })
        const payload = await User.findOneAndUpdate({ id }, { isActive }, { new: true })
        if (!payload) return res.json({ success: false, errMess: 'notExistsUser' })
        res.json({ success: true, data: payload })
      } catch (err) {
        res.json({ success: false, errMess: errMess.someThingWentWrong, message: err })
      }
    })
  }

  static async getUserDeleted (req, res) {
    BaseAPI.authorizationAPI(req, res, async (createdUser) => {
      const checkAdmin = await User.findOne({ id: createdUser }, { role: 1 })
      if (!(BaseAPI.checkRoleAdminUser(checkAdmin))) return res.json({ success: false, errMess: 'notPermission' })
      try {
        const payload = await User.find({ isActive: false })
        res.json({ success: true, data: payload })
      } catch (err) {
        res.json({ success: false, errMess: errMess.someThingWentWrong, message: err })
      }
    })
  }
}
