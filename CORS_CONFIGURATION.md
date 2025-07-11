# CORS Configuration Guide

## Problem Solved
This configuration fixes the CORS error:
```
Request header field x-requested-with is not allowed by Access-Control-Allow-Headers in preflight response
```

## Key Components

### 1. CorsConfiguration.cs
- Centralized CORS configuration
- Separate policies for regular APIs and SignalR
- Explicit header allowance for SignalR requests

### 2. SignalRCorsMiddleware.cs
- Specialized middleware for SignalR CORS handling
- Handles preflight OPTIONS requests
- Sets proper headers for SignalR negotiation

### 3. CorsDebugMiddleware.cs
- Development-only debugging middleware
- Logs detailed CORS request/response information
- Helps identify CORS issues

## Configuration Details

### Allowed Origins
- `https://localhost:44479` (Frontend)
- `http://localhost:3000` (React dev server)
- `https://localhost:3001` (Alternative frontend port)
- `https://localhost:7107` (API server)
- `http://localhost:5067` (HTTP API server)

### SignalR Specific Headers
- `Content-Type`
- `Authorization`
- `x-requested-with` (Required by SignalR)
- `x-signalr-user-agent` (SignalR client identification)
- `Cache-Control`

### Middleware Order
1. CorsDebugMiddleware (development only)
2. SimpleRateLimitMiddleware
3. SignalRCorsMiddleware
4. Standard ASP.NET Core middlewares
5. UseCorsConfiguration()

## Troubleshooting

### Common Issues
1. **Missing x-requested-with header**: Fixed by SignalRCorsMiddleware
2. **Preflight failure**: Handled by OPTIONS request processing
3. **Credentials not allowed**: Ensured by proper AllowCredentials configuration

### Debug Steps
1. Check console logs from CorsDebugMiddleware
2. Verify middleware order in Program.cs
3. Confirm SignalR client configuration matches server

## Client Configuration
SignalR client should be configured with:
```javascript
const newConnection = new HubConnectionBuilder()
  .withUrl(connectionUrl, {
    skipNegotiation: false,
    accessTokenFactory: () => token
  })
  .withAutomaticReconnect([0, 2000, 10000, 30000])
  .configureLogging(LogLevel.Information)
  .build();
```

## Testing
1. Start the application
2. Open browser developer tools
3. Check for CORS errors in console
4. Verify SignalR connection establishment
5. Check middleware logs for detailed information
