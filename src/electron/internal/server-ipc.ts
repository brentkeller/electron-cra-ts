import ipc from 'node-ipc'

// TODO: Figure out types for anything that's `any`
export const init = (socketName: string, handlers: any) => {
  ipc.config.id = socketName
  ipc.config.silent = true

  ipc.serve(() => {
    ipc.server.on('message', (data, socket) => {
      let msg = JSON.parse(data)
      let { id, name, args } = msg

      if (handlers[name]) {
        handlers[name](args).then(
          (result: any) => {
            ipc.server.emit(socket, 'message', JSON.stringify({ type: 'reply', id, result }))
          },
          (error: any) => {
            // Up to you how to handle errors, if you want to forward
            // them, etc
            ipc.server.emit(socket, 'message', JSON.stringify({ type: 'error', id }))
            throw error
          }
        )
      } else {
        console.warn('Unknown method: ' + name)
        ipc.server.emit(socket, 'message', JSON.stringify({ type: 'reply', id, result: null }))
      }
    })
  })

  ipc.server.start()
}

export const send = (name: string, args: any) => {
  ipc.server.emit('message', JSON.stringify({ type: 'push', name, args }))
}
