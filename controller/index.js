import { verifyToken, decodeToken, lowerCase } from '../common/function'
import { errMess, userRole } from '../common/constants'
export default class BaseAPI {
  static verifyResult (output, init = []) {
    if (!output) {
      return init
    } else {
      return output
    }
  }

  static checkRoleAdminUser (user) {
    return user ? user.role === userRole.admin : false
  }

  static async authorizationAPI (req, res, runAction, isCheckSignature) {
    try {
      const tokenAuthen = req.get('Authorization').replace('Bearer ', '')
      if (!verifyToken(tokenAuthen)) return res.json({ success: false, errMess: 'authenFail' })
      const user = lowerCase(decodeToken(tokenAuthen))
      runAction(user)
    } catch (err) {
      res.json({ success: false, errMess: errMess.someThingWentWrong, message: err })
    }
  }
}
