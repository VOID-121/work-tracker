@echo off
echo Creating GitHub repository manually...
echo.
echo Please follow these steps:
echo.
echo 1. Go to: https://github.com/new
echo 2. Repository name: work-tracker-app
echo 3. Description: Daily Work Tracker and Notes Manager - Full Stack Application
echo 4. Make it PUBLIC
echo 5. DO NOT initialize with README (we already have one)
echo 6. Click "Create repository"
echo.
echo After creating the repository, come back here and press any key...
pause
echo.
echo Now pushing your code to GitHub...
git push -u origin main
echo.
echo Done! Your repository should now be live at:
echo https://github.com/VOID-121/work-tracker-app
pause

