import mongoose from 'mongoose'
import UserSchema from './User'
import SubjectSchema from './Subject'
import TestSchema from './Test'
import QuestionSchema from './Question'

const Schema = mongoose.Schema

const createSchema = (schema) => {
  const model = new Schema(schema, { timestamps: true })
  return model
}

const User = mongoose.model('User', createSchema(UserSchema))
const Subject = mongoose.model('Subject', createSchema(SubjectSchema))
const Test = mongoose.model('Test', createSchema(TestSchema))
const Question = mongoose.model('Question', createSchema(QuestionSchema))

export {
  User,
  Subject,
  Test,
  Question

}
