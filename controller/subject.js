import BaseAPI from '.'
import { Subject, User } from '../model'
import { genUpdate, generateID } from '../common/function'
import { errMess } from '../common/constants'
import TestServices from '../controller/test'
const arrRole = ['admin', 'lecture']
export default class UserServices {
  static async get (req, res) {
    BaseAPI.authorizationAPI(req, res, async (id) => {
      const payload = await Subject.find({ createdUser: id, isActive: true })
      res.json({ success: true, data: payload })
    })
  }

  static async getByLecture (req, res) {
    BaseAPI.authorizationAPI(req, res, async (id) => {
      console.log('UserServices -> getByLecture -> id', id)
      const payload = await Subject.find({ createdUser: id })
      res.json({ success: true, data: payload })
    })
  }

  static async getListOfUser (req, res) {
    BaseAPI.authorizationAPI(req, res, async (id) => {
      try {
        const allData = await Subject.find({})
        const filterData = allData.filter(item => item.listUserExtend.includes(id))
        const payload = await Promise.all(filterData)
        console.log('UserServices -> getListOfUser -> payload', payload)
        res.json({ success: true, data: payload })
      } catch (err) {
        res.json({ success: false, errMess: errMess.someThingWentWrong })
      }
    })
  }

  static async getByIdLocal (id) {
    console.log('UserServices -> getByIdLocal -> id', id)
    const payload = await Subject.findOne({ id })
    return payload || false
  }

  static async getById (req, res) {
    BaseAPI.authorizationAPI(req, res, async () => {
      const { id } = req.params
      const payload = await Subject.findOne({ id })
      if (!payload) return res.json({ success: false, errMess: 'notExistsData' })
      const listTest = await TestServices.getListLocal(payload.listExamId)
      if (listTest === false) return res.json({ success: false, errMess: 'notExistsData' })
      payload.listExamId = listTest
      res.json({ success: true, data: payload })
    })
  }

  static async create (req, res) {
    BaseAPI.authorizationAPI(req, res, async (id) => {
      try {
        const findUser = await User.findOne({ id }, { role: 1 })
        if (!arrRole.includes(findUser.role)) return res.json({ success: false, errMess: 'notPermission' })
        const stateCreate = genUpdate(req.body, ['name', 'description', 'listExamId'])
        stateCreate.id = generateID()
        stateCreate.createdUser = id
        const payload = await Subject.create(stateCreate)
        if (!payload) return res.json({ success: false, errMess: errMess.someThingWentWrong })
        res.json({ success: true, data: payload })
      } catch (err) {
        res.json({ success: false, errMess: errMess.someThingWentWrong, message: err })
      }
    })
  }

  static async addUserToSubject (req, res) {
    try {
      const { listUserId, id } = req.body
      const payload = await Subject.findOne({ id })
      if (!payload) return res.json({ success: false, errMess: 'notExistsData' })
      const listFilterUser = listUserId.filter(item => !(payload.listUserExtend.includes(item)))
      payload.listUserExtend = payload.listUserExtend.concat(listFilterUser)
      payload.save()
      res.json({ success: true, data: payload })
    } catch (err) {
      res.json({ success: false, errMess: errMess.someThingWentWrong })
    }
  }

  static async update (req, res) {
    BaseAPI.authorizationAPI(req, res, async (createdUser) => {
      try {
        const findUser = await User.findOne({ id: createdUser }, { role: 1 })
        if (!arrRole.includes(findUser.role)) return res.json({ success: false, errMess: 'notPermission' })
        const { id } = req.body
        const updateField = genUpdate(req.body, ['name', 'description', 'listExamId'])
        const payload = await Subject.findOneAndUpdate({ id }, updateField, { new: true })
        if (!payload) return res.json({ success: false, errMess: 'notExistsData' })
        res.json({ success: true, data: payload })
      } catch (err) {
        res.json({ success: false, errMess: errMess.someThingWentWrong, message: err })
      }
    })
  }

  static async updateLocal (idSubject, idTest) {
    const findSubject = await Subject.findOne({ id: idSubject })
    if (!findSubject) return false
    findSubject.listExamId.push(idTest)
    findSubject.save()
    return true
  }

  static async delete (req, res) {
    BaseAPI.authorizationAPI(req, res, async (createdUser) => {
      try {
        const findUser = await User.findOne({ id: createdUser }, { role: 1 })
        if (!arrRole.includes(findUser.role)) return res.json({ success: false, errMess: 'notPermission' })
        const { id, isActive } = req.query
        const payload = await Subject.findOneAndUpdate({ id }, { isActive }, { new: true })
        if (!payload) return res.json({ success: false, errMess: 'notExistsData' })
        res.json({ success: true, data: payload })
      } catch (err) {
        res.json({ success: false, errMess: errMess.someThingWentWrong, message: err })
      }
    })
  }
}
