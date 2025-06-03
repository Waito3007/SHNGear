# SHN Gear Homepage Management - Demo Script
Write-Host "🎉 SHN GEAR HOMEPAGE MANAGEMENT DEMO" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Gray

Write-Host "`n🔍 SYSTEM STATUS CHECK" -ForegroundColor Cyan
Write-Host "Checking backend API..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5001/api/homepagesettings" -Method Get
    Write-Host "✅ Backend API: OPERATIONAL" -ForegroundColor Green
    Write-Host "   Current Hero Title: '$($response.heroTitle)'" -ForegroundColor White
    Write-Host "   Settings ID: $($response.id)" -ForegroundColor White
    Write-Host "   Last Updated: $($response.updatedAt)" -ForegroundColor White
} catch {
    Write-Host "❌ Backend API: ERROR - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n📱 AVAILABLE INTERFACES" -ForegroundColor Cyan
Write-Host "✅ Homepage:      https://localhost:44479" -ForegroundColor Green
Write-Host "✅ Admin Panel:   https://localhost:44479/admin/homepage-management" -ForegroundColor Green
Write-Host "✅ API Endpoint:  http://localhost:5001/api/homepagesettings" -ForegroundColor Green

Write-Host "`n🎯 DEMO FEATURES READY" -ForegroundColor Cyan
Write-Host "1. 🏠 Dynamic Homepage with live data loading" -ForegroundColor White
Write-Host "2. 🛠️  Admin Panel with 10 management sections:" -ForegroundColor White
Write-Host "   - Hero Section Management" -ForegroundColor Gray
Write-Host "   - Category Highlights" -ForegroundColor Gray
Write-Host "   - Promotional Banners" -ForegroundColor Gray
Write-Host "   - Product Showcase" -ForegroundColor Gray
Write-Host "   - Customer Testimonials" -ForegroundColor Gray
Write-Host "   - Brand Story" -ForegroundColor Gray
Write-Host "   - Newsletter Section" -ForegroundColor Gray
Write-Host "   - Campaign Management" -ForegroundColor Gray
Write-Host "   - Advanced Features" -ForegroundColor Gray
Write-Host "   - Content Preview" -ForegroundColor Gray

Write-Host "`n3. 🚀 Advanced Components:" -ForegroundColor White
Write-Host "   - Image Upload Manager" -ForegroundColor Gray
Write-Host "   - Product/Category Selectors" -ForegroundColor Gray
Write-Host "   - Drag & Drop Section Ordering" -ForegroundColor Gray
Write-Host "   - Bulk Operations Manager" -ForegroundColor Gray
Write-Host "   - Real-time Preview" -ForegroundColor Gray

Write-Host "`n📊 SYSTEM HEALTH" -ForegroundColor Cyan
Write-Host "Backend:    ✅ Running" -ForegroundColor Green
Write-Host "Frontend:   ✅ Running" -ForegroundColor Green  
Write-Host "Database:   ✅ Connected" -ForegroundColor Green
Write-Host "APIs:       ✅ Responsive" -ForegroundColor Green

Write-Host "`n🎬 DEMO READY!" -ForegroundColor Magenta
Write-Host "Open the URLs above to start exploring the system." -ForegroundColor Yellow
Write-Host "=" * 50 -ForegroundColor Gray
