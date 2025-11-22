# 🐳 Installing Docker Desktop on macOS

## Current Status
✅ Docker CLI is installed (version 26.0.0)  
❌ Docker Desktop is not running  
❌ Docker daemon is not accessible  

## Solution: Install Docker Desktop

Docker Desktop includes:
- Docker Engine (daemon)
- Docker CLI
- Docker Compose
- Kubernetes (optional)
- Visual interface

---

## 📥 Download & Install Steps

### Step 1: Download Docker Desktop

**Option A: Direct Download (Recommended)**
1. Visit: https://www.docker.com/products/docker-desktop/
2. Click **"Download for Mac"**
3. Choose the correct version:
   - **Apple Silicon (M1/M2/M3)**: Download "Mac with Apple chip"
   - **Intel Mac**: Download "Mac with Intel chip"

**Option B: Using Homebrew (If you have it)**
```bash
brew install --cask docker
```

### Step 2: Install Docker Desktop

1. Open the downloaded `.dmg` file
2. Drag **Docker** icon to the **Applications** folder
3. Open **Docker** from Applications (or Launchpad)
4. You may be prompted to enter your password

### Step 3: Start Docker Desktop

1. Open **Docker Desktop** from Applications
2. Wait for Docker to start (you'll see a whale icon in the menu bar)
3. The icon should show "Docker Desktop is running" when ready

### Step 4: Verify Installation

Open Terminal and run:

```bash
# Check Docker version
docker --version

# Check Docker Compose
docker-compose --version

# Verify Docker is running
docker ps

# If docker-compose doesn't work, try:
docker compose version
```

You should see:
- ✅ Docker version information
- ✅ Docker Compose version
- ✅ Empty container list (or no errors)

---

## 🚨 Troubleshooting

### Problem: "Cannot connect to Docker daemon"

**Solution:**
1. Make sure Docker Desktop is running
2. Check menu bar for Docker icon
3. Click Docker icon → "Start" if it's stopped

### Problem: "docker-compose: command not found"

**Solution:**
- Docker Desktop includes docker-compose
- If it's missing, restart Docker Desktop
- Or use: `docker compose` (newer syntax, no hyphen)

### Problem: Docker Desktop won't start

**Solution:**
1. Check System Preferences → Security & Privacy
2. Allow Docker if prompted
3. Restart your Mac if needed
4. Check Docker Desktop logs:
   - Click Docker icon → Troubleshoot → View logs

### Problem: "Docker Desktop requires a newer Mac"

**Solution:**
- Docker Desktop requires macOS 10.15 or later
- Check your macOS version: `sw_vers`
- Update macOS if needed

---

## ✅ After Installation

Once Docker Desktop is running, you can:

1. **Start SkillPilot containers:**
   ```bash
   cd skillpilot-mock-server
   docker-compose up --build
   ```

2. **Check Docker status:**
   ```bash
   docker ps
   docker-compose ps
   ```

3. **View Docker Desktop:**
   - Open Docker Desktop app
   - See containers, images, volumes
   - Monitor resource usage

---

## 📊 System Requirements

- **macOS**: 10.15 (Catalina) or newer
- **RAM**: 4GB minimum (8GB recommended)
- **Disk Space**: ~500MB for Docker Desktop
- **Virtualization**: Enabled (usually automatic)

---

## 🔗 Quick Links

- **Download Docker Desktop**: https://www.docker.com/products/docker-desktop/
- **Docker Documentation**: https://docs.docker.com/
- **Docker Desktop for Mac Guide**: https://docs.docker.com/desktop/install/mac-install/

---

## 💡 Tips

1. **Keep Docker Desktop Running**: Keep it running in the background
2. **Resource Usage**: Docker uses CPU/RAM - close if not needed
3. **Updates**: Docker Desktop will notify you of updates
4. **Menu Bar Icon**: Click to see container status, logs, etc.

---

**Once Docker Desktop is installed and running, proceed with the SkillPilot setup!**

