import { BrowserWindow, app, ipcMain, IpcMessageEvent } from 'electron'
import { fork, ChildProcess } from 'child_process'
import isDev from 'electron-is-dev'
import { join } from 'path'
import findOpenSocket from './internal/findOpenSocket'

let clientWin: BrowserWindow
let serverProcess: ChildProcess | undefined

function createWindow(socketName: string) {
  // // electron-react-ts-starter code
  // clientWin = new BrowserWindow({
  //   width: 900,
  //   height: 680,
  //   webPreferences: {
  //     nodeIntegration: true,
  //   },
  // })
  // clientWin.loadURL(
  //   isDev ? 'http://localhost:3000' : `file://${join(__dirname, '../build/index.html')}`
  // )
  // clientWin.on('closed', () => clientWin.destroy())

  // ipcMain.on('channel', (event: IpcMessageEvent, msg: any) => {
  //   console.log(msg)
  //   clientWin.webContents.send('response', { title: 'mymessage', data: 1 })
  // })

  // electron-with-server-example code
  clientWin = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      preload: __dirname + '/client-preload.js',
    },
  })

  // this should probably do what the code above does and load the react app
  // we'll need to have the react app run the electron client stuff
  // referenced in the electron-server example's client-index.html
  clientWin.loadFile('client-index.html')

  clientWin.webContents.on('did-finish-load', () => {
    clientWin.webContents.send('set-socket', {
      name: socketName,
    })
  })
}

function createBackgroundWindow(socketName: string) {
  const win = new BrowserWindow({
    x: 500,
    y: 300,
    width: 700,
    height: 500,
    show: true,
    webPreferences: {
      nodeIntegration: true,
    },
  })
  win.loadURL(`file://${__dirname}/server-dev.html`)

  win.webContents.on('did-finish-load', () => {
    win.webContents.send('set-socket', { name: socketName })
  })
}

function createBackgroundProcess(socketName: string) {
  serverProcess = fork(__dirname + '/server.js', ['--subprocess', app.getVersion(), socketName])

  serverProcess.on('message', msg => {
    console.log(msg)
  })
}

app.on('ready', async () => {
  let socketName = await findOpenSocket()

  createWindow(socketName)

  if (isDev) {
    createBackgroundWindow(socketName)
  } else {
    createBackgroundProcess(socketName)
  }
})

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill()
    serverProcess = undefined
  }
})

app.on('ready', createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// from electron-react-ts-starter, not sure it's necessary
// app.on('activate', () => {
//   if (!clientWin) {
//     createWindow()
//   }
// })
