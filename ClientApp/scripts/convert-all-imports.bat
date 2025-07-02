@echo off
echo Converting imports to use aliases...
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

REM Get the directory of this batch file
set SCRIPT_DIR=%~dp0

REM Convert specific important directories
echo Converting src/components...
node "%SCRIPT_DIR%convert-imports.js" "%SCRIPT_DIR%..\src\components"

echo.
echo Converting src/pages...
node "%SCRIPT_DIR%convert-imports.js" "%SCRIPT_DIR%..\src\pages"

echo.
echo Converting remaining src files...
node "%SCRIPT_DIR%convert-imports.js" "%SCRIPT_DIR%..\src"

echo.
echo ✨ All imports have been converted to use aliases!
echo.
echo Don't forget to:
echo 1. Test the application with 'npm start'
echo 2. Check for any import errors in the console
echo 3. Update any remaining files manually if needed
echo.
pause
