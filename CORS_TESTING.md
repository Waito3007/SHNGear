# CORS Test Instructions

## Manual Testing Steps

### 1. Start the Application
```bash
dotnet run
```

### 2. Open Browser Console
- Navigate to https://localhost:44479
- Open Developer Tools (F12)
- Go to Console tab

### 3. Test API Endpoints
Run these commands in the browser console:

```javascript
// Test 1: Simple CORS test endpoint
fetch('https://localhost:7107/api/corstest/test', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log('CORS Test:', data))
.catch(error => console.error('Error:', error));

// Test 2: Chat admin sessions endpoint
fetch('https://localhost:7107/api/chat/admin/sessions', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE',
    'Content-Type': 'application/json'
  }
})
.then(response => console.log('Chat admin sessions:', response.status))
.catch(error => console.error('Error:', error));

// Test 3: OPTIONS preflight request
fetch('https://localhost:7107/api/corstest/test', {
  method: 'OPTIONS',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => console.log('OPTIONS:', response.status))
.catch(error => console.error('Error:', error));

// Test 4: POST request with CORS
fetch('https://localhost:7107/api/corstest/test', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ test: 'data' })
})
.then(response => response.json())
.then(data => console.log('CORS POST Test:', data))
.catch(error => console.error('Error:', error));

// Test 5: SignalR Hub Connection Test
const connection = new signalR.HubConnectionBuilder()
  .withUrl('https://localhost:7107/chatHub?access_token=YOUR_TOKEN_HERE')
  .build();

connection.start()
  .then(() => console.log('SignalR connected successfully'))
  .catch(err => console.error('SignalR connection failed:', err));
```

### 4. Check Network Tab
- Go to Network tab in Developer Tools
- Look for the requests
- Check response headers for CORS headers:
  - `Access-Control-Allow-Origin`
  - `Access-Control-Allow-Credentials`
  - `Access-Control-Allow-Headers`
  - `Access-Control-Allow-Methods`

### 5. Expected Results
- All requests should return 200 or appropriate status codes
- No CORS errors in console
- Response headers should include proper CORS headers

## Troubleshooting

### Recent Fixes:
1. **Fixed Status Code 204 Error**: Changed OPTIONS response from 204 to 200 to avoid "Writing to response body is invalid" error
2. **Fixed Authorization Header Issue**: Replaced wildcard (*) headers with explicit list when using credentials
3. **Unified CORS Middleware**: Single middleware handles all CORS scenarios instead of multiple overlapping middlewares
4. **Comprehensive Headers**: All SignalR headers including `x-signalr-user-agent`, `authorization` are now supported

### If CORS errors persist:
1. Check console for detailed error messages
2. Verify middleware order in Program.cs
3. Check if middleware is logging (should see logs in server console)
4. Ensure API_BASE_URL matches the running port
5. Check if JWT token is valid (for authenticated endpoints)

### Common Issues:
1. **Wrong port**: Verify API is running on https://localhost:7107
2. **Missing headers**: Check if all required headers are present
3. **Authentication**: Some endpoints require valid JWT token
4. **Middleware order**: CORS middleware must be early in pipeline
5. **Status code issues**: Ensure OPTIONS responses don't write to body

### Server Logs to Look For:
```
[SignalR Negotiation CORS] Processing: OPTIONS /chatHub/negotiate from https://localhost:44479
[SignalR Negotiation CORS] Set wildcard headers for origin: https://localhost:44479
[SignalR Negotiation CORS] Handling OPTIONS preflight - returning 200
```
