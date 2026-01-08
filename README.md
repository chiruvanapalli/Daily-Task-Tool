
# 🚀 Work Space - Frontend Task Tracker

A sleek, high-performance internal tool for frontend teams to monitor daily task progress, manage EOD (End of Day) reporting, and analyze team health.

## ✨ Features

- **Dashboard:** Real-time scannability with "Health Flags" (On Track, At Risk, Delayed).
- **Member Portal:** Sleek EOD reporting with progress sliders, status toggles, and detailed blocker tracking.
- **Lead View:** Advanced task assignment with project entities and category templates (Demo, Element, Migration, etc.).
- **Archive:** Full historical log of all tasks with multi-filter capabilities.
- **Sleek UI:** Built with **Plus Jakarta Sans** typography and a modern, high-contrast Slate design.
- **Local Persistence:** Automatic synchronization with Browser LocalStorage + JSON/CSV export support.

---

## 📦 How to Deploy to GitHub

To host this tool for free on **GitHub Pages**, follow these steps:

### Option A: Manual Upload (Fastest)
1. Create a new repository on GitHub named `workspace-task-tool`.
2. Open your repository on GitHub.com and click **"uploading an existing file"**.
3. Drag and drop all files from this project into the browser.
4. Go to **Settings > Pages**.
5. Under "Branch", select `main` (or `master`) and `/ (root)`. Click **Save**.
6. Your site will be live at `https://<your-username>.github.io/workspace-task-tool/` in a few minutes!

### Option B: Using Git CLI
```bash
# Initialize the repository
git init
git add .
git commit -m "Initial commit: Work Space"

# Link to your GitHub repo
git remote add origin https://github.com/YOUR_USERNAME/workspace-task-tool.git
git branch -M main
git push -u origin main
```

---

## 🛠️ Local Development

This project uses modern ES Modules via `esm.sh`, meaning it requires very little configuration to run locally.

1. **Prerequisites:** Install [Node.js](https://nodejs.org/).
2. **Setup:**
   ```bash
   # Install a simple static server
   npm install -g serve
   
   # Run the app
   serve .
   ```
3. Open `http://localhost:3000` in your browser.

---

## 📝 Future Updates
If you wish to add more features (like Sprint Planning or API integrations), you can provide the **Master Specification Prompt** (found in our chat history) to the Gemini AI to continue development seamlessly.

---
*Created with ❤️ for high-performance frontend teams.*
