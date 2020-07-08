import BaseAPI from '.'
import { Test, User } from '../model'
import { genUpdate, generateID, getLength, generateCodeTest } from '../common/function'
import { errMess } from '../common/constants'
import QuestionServices from '../controller/question'
import SubjectServices from '../controller/subject'

const arrRole = ['admin', 'lecture']
export default class UserServices {
  static async get (req, res) {
    BaseAPI.authorizationAPI(req, res, async (createdUser) => {
      const payload = await Test.find({ isActive: true })
      res.json({ success: true, data: payload })
    })
  }

  static async getById (req, res) {
    BaseAPI.authorizationAPI(req, res, async () => {
      const { id } = req.params
      const payload = await Test.findOne({ id })
      if (!payload) return res.json({ success: false, errMess: 'notExistsData' })
      const listQuestion = await QuestionServices.getListQuestionLocal(payload.listQuestionId)
      payload.listQuestionId = listQuestion
      res.json({ success: true, data: payload })
    })
  }

  static async getListCommingsoon (req, res) {
    BaseAPI.authorizationAPI(req, res, async () => {
      try {
        const now = Date.now()
        const payload = await Test.find({})
        const data = payload.filter(item => new Date(item.startDate) > now)
        const promiseAll = data.map(async (itm, idx) => {
          const newData = itm
          newData.subjectId = await SubjectServices.getByIdLocal(newData.subjectId)
          return newData
        })
        const finalData = await Promise.all(promiseAll)
        res.json({ success: true, data: finalData })
      } catch (err) {
        console.log('UserServices -> getListCommingsoon -> err', err)
        res.json({ success: false, errMess: errMess.someThingWentWrong })
      }
    })
  }

  static async getListLocal (listId) {
    const payload = await Test.find({ id: { $in: listId } })
    if (!(getLength(payload) > 0)) return false
    return payload
  }

  static async create (req, res) {
    BaseAPI.authorizationAPI(req, res, async (id) => {
      try {
        const findUser = await User.findOne({ id }, { role: 1 })
        if (!arrRole.includes(findUser.role)) return res.json({ success: false, errMess: 'notPermission' })
        const { subjectId } = req.body
        const stateCreate = genUpdate(req.body, ['name', 'listUserExtends', 'subjectId', 'listQuestionId', 'listStudentId', 'time', 'startDate', 'endDate'])
        stateCreate.id = generateID()
        stateCreate.code = generateCodeTest()
        const payload = await Test.create(stateCreate)
        if (!payload) return res.json({ success: false, errMess: errMess.someThingWentWrong })
        SubjectServices.updateLocal(subjectId, stateCreate.id)
        res.json({ success: true, data: payload })
      } catch (err) {
        res.json({ success: false, errMess: errMess.someThingWentWrong, message: err })
      }
    })
  }

  static async updateLocal (id, list) {
    console.log('UserServices -> updateLocal -> list', list)
    const payload = await Test.findOneAndUpdate({ id }, { listQuestionId: list }, { new: true })
    console.log('UserServices -> updateLocal -> payload', payload)
    if (!payload) return false
    return true
  }

  static async update (req, res) {
    BaseAPI.authorizationAPI(req, res, async (createdUser) => {
      try {
        const findUser = await User.findOne({ id: createdUser }, { role: 1 })
        if (!arrRole.includes(findUser.role)) return res.json({ success: false, errMess: 'notPermission' })
        const { id } = req.body
        const updateField = genUpdate(req.body, ['name', 'subjectId', 'listQuestionId', 'listUserExtends', 'listStudentId', 'time', 'startDate', 'endDate'])
        const payload = await Test.findOneAndUpdate({ id }, updateField, { new: true })
        if (!payload) return res.json({ success: false, errMess: 'notExistsData' })
        res.json({ success: true, data: payload })
      } catch (err) {
        res.json({ success: false, errMess: errMess.someThingWentWrong, message: err })
      }
    })
  }

  static async pushUserToTest (req, res) {
    try {
      const { listUserId, id } = req.body
      const payload = await Test.findOne({ id })
      if (!payload) return res.json({ success: false, errMess: 'notExistsData' })
      const listFilterUser = listUserId.filter(item => !(payload.listUserExtend.includes(item)))
      payload.listUserExtend = payload.listUserExtend.concat(listFilterUser)
      payload.save()
      res.json({ success: true, data: payload })
    } catch (err) {
      res.json({ success: false, errMess: errMess.someThingWentWrong })
    }
  }

  static async onSubmitTest (req, res) {
    BaseAPI.authorizationAPI(req, res, async (createdUser) => {
      try {
        const findUser = await User.findOne({ id: createdUser })
        const { id, answerUser, point } = req.body
        const findTest = await Test.findOne({ id })
        if (!findTest) return res.json({ success: false, errMess: 'notExistsData' })
        const findIndex = findTest.listStudentId.findIndex(item => item.user.id === findUser.id)
        if (findIndex !== -1) return res.json({ success: false, errMess: 'userExisted' })
        findTest.listStudentId.push({ user: findUser, answerUser, point })
        findTest.save()
        res.json({ success: true, data: findTest })
      } catch (err) {
        res.json({ success: false, errMess: errMess.someThingWentWrong })
      }
    })
  }

  static async delete (req, res) {
    BaseAPI.authorizationAPI(req, res, async (createdUser) => {
      try {
        const findUser = await User.findOne({ id: createdUser }, { role: 1 })
        if (!arrRole.includes(findUser.role)) return res.json({ success: false, errMess: 'notPermission' })
        const { id, isActive } = req.query
        const payload = await Test.findOneAndUpdate({ id }, { isActive }, { new: true })
        if (!payload) return res.json({ success: false, errMess: 'notExistsData' })
        res.json({ success: true, data: payload })
      } catch (err) {
        res.json({ success: false, errMess: errMess.someThingWentWrong, message: err })
      }
    })
  }
}
