# Test script for Homepage Settings API
$baseUrl = "http://localhost:5001/api/homepagesettings"

Write-Host "Testing Homepage Settings API..." -ForegroundColor Green

# Test 1: Get homepage settings
Write-Host "1. Testing GET /api/homepagesettings" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri $baseUrl -Method Get
    Write-Host "✓ GET request successful" -ForegroundColor Green
    Write-Host "Response ID: $($response.id)" -ForegroundColor Cyan
    Write-Host "Hero Title: $($response.heroTitle)" -ForegroundColor Cyan
}
catch {
    Write-Host "✗ GET request failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Update homepage settings
Write-Host "`n2. Testing PUT /api/homepagesettings/1" -ForegroundColor Yellow
$updateData = @{
    id                         = 1
    heroTitle                  = "Updated Hero Title - Test"
    heroSubtitle               = "Updated subtitle for testing"
    heroDescription            = "This is a test update"
    heroCtaText                = "Test CTA"
    heroCtaLink                = "/test"
    heroBadgeText              = "Test Badge"
    heroIsActive               = $true
    featuredCategoriesTitle    = "Test Categories"
    featuredCategoriesSubtitle = "Test subtitle"
    featuredCategoriesIsActive = $true
    productShowcaseTitle       = "Test Products"
    productShowcaseSubtitle    = "Test subtitle"
    productShowcaseIsActive    = $true
    promotionalBannersTitle    = "Test Banners"
    promotionalBannersSubtitle = "Test subtitle"
    promotionalBannersIsActive = $true
    testimonialsTitle          = "Test Testimonials"
    testimonialsSubtitle       = "Test subtitle"
    testimonialsIsActive       = $true
    brandStoryTitle            = "Test Brand Story"
    brandStorySubtitle         = "Test subtitle"
    brandStoryDescription      = "Test description"
    brandStoryCtaText          = "Test CTA"
    brandStoryCtaLink          = "/test"
    brandStoryIsActive         = $true
    newsletterTitle            = "Test Newsletter"
    newsletterSubtitle         = "Test subtitle"
    newsletterCtaText          = "Test CTA"
    newsletterIsActive         = $true
    servicesIsActive           = $true
    isActive                   = $true
    displayOrder               = 1
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/1" -Method Put -Body $updateData -ContentType "application/json"
    Write-Host "✓ PUT request successful" -ForegroundColor Green
}
catch {
    Write-Host "✗ PUT request failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Note: This may fail due to missing authentication token" -ForegroundColor Yellow
}

# Test 3: Verify the update
Write-Host "`n3. Testing GET after update" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri $baseUrl -Method Get
    Write-Host "✓ GET after update successful" -ForegroundColor Green
    Write-Host "Updated Hero Title: $($response.heroTitle)" -ForegroundColor Cyan
}
catch {
    Write-Host "✗ GET after update failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nAPI Testing completed!" -ForegroundColor Green
