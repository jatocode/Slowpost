import { useState } from 'preact/hooks'
import './app.css'

export function App() {
  const [response, setResponse] = useState('')
  const api = 'http://localhost:5079/slow'

  async function send(): Promise<void> {
    var data:SlowPokeRequest = { 
      quantity: 10
    }
    setResponse('Posting with quantity ' + data.quantity)
    var respone = await fetch(api, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    })

    var json = await respone.json()
    setResponse(JSON.stringify(json))
  }

  return (
    <>
      <h1>Strömtest</h1>
      <div >
        <button onClick={() => send()}>Send Data</button>
        <p>{response}</p>
      </div>
    </>
  )
}
