import { defaultModel } from '../common/constants'

export default {
  id: defaultModel.stringUnique,
  name: defaultModel.string,
  image: defaultModel.array,
  type: defaultModel.number,
  answerList: defaultModel.array,
  correctAnswer: defaultModel.array,
  isActive: defaultModel.boolean
}
