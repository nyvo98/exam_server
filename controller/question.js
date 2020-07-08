import BaseAPI from '.'
import { Question, User } from '../model'
import { genUpdate, generateID, getLength } from '../common/function'
import { errMess } from '../common/constants'
import TestServices from '../controller/test'
const fs = require('fs')
const formidable = require('formidable')
const arrRole = ['admin', 'lecture']
export default class UserServices {
  static async get (req, res) {
    BaseAPI.authorizationAPI(req, res, async (createdUser) => {
      const findUser = await User.findOne({ createdUser }, { role: 1 })
      if (!arrRole.includes(findUser.role)) return res.json({ success: false, errMess: 'notPermission' })
      const payload = await Question.find({ createdUser })
      res.json({ success: true, data: payload })
    })
  }

  static async getById (req, res) {
    BaseAPI.authorizationAPI(req, res, async (createdUser) => {
      const { id } = req.params
      const payload = await Question.findOne({ id })
      if (!payload) return res.json({ success: false, errMess: 'notExistsData' })
      res.json({ success: true, data: payload })
    })
  }

  static async getListQuestionLocal (listId) {
    const payload = await Question.find({ id: { $in: listId } })
    if (!(getLength(payload) > 0)) return false
    return payload
  }

  static async create (req, res) {
    BaseAPI.authorizationAPI(req, res, async (createdUser) => {
      try {
        const findUser = await User.findOne({ id: createdUser }, { role: 1 })
        if (!arrRole.includes(findUser.role)) return res.json({ success: false, errMess: 'notPermission' })
        const { data, testId } = req.body
        const listTestId = []
        const promiseAll = data.map(async (item, index) => {
          item.id = generateID()
          listTestId.push(item.id)
          item.createdUser = createdUser
          return item
        })
        const finalData = await Promise.all(promiseAll)
        if (!(getLength(finalData) > 0)) return res.json({ success: false, errMess: errMess.someThingWentWrong })
        const payload = await Question.insertMany(finalData)
        if (!(getLength(finalData) > 0)) return res.json({ success: false, errMess: errMess.someThingWentWrong })
        TestServices.updateLocal(testId, listTestId)
        res.json({ success: true, data: payload })
      } catch (err) {
        res.json({ success: false, errMess: errMess.someThingWentWrong, message: err })
      }
    })
  }

  static async uploadFile (req, res) {
    BaseAPI.authorizationAPI(req, res, async (createdUser) => {
      try {
        const form = new formidable.IncomingForm()
        form.parse(req, (err, fields, files) => {
          if (err) throw err
          const tmpPath = files.file.path
          const fileName = files.file.name
          const id = fileName.split('.')[0]
          fs.readFile(tmpPath, async (err, text) => {
            if (!err) {
              const newData = JSON.parse(text.toString('utf8'))
              const listTestId = []
              const promiseAll = newData && newData.map(async (item, index) => {
                item.id = generateID()
                listTestId.push(item.id)
                item.createdUser = createdUser
                return item
              })
              const finalData = await Promise.all(promiseAll)
              if (!(getLength(finalData) > 0)) return res.json({ success: false, errMess: errMess.someThingWentWrong })
              const payload = await Question.insertMany(finalData)
              if (!(getLength(finalData) > 0)) return res.json({ success: false, errMess: errMess.someThingWentWrong })
              TestServices.updateLocal(id, listTestId)
              res.json({ success: true, data: payload })
            }
          })
        })
        return
      } catch (err) {
        res.json({ success: false, errMess: errMess.someThingWentWrong })
      }
    })
  }

  static async update (req, res) {
    BaseAPI.authorizationAPI(req, res, async (createdUser) => {
      try {
        const findUser = await User.findOne({ id: createdUser }, { role: 1 })
        if (!arrRole.includes(findUser.role)) return res.json({ success: false, errMess: 'notPermission' })
        const { id } = req.body
        const updateField = genUpdate(req.body, ['name', 'image', 'type', 'answerList', 'correctAnswer'])
        const payload = await Question.findOneAndUpdate({ id }, updateField, { new: true })
        if (!payload) return res.json({ success: false, errMess: 'notExistsData' })
        res.json({ success: true, data: payload })
      } catch (err) {
        res.json({ success: false, errMess: errMess.someThingWentWrong, message: err })
      }
    })
  }

  static async delete (req, res) {
    BaseAPI.authorizationAPI(req, res, async (createdUser) => {
      try {
        const findUser = await User.findOne({ id: createdUser }, { role: 1 })
        if (!arrRole.includes(findUser.role)) return res.json({ success: false, errMess: 'notPermission' })
        const { id, isActive } = req.query
        const payload = await Question.findByIdAndUpdate({ id }, { isActive }, { new: true })
        if (!payload) return res.json({ success: false, errMess: 'notExistsData' })
        res.json({ success: true, data: payload })
      } catch (err) {
        res.json({ success: false, errMess: errMess.someThingWentWrong, message: err })
      }
    })
  }
}
