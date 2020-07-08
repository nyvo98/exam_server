import OneSignal from 'onesignal-node'
import { getLength } from '../common/function'
import i18n from 'i18n'
import NotificationServices from '../controller/notification'
import UserServices from '../controller/user'

// create a new client for a single app
const oneSignalClient = new OneSignal.Client({
  userAuthKey: 'Y2E5ZDdkNDctNjE0ZC00OThjLWExNWUtZGUwOGZmMGRiY2Zm',
  app: {
    appAuthKey: 'OTdmZTJhMjgtNDRmYy00ZTkzLTgwYmMtMmUyODM3OWZiYWJj',
    appId: 'd06eca00-2b81-42b8-93cc-56eba79f1d40'
  }
})

export const generateLanguage = (phrase, locale = 'en', replace) => {
  const langGenerate = (i18n.__({ phrase, locale: locale === 'en' ? 'en' : 'vi' }, replace)).replace('&#x2F;', '/')
  return langGenerate === phrase ? generateLanguage(phrase, locale, replace) : langGenerate
}

const sendMessageFilter = (arrMess, locale) => {
  let message

  const data = arrMess[1]

  switch (arrMess[0]) {
  case -1:
    message = data[0]
    break
  case 1:
    message = generateLanguage('newProduct', locale, { name: data[0] })
    break
  case 2:
    message = generateLanguage('youWin', locale, { name: data[0], price: data[1], maxPrice: data[2] })
    break
  case 3:
    message = generateLanguage('updateBalance', locale, { add: data[0], balance: data[1] })
    break
  case 4:
    message = generateLanguage('newRef', locale, { name: data[0] })
    break
  case 5:
    message = generateLanguage('levelUp', locale, { level: data[0] })
    break
  case 6:
    message = generateLanguage('upgradeLevel', locale)
    break
  case 7:
    message = generateLanguage('userWithdraw', locale, { name: data[0], point: data[1] })
    break
  }

  return message
}

export const sendNotiToUser = async (message, data, type, userId, isEnVi, image, header) => {
  const userDevice = await UserServices.getDeviceIDByID(userId)
  if (userDevice) {
    const localeUser = userDevice.locale === 'en' ? 'en' : 'vi'
    sendNotifications({ message: [type, isEnVi ? [message[localeUser]] : message], locale: localeUser }, userDevice.deviceId, data, userDevice.id, header, image)
  }
}

export const sendNotiList = async (list, locale, message, data, image) => {
  const listUserSend = await UserServices.getDeviceByList(list, locale)
  if (getLength(listUserSend) > 0) {
    sendNotifications({ message: [-1, message], locale }, listUserSend.map(itm => itm.deviceId), data, listUserSend.map(itm => itm.id), '', image)
  }
}

export const sendNotiToAllUser = async (message, data, type, image, header, role, isEnVi = true) => {
  let allUserEN = []
  let allUserVI = []

  if (!isEnVi || getLength(message.en) > 0) {
    allUserEN = await UserServices.getAllDeviceID('en')
  }
  if (!isEnVi || getLength(message.vi) > 0) {
    allUserVI = await UserServices.getAllDeviceID('vi')
  }
  if (getLength(allUserEN) > 0) {
    sendNotifications({ message: [type, isEnVi ? [message.en] : message], locale: 'en' }, allUserEN.map(itm => itm.deviceId), data, allUserEN.map(itm => itm.id), header ? header.en : '', image)
  }
  if (getLength(allUserVI) > 0) {
    sendNotifications({ message: [type, isEnVi ? [message.vi] : message], locale: 'vi' }, allUserVI.map(itm => itm.deviceId), data, allUserVI.map(itm => itm.id), header ? header.vi : '', image)
  }
}

/*
 Data message must contain
 {
  message, locale
 }
*/
export const sendNotifications = (dataMess, regTokens, data, userId, headings, image, soundName = 'notisound', isSilent = false) => {
  if (getLength(regTokens) > 0) {
    const dataNotification = {
      contents: {
        en: sendMessageFilter(dataMess.message, dataMess.locale)
      },
      include_player_ids: typeof (regTokens) === 'string' ? [regTokens] : regTokens
    }

    if (headings) {
      dataNotification.headings = { en: headings }
    }
    // Add image to body
    if (image) {
      dataNotification.large_icon = image
      dataNotification.big_picture = image
    }
    const notification = new OneSignal.Notification(dataNotification)

    // Send data to client
    if (data) {
      notification.postBody.data = data
    }
    // Add icon app
    notification.postBody.small_icon = 'ic_launcher'

    // Add sound notification
    if (!isSilent) {
      notification.postBody.ios_sound = soundName + '.mp3'
      notification.postBody.android_sound = soundName
    }
    oneSignalClient.sendNotification(notification, function (err) {
      if (!err && getLength(userId) > 0) {
        const listUserID = typeof (userId) === 'string' ? [userId] : userId
        NotificationServices.createLocal({ type: dataMess.message[0], bonusValue: dataMess.message[1], image, listUserID })
        console.log('Notification send OK')
      }
    })
  }
}
