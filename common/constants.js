export const optionsSocket = {
  /* socket.io options */
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity
}

export const REQUEST_TYPE = {
  POST: 'POST',
  GET: 'GET',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH'
}

export const sendGridId = {
  forgotPasswordTest: 'd-1cff9b4459a345c9811ee80c6ba9c9cb'
}

export const timeResendEmail = 60000

export const forgotType = {
  forgot: 'forgot',
  register: 'register'
}

export const reactionType = {
  follow: 'follow',
  like: 'like',
  bad: 'bad',
  good: 'good'
}

export const categoryType = {
  normal: 'normal'
}

export const deliveryType = {
  money: 'money',
  product: 'product'
}

export const userRole = {
  admin: 'admin',
  lecture: 'lecture',
  student: 'student'
}

export const errMess = {
  someThingWentWrong: 'someThingWentWrong'
}

export const defaultModel = {
  date: { type: Date },
  string: { type: String, default: '' },
  stringUnique: { type: String, required: true, unique: true },
  array: { type: Array, default: [] },
  number: { type: Number, default: 0 },
  boolean: { type: Boolean, default: true },
  booleanFalse: { type: Boolean, default: false },
  object: { type: Object, default: null }
}
