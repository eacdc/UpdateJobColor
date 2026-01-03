# Update Job Card System - Quick Start Guide

## Prerequisites

1. **Backend server must be running** on `http://localhost:3001`
   - This is the main backend in `CDC Site\backend` folder
2. A web server to serve the static files (cannot use `file://` due to CORS)

## Step 1: Start the Backend Server

Open a **Command Prompt** or **PowerShell** and navigate to the main backend directory:

```cmd
cd backend
npm install
npm start
```

The backend should be running on `http://localhost:3001`

**Note:** Make sure you have:
- Node.js installed
- MongoDB running (if using local MongoDB)
- MSSQL connection configured (if using MSSQL features)

## Step 2: Start a Local Web Server

Open a **new Command Prompt** or **PowerShell** window and navigate to the Update Job Card directory:

### Option 1: Using the start.bat script (Easiest)

```cmd
cd "Update Job Card"
start.bat
```

### Option 2: Using Python (Built-in on most systems)

```cmd
cd "Update Job Card"
python -m http.server 8000
```

### Option 3: Using Node.js (if you have http-server installed)

```cmd
cd "Update Job Card"
npx http-server -p 8000
```

### Option 4: Using VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Step 3: Access the Application

Open your browser and navigate to:

```
http://localhost:8000
```

## Testing

1. Type at least 4 digits of a job number in the search field
2. You should see an autocomplete dropdown with matching job numbers
3. Click on a job number or press Enter
4. The job details should populate automatically

## Troubleshooting

- **CORS errors**: Make sure the backend is running on port 3001
- **No autocomplete**: Check browser console (F12) for errors
- **Backend connection failed**: Verify backend is running: `http://localhost:3001/health`
- **404 errors on API calls**: The completion endpoints should already exist in the main backend

## Quick Test Commands

### Test Backend Health:
```cmd
curl http://localhost:3001/health
```

### Test Job Search Endpoint:
```cmd
curl http://localhost:3001/api/jobs/search-numbers-completion/1234
```
