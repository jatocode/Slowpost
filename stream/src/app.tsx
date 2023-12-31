import { useState } from 'preact/hooks'
import './app.css'

export function App() {
  const [response, setResponse] = useState('')
  const [quantity, setQuantity] = useState(10)
  const [error, setError] = useState('')

  function generateSlowPokeRequests(quantity: number): SlowPokeRequest[] {
    const requests: SlowPokeRequest[] = [];
    for (let i = 0; i < quantity; i++) {
      requests.push({
        message: `Dummydata ${i + 1}, ${Math.random() * 100}`,
      });
    }
    return requests;
  }

  async function sendwithstream(api: string, partialCallback: Function, completeCallback:Function): Promise<void> {
    const decoder = new TextDecoder();

    const data = generateSlowPokeRequests(quantity)
    setResponse('Posting with quantity ' + data.length)
    setError('') // Clear any previous errors
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
        function read(): any {
          return reader.read().then(({ done, value }) => {
            // Check if the streaming is complete
            if (done) {
              completeCallback('done: ')
              return;
            }

            // Decode and process the streamed data
            const decodedData = decoder.decode(value, { stream: true });
            partialCallback(decodedData)

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
        setError(error.message) // Set the error message state variable
      });
  }

  function part(data: string) {
    setResponse('Streampart: ' + data)
  }

  function done(data: string) {
    setResponse('Streamdone: ' + data)
  }

  return (
    <>
      <h1>Strömtest</h1>
      <div>
        <label htmlFor="quantity">Quantity:</label>
        <input type="number" id="quantity" name="quantity" value={quantity}
          onChange={(e: any) => setQuantity(parseInt(e.target.value))} />
      </div>
      <div>
        <button onClick={() => sendwithstream('http://localhost:5079/slow', part, done)}>Send Data, Get stream</button>
        <p>{response}</p>
        {error && <label style={{ color: 'red' }}>{error}</label>} 
      </div>
    </>
  )
}



