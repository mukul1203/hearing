# 🎧 Hearing - Sequential Audio Player

A minimal web-based audio player that automatically plays audio files in sequence from your Google Drive folder, with cross-device synchronization and automatic resume functionality.

## ✨ Features

- **Sequential Playback**: Automatically plays audio files from a Google Drive folder in order
- **Cross-Device Sync**: Resume playback from any device using GitHub as a database
- **Smart Resume**: Automatically resumes from 5 minutes before your last position to restore context
- **Timestamp Tracking**: Records when you start and stop playing for perfect synchronization
- **Modern UI**: Clean, responsive interface with intuitive controls
- **GitHub Pages Ready**: Easily deployable to GitHub Pages for free hosting

## 🚀 Quick Start

1. **Clone this repository**
2. **Set up API credentials** (see [Configuration Guide](config-guide.md))
3. **Deploy to GitHub Pages** or open `index.html` locally
4. **Configure credentials** in the settings panel
5. **Start listening!**

## 📋 Requirements

- Google Drive folder with audio files (MP3, WAV, M4A)
- Google Drive API credentials
- GitHub API token with access to [hearing_db](https://github.com/mukul1203/hearing_db) repository
- Modern web browser with JavaScript enabled

## 🔧 Setup

### 1. Google Drive Setup
- Create a Google Cloud Project and enable Drive API
- Generate an API key
- Upload audio files to a Drive folder and get the folder ID

### 2. GitHub Setup  
- Create a personal access token with repo permissions
- Ensure access to the hearing_db repository with database.json

### 3. Application Configuration
- Open the settings panel (⚙️ button)
- Enter your credentials
- Test the connection

For detailed setup instructions, see the [Configuration Guide](config-guide.md).

## 🔒 Security Considerations

**Current Implementation**: Credentials are stored in browser localStorage for simplicity.

**For Production Use**, consider these more secure alternatives:
- Environment variables with GitHub Actions
- Server-side proxy to handle API calls
- Browser extension with secure storage
- Desktop application with OS credential management

See the [Configuration Guide](config-guide.md) for detailed security recommendations.

## 🏗️ Architecture

- **Frontend**: Plain HTML, CSS, and JavaScript (no frameworks)
- **Audio Source**: Google Drive API
- **Database**: GitHub repository with JSON file
- **Hosting**: GitHub Pages compatible

## 📱 Browser Support

- Chrome, Firefox, Safari, Edge (latest versions)
- Requires HTML5 audio support
- JavaScript must be enabled

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use and modify as needed.

## 🙏 Acknowledgments

Built for personal use but shared with the community. Inspired by the need for a simple, cross-device audio continuation system.

---

**Hare Krsna!** 🙏
