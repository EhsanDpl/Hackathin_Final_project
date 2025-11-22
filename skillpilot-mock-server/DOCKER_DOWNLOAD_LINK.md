# 🐳 Docker Desktop Download Link for Your Mac

## Your Mac Specifications
- **Model**: MacBook Pro 14-inch, 2021
- **Chip**: Apple M1 Pro (Apple Silicon)
- **macOS**: Sequoia 15.3.2
- **Required**: Docker Desktop for Mac with **Apple Silicon**

---

## 📥 Direct Download Links

### ✅ For Your Mac (Apple Silicon - M1 Pro)

**Official Docker Desktop Download:**
👉 **https://www.docker.com/products/docker-desktop/**

**Direct Download Link (Apple Silicon):**
👉 **https://desktop.docker.com/mac/main/arm64/Docker.dmg**

This is the correct version for:
- Apple M1, M1 Pro, M1 Max, M1 Ultra
- Apple M2, M2 Pro, M2 Max, M2 Ultra  
- Apple M3, M3 Pro, M3 Max
- Any Apple Silicon Mac

---

## 📋 Installation Steps

1. **Download the .dmg file**
   - Click the link above or visit docker.com
   - Make sure you download the **Apple Silicon** version (not Intel)

2. **Open the .dmg file**
   - Double-click `Docker.dmg` in Downloads

3. **Install Docker Desktop**
   - Drag the Docker icon to Applications folder
   - Enter your password if prompted

4. **Open Docker Desktop**
   - Go to Applications → Docker
   - Right-click and select "Open" (to bypass security warning)
   - Click "Open" in the security dialog

5. **Allow Security Permissions**
   - If you see "Malware Blocked" alert:
     - Go to System Settings → Privacy & Security
     - Scroll down to find the blocked item
     - Click "Allow Anyway"

6. **Wait for Docker to Start**
   - You'll see a whale icon in the menu bar
   - Wait until it says "Docker Desktop is running"

---

## ✅ Verify Installation

Open Terminal and run:

```bash
# Check Docker version
docker --version

# Check if Docker is running
docker ps

# Check Docker Compose
docker-compose --version
```

---

## 🔗 Alternative: Homebrew Installation

If you have Homebrew installed:

```bash
brew install --cask docker
```

Then open Docker Desktop from Applications.

---

## 📊 System Requirements

✅ **Your Mac meets all requirements:**
- macOS 10.15+ (you have 15.3.2) ✅
- Apple Silicon chip (you have M1 Pro) ✅
- 4GB RAM minimum (you have 16GB) ✅
- Virtualization enabled (automatic on Apple Silicon) ✅

---

## 🆘 If Download Fails

1. **Try the official page:**
   - Visit: https://www.docker.com/products/docker-desktop/
   - Click "Download for Mac"
   - Make sure it says "Mac with Apple chip"

2. **Check your browser:**
   - Some browsers block .dmg downloads
   - Allow the download in browser settings

3. **Use Homebrew (if available):**
   ```bash
   brew install --cask docker
   ```

---

## 🎯 After Installation

Once Docker Desktop is installed and running:

1. **Navigate to your project:**
   ```bash
   cd "/Users/ehsanullah/Desktop/Final Hackathon/skillpilot-mock-server"
   ```

2. **Start the containers:**
   ```bash
   docker-compose up --build
   ```

3. **Seed the database:**
   ```bash
   docker-compose exec api npm run seed
   ```

---

**The download link for your Mac:**
**https://desktop.docker.com/mac/main/arm64/Docker.dmg**

This is the official Docker Desktop for Apple Silicon (ARM64) architecture.

