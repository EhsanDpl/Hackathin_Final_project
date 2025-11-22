# 🔒 Fixing Docker Security Alert on macOS

## ⚠️ The Issue

macOS is showing: **"com.docker.vmnetd was not opened because it contains malware"**

**This is a FALSE POSITIVE!** Docker is legitimate software. macOS sometimes incorrectly flags Docker's network component.

---

## ✅ Solution: Allow Docker in Security Settings

### Method 1: System Settings (Recommended)

1. **Open System Settings**
   - Click Apple menu (🍎) → System Settings
   - Or press `Cmd + Space` and type "System Settings"

2. **Go to Privacy & Security**
   - Click "Privacy & Security" in the sidebar
   - Scroll down to "Security" section

3. **Allow Docker**
   - Look for a message about Docker being blocked
   - Click **"Allow Anyway"** or **"Open Anyway"** button
   - You may need to enter your password

4. **If you don't see the message:**
   - Try opening Docker Desktop again
   - The security prompt should appear again
   - This time, click "Allow" or "Open"

### Method 2: Terminal Command (Alternative)

If the above doesn't work, you can manually allow it:

```bash
# Remove the quarantine attribute from Docker
sudo xattr -rd com.apple.quarantine /Applications/Docker.app

# Then try opening Docker again
open -a Docker
```

### Method 3: Right-Click Open

1. **Quit Docker** if it's running
2. **Go to Applications folder**
3. **Right-click on Docker**
4. **Select "Open"** (not double-click)
5. **Click "Open"** in the security dialog
6. This bypasses the automatic malware check

---

## 🔍 Verify Docker is Working

After allowing Docker:

```bash
# Check if Docker daemon is running
docker ps

# Check Docker version
docker --version

# Check Docker Compose
docker-compose --version
```

---

## 🛡️ Why This Happens

- macOS Gatekeeper scans all apps for malware
- Docker uses system-level network components
- Sometimes these components trigger false positives
- Docker Desktop is a legitimate, widely-used application
- Millions of developers use it safely

---

## ✅ After Fixing

Once Docker is allowed:

1. **Start Docker Desktop**
   - Open from Applications
   - Wait for it to fully start (whale icon in menu bar)

2. **Verify it's running:**
   ```bash
   docker ps
   ```

3. **Proceed with SkillPilot setup:**
   ```bash
   cd skillpilot-mock-server
   docker-compose up --build
   ```

---

## 🆘 Still Having Issues?

If Docker still won't start:

1. **Check System Settings → Privacy & Security**
   - Look for any blocked items
   - Allow Docker if listed

2. **Restart your Mac**
   - Sometimes helps clear security caches

3. **Re-download Docker Desktop**
   - Get the latest version from docker.com
   - This ensures you have the most recent, signed version

4. **Check macOS version compatibility**
   - Docker Desktop requires macOS 10.15+
   - You're on macOS 15.3.2, so you're good!

---

**Once Docker is allowed, you can proceed with the SkillPilot setup!**

