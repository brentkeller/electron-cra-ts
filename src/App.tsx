import React from 'react'
import logo from './logo.svg'
import './App.css'
import { IpcRenderer, IpcMessageEvent } from 'electron'
// I had to ignore this line due to an error "'require' does not exist on 'Window'" but that works fine in the starter app this came from.
// @ts-ignore
const electron = window.require('electron') // require electron like this in all the files. Don't Use import from 'electron' syntax for importing IpcRender from electron.

let ipcRenderer: IpcRenderer = electron.ipcRenderer

ipcRenderer.on('response', (event: IpcMessageEvent, args: any) => {
  console.log(args)
})

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <button
          onClick={e =>
            ipcRenderer.send('channel', { title: 'hey-ya', content: 'hello this is my message' })
          }
        >
          Click me, now!!!
        </button>
      </header>
    </div>
  )
}

export default App
