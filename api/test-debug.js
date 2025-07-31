export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const testHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Debug Availability Test</title>
    </head>
    <body>
        <h1>Debug Availability Test</h1>
        <button onclick="testAvailability()">Test July 31st 10:00 AM</button>
        <div id="result" style="white-space: pre-wrap; font-family: monospace; margin-top: 20px;"></div>
        
        <script>
        async function testAvailability() {
            const resultDiv = document.getElementById('result');
            resultDiv.textContent = 'Testing...';
            
            try {
                const response = await fetch('/api/debug-availability', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        date: '2025-07-31',
                        startTime: '10:00', 
                        duration: 2
                    }),
                });
                
                const result = await response.json();
                resultDiv.textContent = JSON.stringify(result, null, 2);
            } catch (error) {
                resultDiv.textContent = 'Error: ' + error.message;
            }
        }
        </script>
    </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.send(testHTML);
}