# WandeRound

AI-powered trip planning assistant with interactive maps. Ask in natural language — WandeRound finds places, builds a route, and shows it on a map.

**Stack:** FastAPI · LangGraph · DeepSeek · Next.js · Tailwind CSS · OpenStreetMap

Wanderound Demo Video

[![Watch the Demo Video](https://img.youtube.com/vi/_36AZHRPALw/hqdefault.jpg)](https://www.youtube.com/watch?v=_36AZHRPALw)

---

## Local Development

You need **two terminals** running at the same time.

### Prerequisites

- Python 3.10+
- Node.js 18+
- A [DeepSeek API key](https://platform.deepseek.com)

### 1. Clone & configure

```bash
git clone https://github.com/nii0708/WandeRound.git
cd WandeRound
```

Copy the env template and fill in your API key:

```bash
cp .env.example .env
```

Edit `.env`:

```
DEEPSEEK_API_KEY = sk-your-key-here
DEEPSEEK_MODEL   = deepseek-v4-flash
```

### 2. Start the backend (Terminal 1)

```bash
pip install -r requirements.txt
python server.py
```

Backend runs at `http://localhost:8000`

### 3. Start the frontend (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

Open `http://localhost:3000` in your browser.

---

## Deployment

### Backend → Render

1. Go to [render.com](https://render.com) and sign in
2. Click **New → Web Service**
3. Connect your GitHub repository
4. Fill in the settings:

   | Field | Value |
   |---|---|
   | Root Directory | *(leave empty)* |
   | Runtime | Python 3 |
   | Build Command | `pip install -r requirements.txt` |
   | Start Command | `python server.py` |

5. Go to the **Environment** tab and add:

   ```
   DEEPSEEK_API_KEY = sk-your-key-here
   DEEPSEEK_MODEL   = deepseek-v4-flash
   ```

6. Click **Deploy**
7. Wait for the build to finish, then copy the service URL — it looks like `https://wanderound.onrender.com`

> **Note:** The free tier spins down after 15 minutes of inactivity. The first request after idle takes ~30–60 seconds to wake up. This is normal.

---

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New → Project**
3. Import the same GitHub repository
4. **Important:** change the **Root Directory** to `frontend`
5. Framework will be auto-detected as **Next.js**
6. Go to **Environment Variables** and add:

   ```
   NEXT_PUBLIC_BACKEND_URL = https://wanderound.onrender.com
   ```

   Replace the URL with the one you got from Render.

7. Click **Deploy**

Your app is now live at the Vercel URL.

> Every push to `main` automatically redeploys both Render and Vercel — no manual steps needed.

---

## Environment Variables Reference

| Variable | Where | Description |
|---|---|---|
| `DEEPSEEK_API_KEY` | Backend (Render) | API key from [platform.deepseek.com](https://platform.deepseek.com) |
| `DEEPSEEK_MODEL` | Backend (Render) | Model name — use `deepseek-v4-flash` |
| `NEXT_PUBLIC_BACKEND_URL` | Frontend (Vercel) | Your Render backend URL |

---

## Project Structure

```
WandeRound/
├── app.py              # LangGraph agent (trip planning logic)
├── server.py           # FastAPI backend with SSE streaming
├── thread_manager.py   # Chat thread persistence
├── tools/
│   ├── osm.py          # OpenStreetMap / Overpass API
│   └── route.py        # Route optimization (TSP)
├── data/               # GeoPackage files (auto-created, gitignored)
├── frontend/           # Next.js frontend
│   └── src/
│       ├── app/        # Pages and layout
│       ├── components/ # ChatSidebar, ChatWindow, MapView
│       ├── lib/        # Utilities
│       └── types/      # TypeScript types
└── requirements.txt    # Python dependencies
```

---

## Credits

I'm really thankful to the OSM, Overpass, and Nominatim communities so that this project can happen.
Thx to @AshecOne that tested this code and ISHteam that helped me a lot in 2025.

Built with [OpenStreetMap](https://www.openstreetmap.org/) · [Overpass API](https://overpass-api.de/) · [DeepSeek](https://www.deepseek.com/) · [LangGraph](https://github.com/langchain-ai/langgraph)
