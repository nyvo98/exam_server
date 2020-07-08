import { defaultModel } from '../common/constants'

export default {
  id: defaultModel.stringUnique,
  name: defaultModel.string,
  subjectId: defaultModel.string,
  listQuestionId: defaultModel.array,
  isActive: defaultModel.boolean,
  listStudentId: defaultModel.array,
  listUserExtend: defaultModel.array,
  code: defaultModel.string,
  time: defaultModel.string,
  startDate: defaultModel.date,
  endDate: defaultModel.date,
  createdUser: defaultModel.string
}
