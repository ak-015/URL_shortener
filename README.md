# 🔗 Resume URL Shortener

A minimal, self-hosted URL shortener built with Node.js, Express, and MongoDB.
Perfect for managing short links on your resume (e.g. `yourdomain.com/resume`, `yourdomain.com/li`).

---

## ⚡ Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env`:
```
MONGODB_URI=mongodb://localhost:27017/urlshortener
PORT=3000
BASE_URL=http://localhost:3000   # change to your domain in production
```

### 3. Run
```bash
# Development (auto-restart on change)
npm run dev

# Production
npm start
```

Open **http://localhost:3000** — the dashboard is ready.

---

## 🌐 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/shorten` | Create a short URL |
| `GET`  | `/api/links` | List all links |
| `GET`  | `/api/links/:code/stats` | Stats for one link |
| `DELETE` | `/api/links/:code` | Delete a link |
| `GET`  | `/:code` | Redirect (302) to original URL |

### POST /api/shorten
```json
{
  "url": "https://linkedin.com/in/yourname",
  "customCode": "li",          // optional
  "label": "LinkedIn"          // optional, display only
}
```

---

## ☁️ Deploying to Production

### Railway / Render / Fly.io
1. Push repo to GitHub
2. Connect to Railway/Render — it auto-detects `package.json`
3. Add environment variables: `MONGODB_URI`, `BASE_URL`
4. Set `BASE_URL` to your public domain (e.g. `https://shortlink.yourdomain.com`)

### MongoDB Atlas (free cloud DB)
1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Get connection string → set as `MONGODB_URI`

---

## 📁 Project Structure
```
url-shortener/
├── server.js          # Express app + all routes
├── public/
│   ├── index.html     # Dashboard UI
│   └── 404.html       # Not-found page
├── package.json
├── .env.example
└── README.md
```
