import ipc from 'node-ipc'

const isSocketTaken = (name: string) => {
  return new Promise((resolve, _reject) => {
    ipc.connectTo(name, () => {
      ipc.of[name].on('error', () => {
        ipc.disconnect(name)
        resolve(false)
      })

      ipc.of[name].on('connect', () => {
        ipc.disconnect(name)
        resolve(true)
      })
    })
  })
}

const findOpenSocket = async () => {
  let currentSocket = 1
  console.log('checking', currentSocket)
  while (await isSocketTaken('myapp' + currentSocket)) {
    currentSocket++
    console.log('checking', currentSocket)
  }
  console.log('found socket', currentSocket)
  return 'myapp' + currentSocket
}

export default findOpenSocket
