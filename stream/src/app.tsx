import { useState } from 'preact/hooks'
import './app.css'

export function App() {
  const [response, setResponse] = useState('')
  const [sresponse, setSResponse] = useState('')
  const api = 'http://localhost:5079/slow'
  var data: SlowPokeRequest = {
    quantity: 3
  }

  async function send(): Promise<void> {

    setResponse('Posting with quantity ' + data.quantity)
    var respone = await fetch(api, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    var json = await respone.json()
    setResponse(JSON.stringify(json))
  }

  async function sendwithstream(): Promise<void> {
    const decoder = new TextDecoder();

    setSResponse('Posting with quantity ' + data.quantity)
    // Make the fetch request
    fetch(api, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(response => {
        // Check if the response is valid
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        // Stream the response data using a TextDecoder
        const reader = response.body!.getReader();

        // Function to read the streamed chunks
        function read():any {
          return reader.read().then(({ done, value }) => {
            // Check if the streaming is complete
            if (done) {
              setSResponse('Streaming complete')
              console.log('Streaming complete');
              return;
            }

            // Decode and process the streamed data
            const decodedData = decoder.decode(value, { stream: true });
            console.log(decodedData);
            setResponse('Streampart: ' + decodedData)

            // Continue reading the next chunk
            return read();
          });
        }

        // Start reading the chunks
        return read();
      })
      .catch(error => {
        // Handle errors
        console.log('Error:', error);
      });
  }

  return (
    <>
      <h1>Strömtest</h1>
      <div >
        <button onClick={() => send()}>Send Data</button>
        <p>{response}</p>
      </div>
      <div >
        <button onClick={() => sendwithstream()}>Send Data, Get stream</button>
        <p>{sresponse}</p>
      </div>
    </>
  )
}
