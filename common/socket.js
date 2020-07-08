import { optionsSocket } from './constants'
import PostServices from '../controller/post'

let io, socketPage
export default class SocketServices {
  static checkIsConnect (userId) {
    return socketPage.adapter.rooms[userId]
  }

  static async connectSocket (server) {
    io = require('socket.io').listen(server, optionsSocket)

    io.on('connection', (socket) => {
      socket.on('userConnect', async (userId) => {
        socketPage = socket
        socket.join(userId)
        socket.join('countNumber')
        var number = io.sockets.adapter.rooms.countNumber
        number = number ? number.length : 0
        console.log('New user connect number user: ' + number)
        SocketServices.emitSocket('onlineUser', number)
      })

      socket.on('disconnect', async () => {
        var number = io.sockets.adapter.rooms.countNumber
        number = number ? number.length : 0
        SocketServices.emitSocket('onlineUser', number)
      })
      socket.on('message', event => {
        const { type, data } = event
        switch (type) {
        case 'userStartReading':
          PostServices.updateLocal(data)
          break
        case 'userEndReading':
          PostServices.updateLocal(data)
        }
      })
    })
  }

  static async checkTokenUser (userId, token) {
    SocketServices.emitOneSocket('checkToken', userId, token)
  }

  static emitOneSocket (type, id, data) {
    io.to(id).emit('message', {
      type,
      data
    })
  }

  static emitSocket (type, data) {
    io.emit('message', {
      type,
      data
    })
  }
}
