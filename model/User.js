import { defaultModel, userRole } from '../common/constants'

export default {
  id: defaultModel.stringUnique,

  name: defaultModel.string,
  password: defaultModel.string,

  email: defaultModel.string,
  phone: defaultModel.string,
  code: defaultModel.string,
  image: defaultModel.string,
  locale: { type: String, default: 'en' },
  isVerify: { type: Boolean, default: false },
  role: { type: String, default: userRole.student },
  isActive: defaultModel.boolean
}
