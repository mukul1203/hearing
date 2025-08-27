class HearingPlayer {
    constructor() {
        this.audioFiles = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.credentials = {
            googleDriveToken: '',
            githubToken: '',
            driveFolderId: ''
        };
        this.dbData = null;
        this.lastSyncTime = null;
        
        this.initializeElements();
        this.initializeEventListeners();
        this.loadCredentials();
        this.updateStatus();
    }

    initializeElements() {
        this.audioPlayer = document.getElementById('audioPlayer');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.progressBar = document.getElementById('progressBar');
        this.progressFill = document.getElementById('progressFill');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.currentFileDisplay = document.getElementById('currentFile');
        this.progressInfo = document.getElementById('progressInfo');
        this.settingsPanel = document.getElementById('settingsPanel');
        this.settingsToggle = document.getElementById('settingsToggle');
        this.driveStatus = document.getElementById('driveStatus');
        this.dbStatus = document.getElementById('dbStatus');
        this.lastSync = document.getElementById('lastSync');
        
        // Credential inputs
        this.googleDriveTokenInput = document.getElementById('googleDriveToken');
        this.githubTokenInput = document.getElementById('githubToken');
        this.driveFolderIdInput = document.getElementById('driveFolderId');
        this.saveCredentialsBtn = document.getElementById('saveCredentials');
        this.testConnectionBtn = document.getElementById('testConnection');
    }

    initializeEventListeners() {
        // Audio player events
        this.audioPlayer.addEventListener('loadedmetadata', () => {
            this.duration = this.audioPlayer.duration;
            this.updateProgressInfo();
        });

        this.audioPlayer.addEventListener('timeupdate', () => {
            this.currentTime = this.audioPlayer.currentTime;
            this.updateProgress();
            this.updateProgressInfo();
        });

        this.audioPlayer.addEventListener('ended', () => {
            this.recordTimestamp('stop');
            this.nextTrack();
        });

        this.audioPlayer.addEventListener('play', () => {
            this.isPlaying = true;
            this.playPauseBtn.textContent = '⏸️';
            this.recordTimestamp('start');
        });

        this.audioPlayer.addEventListener('pause', () => {
            this.isPlaying = false;
            this.playPauseBtn.textContent = '▶️';
            this.recordTimestamp('stop');
        });

        // Control buttons
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.prevBtn.addEventListener('click', () => this.previousTrack());
        this.nextBtn.addEventListener('click', () => this.nextTrack());

        // Progress bar
        this.progressBar.addEventListener('click', (e) => {
            const rect = this.progressBar.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = clickX / rect.width;
            this.seekTo(percentage * this.duration);
        });

        // Volume control
        this.volumeSlider.addEventListener('input', (e) => {
            this.audioPlayer.volume = e.target.value / 100;
        });

        // Settings
        this.settingsToggle.addEventListener('click', () => this.toggleSettings());
        this.saveCredentialsBtn.addEventListener('click', () => this.saveCredentials());
        this.testConnectionBtn.addEventListener('click', () => this.testConnections());

        // Set initial volume
        this.audioPlayer.volume = 0.7;
    }

    toggleSettings() {
        this.settingsPanel.classList.toggle('open');
    }

    async saveCredentials() {
        this.credentials.googleDriveToken = this.googleDriveTokenInput.value;
        this.credentials.githubToken = this.githubTokenInput.value;
        this.credentials.driveFolderId = this.driveFolderIdInput.value;

        // Store credentials in localStorage (note: this is not the most secure option)
        localStorage.setItem('hearing_credentials', JSON.stringify(this.credentials));
        
        alert('Credentials saved! Note: For production use, consider more secure storage options.');
        this.toggleSettings();
        
        // Attempt to initialize connections
        await this.initializeConnections();
    }

    loadCredentials() {
        const saved = localStorage.getItem('hearing_credentials');
        if (saved) {
            this.credentials = JSON.parse(saved);
            this.googleDriveTokenInput.value = this.credentials.googleDriveToken;
            this.githubTokenInput.value = this.credentials.githubToken;
            this.driveFolderIdInput.value = this.credentials.driveFolderId;
        }
    }

    async testConnections() {
        const driveTest = await this.testGoogleDriveConnection();
        const githubTest = await this.testGitHubConnection();
        
        const message = `Google Drive: ${driveTest ? '✅ Connected' : '❌ Failed'}\nGitHub: ${githubTest ? '✅ Connected' : '❌ Failed'}`;
        alert(message);
    }

    async testGoogleDriveConnection() {
        if (!this.credentials.googleDriveToken || !this.credentials.driveFolderId) {
            return false;
        }

        try {
            const response = await fetch(`https://www.googleapis.com/drive/v3/files?q='${this.credentials.driveFolderId}'+in+parents&fields=files(id,name,mimeType)&key=${this.credentials.googleDriveToken}`);
            return response.ok;
        } catch (error) {
            console.error('Google Drive connection test failed:', error);
            return false;
        }
    }

    async testGitHubConnection() {
        if (!this.credentials.githubToken) {
            return false;
        }

        try {
            const response = await fetch('https://api.github.com/repos/mukul1203/hearing_db/contents/database.json', {
                headers: {
                    'Authorization': `token ${this.credentials.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            return response.ok;
        } catch (error) {
            console.error('GitHub connection test failed:', error);
            return false;
        }
    }

    async initializeConnections() {
        if (!this.credentials.googleDriveToken || !this.credentials.githubToken || !this.credentials.driveFolderId) {
            console.log('Missing credentials, please configure in settings');
            return;
        }

        // Load database state
        await this.loadDatabaseState();
        
        // Load audio files from Google Drive
        await this.loadAudioFiles();
        
        // Resume playback if needed
        await this.resumePlayback();
    }

    async loadDatabaseState() {
        try {
            this.updateConnectionStatus('dbStatus', 'connecting');
            
            const response = await fetch('https://api.github.com/repos/mukul1203/hearing_db/contents/database.json', {
                headers: {
                    'Authorization': `token ${this.credentials.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const content = atob(data.content);
                this.dbData = JSON.parse(content);
                this.updateConnectionStatus('dbStatus', 'connected');
                this.lastSyncTime = new Date();
                this.updateLastSync();
            } else {
                throw new Error('Failed to load database');
            }
        } catch (error) {
            console.error('Failed to load database state:', error);
            this.updateConnectionStatus('dbStatus', 'disconnected');
            // Initialize empty database structure
            this.dbData = {
                currentFile: '',
                currentTime: 0,
                lastUpdated: new Date().toISOString(),
                history: []
            };
        }
    }

    async loadAudioFiles() {
        try {
            this.updateConnectionStatus('driveStatus', 'connecting');
            
            const response = await fetch(`https://www.googleapis.com/drive/v3/files?q='${this.credentials.driveFolderId}'+in+parents+and+(mimeType='audio/mpeg'+or+mimeType='audio/mp3'+or+mimeType='audio/wav'+or+mimeType='audio/m4a')&orderBy=name&fields=files(id,name,mimeType)&key=${this.credentials.googleDriveToken}`);

            if (response.ok) {
                const data = await response.json();
                this.audioFiles = data.files.map(file => ({
                    id: file.id,
                    name: file.name,
                    url: `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`
                }));
                
                this.updateConnectionStatus('driveStatus', 'connected');
                this.updateButtonStates();
                console.log(`Loaded ${this.audioFiles.length} audio files`);
            } else {
                throw new Error('Failed to load audio files');
            }
        } catch (error) {
            console.error('Failed to load audio files:', error);
            this.updateConnectionStatus('driveStatus', 'disconnected');
        }
    }

    async resumePlayback() {
        if (!this.dbData || !this.audioFiles.length) return;

        // Find the current file in our audio list
        const fileIndex = this.audioFiles.findIndex(file => file.name === this.dbData.currentFile);
        
        if (fileIndex !== -1) {
            this.currentIndex = fileIndex;
            await this.loadCurrentTrack();
            
            const resumeTime = Math.max(0, this.dbData.currentTime);
            this.seekTo(resumeTime);
        } else if (this.audioFiles.length > 0) {
            // If the previous file is not found, start from the beginning
            this.currentIndex = 0;
            await this.loadCurrentTrack();
        }
    }

    async loadCurrentTrack() {
        if (this.audioFiles.length === 0) {
            this.currentFileDisplay.textContent = 'No audio files found';
            return;
        }

        const currentFile = this.audioFiles[this.currentIndex];
        this.currentFileDisplay.textContent = currentFile.name;
        
        // Set the audio source with authentication
        this.audioPlayer.src = '';
        
        try {
            const response = await fetch(`${currentFile.url}&key=${this.credentials.googleDriveToken}`);
            
            if (response.ok) {
                const blob = await response.blob();
                const audioUrl = URL.createObjectURL(blob);
                this.audioPlayer.src = audioUrl;
            } else {
                throw new Error('Failed to load audio file');
            }
        } catch (error) {
            console.error('Error loading audio file:', error);
            this.currentFileDisplay.textContent = 'Error loading file';
        }
    }

    togglePlayPause() {
        if (this.audioPlayer.paused) {
            this.audioPlayer.play();
        } else {
            this.audioPlayer.pause();
        }
    }

    async previousTrack() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            await this.loadCurrentTrack();
            if (this.isPlaying) {
                this.audioPlayer.play();
            }
        }
    }

    async nextTrack() {
        if (this.currentIndex < this.audioFiles.length - 1) {
            this.currentIndex++;
            await this.loadCurrentTrack();
            if (this.isPlaying) {
                this.audioPlayer.play();
            }
        }
    }

    seekTo(time) {
        this.audioPlayer.currentTime = time;
        this.currentTime = time;
    }

    updateProgress() {
        if (this.duration > 0) {
            const percentage = (this.currentTime / this.duration) * 100;
            this.progressFill.style.width = `${percentage}%`;
        }
    }

    updateProgressInfo() {
        const currentMinutes = Math.floor(this.currentTime / 60);
        const currentSeconds = Math.floor(this.currentTime % 60);
        const durationMinutes = Math.floor(this.duration / 60);
        const durationSeconds = Math.floor(this.duration % 60);
        
        const currentTimeStr = `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')}`;
        const durationStr = `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;
        
        this.progressInfo.textContent = `${currentTimeStr} / ${durationStr}`;
    }

    updateButtonStates() {
        this.prevBtn.disabled = this.currentIndex === 0;
        this.nextBtn.disabled = this.currentIndex === this.audioFiles.length - 1;
        this.playPauseBtn.disabled = this.audioFiles.length === 0;
    }

    updateConnectionStatus(elementId, status) {
        const element = document.getElementById(elementId);
        element.className = `status-indicator ${status}`;
    }

    updateLastSync() {
        if (this.lastSyncTime) {
            this.lastSync.textContent = `Last sync: ${this.lastSyncTime.toLocaleTimeString()}`;
        }
    }

    updateStatus() {
        // Update connection statuses based on current state
        if (this.credentials.googleDriveToken && this.credentials.driveFolderId) {
            this.updateConnectionStatus('driveStatus', 'connected');
        } else {
            this.updateConnectionStatus('driveStatus', 'disconnected');
        }

        if (this.credentials.githubToken) {
            this.updateConnectionStatus('dbStatus', 'connected');
        } else {
            this.updateConnectionStatus('dbStatus', 'disconnected');
        }
    }

    async recordTimestamp(action) {
        if (!this.credentials.githubToken || !this.audioFiles[this.currentIndex]) return;

        const timestamp = {
            action: action,
            file: this.audioFiles[this.currentIndex].name,
            time: this.currentTime,
            timestamp: new Date().toISOString()
        };

        // Update local database
        this.dbData.currentFile = this.audioFiles[this.currentIndex].name;
        this.dbData.currentTime = this.currentTime;
        this.dbData.lastUpdated = timestamp.timestamp;
        this.dbData.history.push(timestamp);

        // Save to GitHub
        try {
            await this.saveToGitHub();
        } catch (error) {
            console.error('Failed to save timestamp:', error);
        }
    }

    async saveToGitHub() {
        try {
            // First, get the current file SHA
            const getResponse = await fetch('https://api.github.com/repos/mukul1203/hearing_db/contents/database.json', {
                headers: {
                    'Authorization': `token ${this.credentials.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            let sha = '';
            if (getResponse.ok) {
                const data = await getResponse.json();
                sha = data.sha;
            }

            // Update the file
            const content = btoa(JSON.stringify(this.dbData, null, 2));
            const updateResponse = await fetch('https://api.github.com/repos/mukul1203/hearing_db/contents/database.json', {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.credentials.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Update playback state - ${new Date().toISOString()}`,
                    content: content,
                    sha: sha
                })
            });

            if (updateResponse.ok) {
                this.lastSyncTime = new Date();
                this.updateLastSync();
                this.updateConnectionStatus('dbStatus', 'connected');
            } else {
                throw new Error('Failed to update database');
            }
        } catch (error) {
            console.error('Error saving to GitHub:', error);
            this.updateConnectionStatus('dbStatus', 'disconnected');
        }
    }
}

// Initialize the player when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const player = new HearingPlayer();
    
    // Auto-initialize if credentials are available
    if (player.credentials.googleDriveToken && player.credentials.githubToken && player.credentials.driveFolderId) {
        player.initializeConnections();
    }
});
