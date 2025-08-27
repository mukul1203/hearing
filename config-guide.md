# Configuration Guide for Hearing Audio Player

## Setup Instructions

### 1. Google Drive API Setup

1. **Create a Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Google Drive API:**
   - In the API Library, search for "Google Drive API"
   - Click "Enable"

3. **Create Credentials:**
   - Go to "Credentials" section
   - Click "Create Credentials" → "API Key"
   - Copy the API key for later use
   - **Important**: Make sure to restrict the API key to Google Drive API for security

4. **Get Folder ID:**
   - Upload your audio files to a Google Drive folder
   - **IMPORTANT**: Make the folder publicly accessible (Anyone with the link can view)
     - Right-click folder → Share → Change to "Anyone with the link"
     - Set permission to "Viewer"
   - Open the folder in Google Drive
   - Copy the folder ID from the URL (the long string after `/folders/`)
   - Example: `https://drive.google.com/drive/folders/1ABC123xyz` → Folder ID is `1ABC123xyz`

**⚠️ Important Note about API Keys:**
Google Drive API keys can only access publicly shared files/folders. If you want to access private files, you would need OAuth authentication instead of an API key. For this application, make sure your audio folder is set to "Anyone with the link can view".

### 2. GitHub API Setup

1. **Create a Personal Access Token:**
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Click "Generate new token (classic)"
   - Give it a name like "Hearing Audio Player"
   - Select scopes: `repo` (for private repos) or `public_repo` (for public repos)
   - Copy the generated token

2. **Verify Repository Access:**
   - Ensure you have access to `https://github.com/mukul1203/hearing_db`
   - The repository should contain a `database.json` file

### 3. Application Configuration

1. **Open the Audio Player:**
   - Host the files on GitHub Pages or open `index.html` locally
   - Click the settings gear (⚙️) in the top-right corner

2. **Enter Credentials:**
   - **Google Drive API Key:** Paste your Google Drive API key
   - **GitHub Personal Access Token:** Paste your GitHub personal access token
   - **Google Drive Folder ID:** Paste the folder ID containing your audio files

3. **Save and Test:**
   - Click "Save Credentials"
   - Click "Test Connection" to verify everything works

## Security Considerations

⚠️ **Important Security Notes:**

### Current Implementation (localStorage)
- Credentials are stored in browser's localStorage
- **Pros:** Simple, works offline, persists between sessions
- **Cons:** Not encrypted, accessible via browser console, not suitable for shared computers

### Recommended Secure Alternatives:

1. **Environment Variables (GitHub Pages with Actions):**
   - Store tokens as GitHub repository secrets
   - Use GitHub Actions to inject them during build
   - Most secure for public deployment

2. **Server-Side Proxy:**
   - Create a simple server (Node.js/Python) to handle API calls
   - Store credentials server-side
   - Frontend makes requests to your server instead of APIs directly

3. **Browser Extension:**
   - Package as a browser extension
   - Use extension's secure storage APIs
   - Better isolation and security

4. **Desktop App:**
   - Use Electron or similar to create a desktop app
   - Store credentials in OS keychain/credential manager

### For Production Use:
Consider implementing option 1 or 2 above for better security, especially if sharing the application or using it on shared computers.

## Troubleshooting

### Common Issues:

1. **"Failed to load audio files":**
   - Check Google Drive API key is correct
   - Ensure folder ID is correct
   - **Verify folder is publicly shared** ("Anyone with the link can view")
   - Verify folder contains audio files (MP3, WAV, M4A)
   - Check browser console for detailed errors

2. **"Failed to save timestamp":**
   - Check GitHub API token permissions
   - Ensure repository exists and is accessible
   - Verify `database.json` file exists in the repository

3. **Audio won't play:**
   - Check browser audio permissions
   - Try different audio file formats
   - Check browser console for CORS errors

4. **CORS Issues:**
   - Some browsers may block cross-origin requests
   - Consider using a server-side proxy for production

### Browser Compatibility:
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Requires HTML5 audio support

## File Structure

```
hearing/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
├── config-guide.md     # This configuration guide
└── README.md           # Project overview
```

## Features

- ✅ Sequential audio playback from Google Drive folder
- ✅ Automatic resume with 5-minute context restoration
- ✅ Cross-device synchronization via GitHub database
- ✅ Timestamp tracking for start/stop events
- ✅ Modern, responsive UI
- ✅ Volume control and progress seeking
- ✅ Connection status indicators
