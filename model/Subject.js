import { defaultModel } from '../common/constants'

export default {
  id: defaultModel.stringUnique,
  name: defaultModel.string,
  description: defaultModel.string,
  createdUser: defaultModel.string,
  listExamId: defaultModel.array,
  isActive: defaultModel.boolean,
  listUserExtend: defaultModel.array
}
