# Simple System Test
Write-Host "🚀 SHN Gear System Test" -ForegroundColor Green

# Test Backend API
Write-Host "`n📡 Testing Backend API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5001/api/homepagesettings" -Method Get
    Write-Host "✅ Backend API: WORKING" -ForegroundColor Green
    Write-Host "   Hero Title: $($response.heroTitle)" -ForegroundColor Cyan
    Write-Host "   Settings ID: $($response.id)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Backend API: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test Frontend (basic check)
Write-Host "`n🌐 Testing Frontend..." -ForegroundColor Yellow
try {
    $null = Test-NetConnection -ComputerName "localhost" -Port 44479 -WarningAction SilentlyContinue
    if ($?) {
        Write-Host "✅ Frontend port 44479: OPEN" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend port 44479: CLOSED" -ForegroundColor Red
    }
} catch {
    Write-Host "⚠️ Frontend: Unable to test" -ForegroundColor Yellow
}

Write-Host "`n📊 Test Complete!" -ForegroundColor Magenta
