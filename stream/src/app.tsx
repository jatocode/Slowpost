import { useState } from 'preact/hooks'
import './app.css'

export function App() {
  const [response, setResponse] = useState('')
  const [quantity, setQuantity] = useState(10)
  const [error, setError] = useState('')

  const [selectedFile, setSelectedFile] = useState(null as any);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);

  function generateSlowPokeRequests(quantity: number): SlowPokeRequest[] {
    const requests: SlowPokeRequest[] = [];
    for (let i = 0; i < quantity; i++) {
      requests.push({
        message: `Dummydata ${i + 1}, ${Math.random() * 100}`,
      });
    }
    return requests;
  }

  async function streamit(api: string): Promise<void> {
    function wait(milliseconds: number) {
      return new Promise(resolve => setTimeout(resolve, milliseconds));
    }
    
    const stream = new ReadableStream({
      async start(controller) {
        await wait(1000);
        controller.enqueue('This ');
        await wait(1000);
        controller.enqueue('is ');
        await wait(1000);
        controller.enqueue('a ');
        await wait(1000);
        controller.enqueue('slow ');
        await wait(1000);
        controller.enqueue('request.');
        controller.close();
      },
    }).pipeThrough(new TextEncoderStream());
    
    fetch(api, {
      mode:  'cors',
      method: 'POST',
      headers: {'Content-Type': 'text/plain'},
      body: stream,
      duplex: 'half',
      
    } as any);
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
      body: JSON.stringify(data),
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
  const handleFileChange = (event:any) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleFileUpload = () => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    const chunkSize = 5 * 1024 * 1024; // 5MB (adjust based on your requirements)
    const totalChunks = Math.ceil(selectedFile.size / chunkSize);
    const chunkProgress = 100 / totalChunks;
    let chunkNumber = 0;
    let start = 0;
    let end = 0;

    const uploadNextChunk = async () => {
      if (end <= selectedFile.size) {
        const chunk = selectedFile.slice(start, end);
        const formData = new FormData();
        formData.append("file", chunk);
        formData.append("chunkNumber", chunkNumber.toString());
        formData.append("totalChunks", totalChunks.toString());
        formData.append("originalname", selectedFile.name);

        fetch('http://localhost:5079/upload', {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            console.log({ data });
            const temp = `Chunk ${
              chunkNumber + 1
            }/${totalChunks} uploaded successfully`;
            setStatus(temp);
            setProgress(Number((chunkNumber + 1) * chunkProgress));
            console.log(temp);
            chunkNumber++;
            start = end;
            end = start + chunkSize;
            uploadNextChunk();
          })
          .catch((error) => {
            console.error("Error uploading chunk:", error);
          });
      } else {
        setProgress(100);
        setSelectedFile(null);
        setStatus("File upload completed");
      }
    };

    uploadNextChunk();
  };

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
      <div>
        <button onClick={() => streamit('https://localhost:7015/stream')}>Send stream</button>
      </div>
      <div>
      <h2>Resumable File Upload</h2>
      <h3>{status}</h3>
      {progress > 0 && {progress}}
        <div>
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleFileUpload}>Upload File</button>
        </div>
      </div>
    </>
  )
}



