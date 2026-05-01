# 🔗 Resume URL Shortener — Vercel Ready

Zero-config deploy to Vercel. Just update your MongoDB URI.

---

## ⚡ Deploy in 4 steps

### Step 1 — Get a MongoDB Atlas URI (free)
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → create free account
2. Create a **free M0 cluster** (any region)
3. **Database Access** → Add User → set username + password
4. **Network Access** → Add IP → `0.0.0.0/0` (allow all — required for Vercel)
5. **Connect** → Drivers → copy the connection string

It looks like:
```
mongodb+srv://myuser:mypassword@cluster0.abc12.mongodb.net/urlshortener?retryWrites=true&w=majority
```

### Step 2 — Update your `.env` file
Open `.env` and replace the placeholder:
```
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.abc12.mongodb.net/urlshortener?retryWrites=true&w=majority
BASE_URL=https://your-project-name.vercel.app
```

### Step 3 — Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/url-shortener.git
git push -u origin main
```

### Step 4 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → New Project → import your GitHub repo
2. In **Environment Variables**, add:
   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | your Atlas connection string |
   | `BASE_URL` | `https://your-project-name.vercel.app` |
3. Click **Deploy**

That's it. Your shortener is live. 🎉

---

## 🖥 Run locally

```bash
npm install
# Make sure .env has your MONGODB_URI
npm run dev
```
Open http://localhost:3000

---

## 📁 File structure

```
url-shortener/
├── api/
│   └── index.js       ← Express app (serverless function for Vercel)
├── public/
│   ├── index.html     ← Dashboard UI
│   └── 404.html       ← Not-found page
├── vercel.json        ← Vercel routing config
├── package.json
├── .env               ← Your secrets (never commit this)
├── .gitignore
└── README.md
```

## 🌐 API reference

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/shorten` | Create short URL |
| `GET` | `/api/links` | List all links + click counts |
| `GET` | `/api/links/:code/stats` | Stats for one link |
| `DELETE` | `/api/links/:code` | Delete a link |
| `GET` | `/:code` | Redirect to original URL |
