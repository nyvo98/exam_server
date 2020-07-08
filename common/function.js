import jwt from 'jsonwebtoken'
import fetch from 'node-fetch'
import moment from 'moment'
import converter from 'hex2dec'
import bigdecimal from 'bigdecimal'
import crypto from 'crypto-js'
import rp from 'request-promise'
import { sendGridId, kudoType } from './constants'
import { isNull, isUndefined } from 'util'
import numeral from 'numbro'
import i18n from 'i18n'

export const formatFormacyNum = (number) => {
  return Math.round((number) * 10) / 10
}

export const calculatePercentIncrease = (compareNum, calculateNum) => {
  const numExchange = (((compareNum - calculateNum) / (calculateNum)) * 100)
  return formatNumberBro(numExchange, 2)
}
export const sendEmail = (to, data, type) => {
  console.log(to, data, type)
  return new Promise(async (resolve) => {
    const options = {
      method: 'POST',
      url: 'https://api.sendgrid.com/v3/mail/send',
      headers:
      {
        'content-type': 'application/json',
        authorization: 'Bearer ' + process.env.SENDGRID_API_KEY
      },
      body:
      {
        personalizations:
          [{
            to: [{ email: to }],
            dynamic_template_data: data
          }],
        from: { email: 'class@gmail.com' },
        template_id: sendGridId[type]
      },
      json: true
    }
    rp(options, async (error, response) => {
      const resJson = await response.toJSON()
      if (resJson.statusCode === 400) {
        console.log(error)
      } else if ([202, 200].includes(resJson.statusCode)) {
        resolve(true)
      }
    }).catch(() => {
    })
  })
}

export const postSendEmailAll = (arrTo, data, type) => {
  return new Promise(async (resolve) => {
    const options = {
      method: 'POST',
      url: 'https://api.sendgrid.com/v3/mail/send',
      headers:
      {
        'content-type': 'application/json',
        authorization: 'Bearer ' + process.env.SENDGRID_API_KEY
      },
      body:
      {
        personalizations:
          [{
            to: arrTo,
            dynamic_template_data: data
          }],
        from: { email: 'ibidtowin.com@gmail.com' },
        template_id: sendGridId[type]
      },
      json: true
    }
    rp(options, async (error, response) => {
      const resJson = await response.toJSON()
      if (resJson.statusCode === 400) {
        console.log(error)
      } else if ([202, 200].includes(resJson.statusCode)) {
        resolve(true)
      }
    }).catch(() => {
    })
  })
}

export const calculateDiffDate = (date1, date2, type) => {
  console.log(date2)
  const dateNow = moment(date1)
  console.log('DATE NOW -----------: ', dateNow)
  const dateTxs = moment(date2)
  console.log('START DATE ---------: ', dateTxs)
  const payload = dateNow.diff(dateTxs, type)
  return payload
}

export const generateToken = (userSign) => {
  return jwt.sign({ id: userSign }, process.env.SECRET_TOKEN, { expiresIn: '3650d' })
}

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.SECRET_TOKEN, (err) => !err)
}

export const validateEmail = email => {
  // eslint-disable-next-line no-useless-escape
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return !re.test(String(email).toLowerCase())
}

export const validatePw = pw => {
  var re = /^.*[0-9].*$/
  return re.test(pw)
}
export const decodeToken = (token) => {
  const decodeString = jwt.decode(token)
  return decodeString ? decodeString.id : null
}

export const convertDateMoment = (date, type) => {
  const dateFormat = new Date(date)
  const strTime = moment(dateFormat).format(type)
  return strTime
}

export const convertPasswordHMAC256Old = (password) => {
  var hashPassword = crypto.HmacSHA256(password, 'coin98_token')
  var hexhash = crypto.enc.Hex.stringify(hashPassword)
  return hexhash
}

export const convertPasswordHMAC256 = (password) => {
  var hashPassword = crypto.HmacSHA256(password, process.env.SECRET_TOKEN)
  var hexhash = crypto.enc.Hex.stringify(hashPassword)
  return hexhash
}

export const convertPasswordHMAC256Security = (password) => {
  var hashPassword = crypto.HmacSHA256(password, '0xaeb0325a6789f597b4f7c2c4dcb36b1ba4232384ffaf7b24670b71dafc564cec')
  var hexhash = crypto.enc.Hex.stringify(hashPassword)
  return hexhash
}

export const getLength = (value) => {
  return value ? value.length : 0
}

export const checkNameUserName = (value, subValue) => {
  return getLength(value) > 0 ? value : subValue
}

export const onlyUnique = (value, index, self) => {
  return self.indexOf(value) === index
}

export const lowerCase = (value) => {
  return value ? value.toLowerCase() : value
}

export const upperCase = (value) => {
  return value ? value.toUpperCase() : value
}

export const genUpdate = (data, arrValue) => {
  const genObject = {}
  arrValue.map(itm => {
    if (data[itm] !== undefined && data[itm] !== null) {
      genObject[itm] = data[itm]
    }
  })
  return genObject
}

export const generateOTPCode = () => {
  let text = ''
  const possible = '0123456789'
  for (let i = 0; i < 4; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

export const generateKudoName = (typeKudo) => {
  let subName = 'post'

  switch (typeKudo) {
  case kudoType.video:
    subName = 'video'
    break
  case kudoType.article:
    subName = 'article'
    break
  case kudoType.report:
    subName = 'report'
    break
  case kudoType.token:
    subName = 'token statistic'
    break
  }
  return subName
}

export const filterLink = (text) => {
  if (text && text.length > 0) {
    const regex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/ig
    regex.lastIndex = 0
    const matches = []
    let regexResult
    while ((regexResult = regex.exec(text)) !== null) {
      matches.push(regexResult[0])
    }
    return matches
  }
}

export const convertHexToDecimal = (hexNum) => {
  return converter.hexToDec(hexNum)
}

export const generateEmail = () => {
  let text = ''
  const possible = 'abcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 7; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text + '@gmail.com'
}

export const generateRefID = () => {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  for (let i = 0; i < 7; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return 'IBID' + text
}

export const generateDateFromTo = (isSameDay, item) => {
  return isSameDay
    ? convertDateMoment(item.dateStart, 'HH:mm') + ' - ' + convertDateMoment(item.dateEnd, 'HH:mm') + ' ' + convertDateMoment(item.dateStart, 'DD/MM/YYYY')
    : convertDateMoment(item.dateStart, 'HH:mm DD/MM/YYYY') + ' - ' + convertDateMoment(item.dateEnd, 'HH:mm DD/MM/YYYY')
}

export const generateID = () => {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 16; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

export const generateCodeTest = () => {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

export const generatePassword = () => {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

export const fetchAPI = async (apiurl, headers) => {
  try {
    const response = await fetch(apiurl, headers)
    const responJson = await response.json()
    return responJson
  } catch (error) {
    return false
  }
}

export const logDebug = (message) => {
  if (process.env.IS_DEV === 'true') {
    console.log(message)
  }
}

export const convertBalanceToWei = (strValue, iDecimal = 18) => {
  var multiplyNum = new bigdecimal.BigDecimal(Math.pow(10, iDecimal))
  var convertValue = new bigdecimal.BigDecimal(String(strValue))
  return multiplyNum.multiply(convertValue).toString().split('.')[0]
}

export const scientificToDecimal = (num) => {
  const sign = Math.sign(num)
  // if the number is in scientific notation remove it
  if (/\d+\.?\d*e[\+\-]*\d+/i.test(num)) {
    const zero = '0'
    const parts = String(num).toLowerCase().split('e') // split into coeff and exponent
    const e = parts.pop() // store the exponential part
    let l = Math.abs(e) // get the number of zeros
    const direction = e / l // use to determine the zeroes on the left or right
    const coeffArray = parts[0].split('.')

    if (direction === -1) {
      coeffArray[0] = Math.abs(coeffArray[0])
      num = zero + '.' + new Array(l).join(zero) + coeffArray.join('')
    } else {
      const dec = coeffArray[1]
      if (dec) l = l - dec.length
      num = coeffArray.join('') + new Array(l + 1).join(zero)
    }
  }

  if (sign < 0) {
    num = -num
  }

  return num
}

export const convertWeiToBalance = (strValue, iDecimal = 18) => {
  var multiplyNum = new bigdecimal.BigDecimal(Math.pow(10, iDecimal))
  var convertValue = new bigdecimal.BigDecimal(String(strValue))
  return convertValue.divide(multiplyNum).toString()
}

export const generateDataToken = (amount = 0, address) => {
  const transferOpCode = '0xa9059cbb'
  const ABIValueToTransfer = zeroPadLeft(converter.decToHex(amount.toString().split('.')[0]).replace('0x', ''), 64)

  if (address) {
    const ethNakedAddress = address.toLowerCase().replace('0x', '')
    const ABIAddressTarget = zeroPadLeft(ethNakedAddress)
    return transferOpCode + ABIAddressTarget + ABIValueToTransfer
  } else {
    return transferOpCode + ABIValueToTransfer
  }
}

export const genAddressActive = (data) => {
  return getLength(data) > 0 ? data.find(itm => itm.isActive).address : ''
}

const zeroPadLeft = (text, length = 64) => {
  while (text.length < length) {
    text = '0' + text
  }
  return text
}

export const concatStringAdd = (array) => {
  let nameSignal = ''
  array.map((item, index) => {
    nameSignal += item
    if (index !== (array.length - 1)) {
      nameSignal += ', '
    }
  })
  return nameSignal
}

export const formatNumberBro = (number, mantissa = 4, isReturnNaN) => {
  if (number !== 'null' && !isNull(number) && !isNaN(number) && !isUndefined(number) && number !== 'NaN') {
    if (number.toString().length > 0) {
      return numeral(number.toString().replace(/\,/g, '')).format({ trimMantissa: true, thousandSeparated: true, mantissa })
    }
  }
  return isReturnNaN ? 'NaN' : 0
}

export const generateLanguage = (phrase, locale = 'en', replace) => {
  const langGenerate = (i18n.__({ phrase, locale: locale === 'en' ? 'en' : 'vi' }, replace)).replace('&#x2F;', '/')
  return langGenerate === phrase ? generateLanguage(phrase, locale, replace) : langGenerate
}
