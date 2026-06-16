@echo off
REM Push script for Docker Hub - run this on your local machine

echo.
echo ================================
echo Docker Hub Push Script
echo ================================
echo.

REM Set your Docker Hub username
set DOCKER_USERNAME=nebula20

echo Logging in to Docker Hub...
docker login -u %DOCKER_USERNAME%

if errorlevel 1 (
    echo.
    echo ERROR: Docker login failed. Please verify your credentials.
    pause
    exit /b 1
)

echo.
echo Tagging backend image...
docker tag my-app-backend:latest %DOCKER_USERNAME%/lmis-backend:latest
if errorlevel 1 (
    echo ERROR: Failed to tag backend image
    pause
    exit /b 1
)

echo Pushing backend image...
docker push %DOCKER_USERNAME%/lmis-backend:latest
if errorlevel 1 (
    echo ERROR: Failed to push backend image
    pause
    exit /b 1
)

echo.
echo Tagging frontend image...
docker tag my-app-frontend:latest %DOCKER_USERNAME%/lmis-frontend:latest
if errorlevel 1 (
    echo ERROR: Failed to tag frontend image
    pause
    exit /b 1
)

echo Pushing frontend image...
docker push %DOCKER_USERNAME%/lmis-frontend:latest
if errorlevel 1 (
    echo ERROR: Failed to push frontend image
    pause
    exit /b 1
)

echo.
echo ================================
echo ✅ All images pushed successfully!
echo ================================
echo.
echo Backend: https://hub.docker.com/r/%DOCKER_USERNAME%/lmis-backend
echo Frontend: https://hub.docker.com/r/%DOCKER_USERNAME%/lmis-frontend
echo.
pause
