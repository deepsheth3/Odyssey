<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/Google_Maps-API-4285F4?style=for-the-badge&logo=google-maps" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=for-the-badge&logo=tailwind-css" />
</p>

# 🧭 Odyssey

**The smartest California day trip planner.** Search a city, tell us your vibe, and get an AI-optimized itinerary with real-time routing.

---

## ✨ Features

### 🔍 **Smart City Discovery**
- Dynamic autocomplete powered by Google Places API
- Search any city in California with real-time suggestions

### 🎯 **Personalized Recommendations**
- Interactive preference quiz (activities, budget, pace)
- Rule-based scoring algorithm matching places to your interests
- "Why we picked this" reasoning for each recommendation

### 🗺️ **Route Optimization**
- Google Maps API integration for real travel times
- Traveling Salesman Problem (TSP) algorithm for optimal stop order
- Shows time saved compared to unoptimized routes

### ⚡ **Performance**
- Aggressive caching (7-day TTL) to minimize API costs
- Sub-2s response times for recommendations
- Hot-reload development experience

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 19, TailwindCSS 4, Framer Motion |
| **Backend** | FastAPI, Python 3.11+, Pydantic |
| **APIs** | Google Maps, Google Places, Google Directions |
| **Caching** | In-memory (MVP) → Redis (production) |
| **Database** | SQLite (MVP) → PostgreSQL (production) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Google Cloud Platform account with Maps API enabled

### 1. Clone & Install

```bash
git clone https://github.com/deepsheth3/Odyssey.git
cd Odyssey

# Frontend
cd frontend
npm install

# Backend
cd ../backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

Create `backend/.env`:
```env
GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 3. Run Development Servers

```bash
# Terminal 1 - Backend (from project root)
source backend/.venv/bin/activate
uvicorn backend.api.main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Open the App
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs

---

## 📁 Project Structure

```
Odyssey/
├── frontend/                 # Next.js application
│   ├── app/                  # App router pages
│   │   ├── discover/[city]/  # City exploration
│   │   ├── itinerary/demo/   # Sample itinerary
│   │   └── recommend/        # Preference quiz
│   ├── components/           # Reusable components
│   └── services/             # API client
│
├── backend/                  # FastAPI application
│   ├── api/                  # Route handlers
│   │   ├── main.py           # App entry point
│   │   ├── places.py         # Places discovery
│   │   ├── routes.py         # Route optimization
│   │   └── reccomend.py      # Recommendations
│   ├── core/                 # Core utilities
│   │   ├── config.py         # Environment config
│   │   ├── logging.py        # Logging setup
│   │   └── route_optimizer.py # TSP algorithm
│   ├── models/               # Pydantic models
│   └── services/             # Business logic
│       ├── places_service.py # Google Places integration
│       ├── cache_service.py  # Caching layer
│       └── recommendation_system.py
│
└── README.md
```

---

## 🔌 API Endpoints

### Places
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/places/discover/{city}` | Discover places in a city |
| GET | `/api/places/autocomplete?q=...` | Autocomplete California cities |
| GET | `/api/places/search?q=...` | Search for specific places |
| GET | `/api/places/categories` | Get available categories |

### Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/routes/optimize` | Optimize stop order |
| POST | `/api/routes/details` | Get travel times between stops |
| GET | `/api/routes/calculate` | Point-to-point travel time |

### Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/recommend/` | Get personalized recommendations |
| GET | `/recommend/activity-types` | List activity options |
| GET | `/recommend/price-ranges` | List budget options |

---

## 🎨 Screenshots

| Home | Preference Quiz | Recommendations |
|------|-----------------|-----------------|
| Dark theme hero | Step-by-step wizard | Scored results |

---

## 🗺️ Roadmap

- [x] City discovery with Google Places
- [x] Dynamic city autocomplete via Google Places API
- [x] Route optimization with TSP
- [x] Preference-based recommendations
- [ ] User authentication
- [ ] Save & share itineraries
- [ ] Embedded Google Maps
- [ ] Export to Google Calendar
- [ ] Mobile app (React Native)

---

## 📝 License

MIT License - feel free to use this for your own projects!

---

## 🙏 Acknowledgments

- Google Maps Platform for location APIs
- Vercel for Next.js hosting
- The open-source community

---

<p align="center">
  Made with ❤️ for California explorers
</p>