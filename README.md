<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/Google_Maps-API-4285F4?style=for-the-badge&logo=google-maps" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=for-the-badge&logo=tailwind-css" />
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python" />
</p>

# 🧭 Odyssey

**The smartest California day trip planner.** Search a city, tell us your vibe, and get an AI-optimized itinerary with real-time routing.

## 🌐 Live Demo

| | URL |
|--|-----|
| **Frontend** | [odyssey-app-deepsheth.vercel.app](https://odyssey-app-deepsheth.vercel.app/) |
| **Backend API** | [odyssey-8xog.onrender.com](https://odyssey-8xog.onrender.com) |

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **Smart City Discovery** | Dynamic autocomplete with Google Places API for any California city |
| 🎯 **Personalized Recommendations** | Interactive quiz + AI-powered scoring matching places to your preferences |
| 🗺️ **Route Optimization** | TSP algorithm minimizes travel time, shows savings vs unoptimized routes |
| 🔐 **User Authentication** | JWT-based auth with password validation (8+ chars, uppercase, lowercase, number) |
| ⚡ **Performance** | 7-day cache TTL, sub-2s responses, rate limiting for API protection |
| 🤖 **AI Vibe Search** | Natural language queries like "cozy coffee shop with wifi" |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Next.js 16)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Pages     │  │ Components  │  │  Context    │  │    API Service      │ │
│  │  /discover  │  │  Navbar     │  │ AuthContext │  │  services/api.ts    │ │
│  │  /recommend │  │  PlaceCard  │  │             │  │                     │ │
│  │  /itinerary │  │  ItinMap    │  │             │  │                     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼ HTTP/REST
┌─────────────────────────────────────────────────────────────────────────────┐
│                            BACKEND (FastAPI)                                │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                           API Layer (api/)                           │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────────────┐ │   │
│  │  │ places.py  │ │ routes.py  │ │recommend.py│ │ auth.py / users.py │ │   │
│  │  │ /discover  │ │ /optimize  │ │ /recommend │ │ /register /token   │ │   │
│  │  │ /search    │ │ /details   │ │            │ │ /me/history        │ │   │
│  │  │ /autocomp  │ │ /calculate │ │            │ │                    │ │   │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         Core Layer (core/)                           │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ ┌──────────────┐  │   │
│  │  │ config   │ │ security │ │ database │ │limiter │ │route_optimizer│ │   │
│  │  │ Settings │ │ JWT/Auth │ │SQLAlchemy│ │SlowAPI │ │  TSP Algo    │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘ └──────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                       Services Layer (services/)                     │   │
│  │  ┌────────────────┐ ┌────────────────┐ ┌────────────────────────────┐│   │
│  │  │ places_service │ │  ai_service    │ │ recommendation_system     ││   │
│  │  │ Google Places  │ │ OpenAI Parser  │ │ Scoring Algorithm         ││   │
│  │  └────────────────┘ └────────────────┘ └────────────────────────────┘│   │
│  │  ┌────────────────┐                                                  │   │
│  │  │ cache_service  │                                                  │   │
│  │  │ In-Memory/Redis│                                                  │   │
│  │  └────────────────┘                                                  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
            ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
            │Google Places│   │Google Maps  │   │   OpenAI    │
            │     API     │   │ Directions  │   │   GPT-4     │
            └─────────────┘   └─────────────┘   └─────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 16, React 19, TailwindCSS 4 | Server-side rendering, styling |
| **Animations** | Framer Motion, Lenis | Smooth scrolling, transitions |
| **Backend** | FastAPI, Python 3.11+, Pydantic | REST API, validation |
| **Auth** | JWT (python-jose), bcrypt | Token-based authentication |
| **Database** | SQLAlchemy, SQLite/PostgreSQL | User data, search history |
| **Caching** | In-memory (Redis-ready) | 7-day TTL for API responses |
| **Rate Limiting** | SlowAPI | 100/min global, 10/min expensive |
| **External APIs** | Google Maps, Places, OpenAI | Location data, AI parsing |

---

## 📁 Project Structure

```
Odyssey/
├── frontend/                      # Next.js 16 Application
│   ├── app/                       # App Router pages
│   │   ├── discover/[city]/       # City exploration page
│   │   ├── recommend/             # Preference quiz
│   │   ├── itinerary/             # Itinerary builder
│   │   ├── login/ & signup/       # Authentication pages
│   │   └── page.tsx               # Landing page
│   ├── components/                # Reusable UI components
│   │   ├── Navbar.tsx             # Navigation bar
│   │   ├── PlaceCard.tsx          # Place display card
│   │   └── ItineraryMap.tsx       # Google Maps integration
│   ├── context/
│   │   └── AuthContext.tsx        # Authentication state
│   ├── services/
│   │   └── api.ts                 # Backend API client
│   └── package.json
│
├── backend/                       # FastAPI Application
│   ├── api/                       # Route handlers
│   │   ├── main.py                # App entry, middleware, CORS
│   │   ├── places.py              # /api/places/* endpoints
│   │   ├── routes.py              # /api/routes/* endpoints
│   │   ├── recommend.py           # /api/recommend/* endpoints
│   │   ├── auth.py                # /api/auth/* endpoints
│   │   └── users.py               # /api/users/* endpoints
│   │
│   ├── core/                      # Core utilities
│   │   ├── config.py              # Environment settings (Pydantic)
│   │   ├── security.py            # JWT, password hashing
│   │   ├── database.py            # SQLAlchemy setup
│   │   ├── limiter.py             # Rate limiting config
│   │   ├── deps.py                # FastAPI dependencies
│   │   ├── logging.py             # Logging configuration
│   │   └── route_optimizer.py     # TSP algorithm
│   │
│   ├── models/                    # Data models
│   │   ├── db.py                  # SQLAlchemy models (User, History)
│   │   ├── place.py               # Place Pydantic model
│   │   └── user_preferance.py     # User preference model
│   │
│   ├── services/                  # Business logic
│   │   ├── places_service.py      # Google Places integration
│   │   ├── ai_service.py          # OpenAI vibe parsing
│   │   ├── recommendation_system.py # Scoring algorithm
│   │   └── cache_service.py       # Caching layer
│   │
│   ├── tests/                     # Pytest test suite
│   │   ├── test_auth.py           # Auth & password validation
│   │   ├── test_places.py         # Places API tests
│   │   ├── test_recommend.py      # Recommendation tests
│   │   ├── test_routes.py         # Route optimization tests
│   │   └── test_rate_limit.py     # Rate limiting tests
│   │
│   ├── .env.example               # Environment template
│   └── requirements.txt           # Python dependencies
│
├── .gitignore
├── pytest.ini
└── README.md
```

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user (validates password strength) |
| POST | `/api/auth/token` | Login, returns JWT token |

### Places
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/places/discover/{city}` | Discover places by city & categories |
| GET | `/api/places/search?q=...&city=...` | AI-powered search with vibe parsing |
| GET | `/api/places/autocomplete?q=...` | California city autocomplete |
| GET | `/api/places/detail/{place_id}` | Get place details |
| GET | `/api/places/categories` | List available categories |

### Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/routes/optimize` | TSP optimization for stop order |
| POST | `/api/routes/details` | Get travel times between stops |
| GET | `/api/routes/calculate?origin=...&destination=...` | Point-to-point travel time |

### Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/recommend/` | Get personalized recommendations |
| GET | `/api/recommend/activity-types` | List activity options |
| GET | `/api/recommend/price-ranges` | List budget options |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me/history` | Get user's search history (requires auth) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Google Cloud Platform account with Maps/Places API enabled

### 1. Clone & Install

```bash
git clone https://github.com/deepsheth3/Odyssey.git
cd Odyssey

# Frontend
cd frontend && npm install

# Backend
cd ../backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

Copy the example and fill in your keys:
```bash
cp backend/.env.example backend/.env
```

Required variables in `backend/.env`:
```env
# CRITICAL: Generate with `openssl rand -hex 32`
SECRET_KEY=your-secret-key-here

# Google APIs
GOOGLE_MAPS_API_KEY=your-google-api-key

# Optional: OpenAI for AI search
OPENAI_API_KEY=your-openai-key

# Optional: CORS origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,https://your-domain.com
```

### 3. Run Development Servers

```bash
# Terminal 1 - Backend
cd Odyssey
source backend/.venv/bin/activate
uvicorn backend.api.main:app --reload --port 8000

# Terminal 2 - Frontend
cd Odyssey/frontend
npm run dev
```

### 4. Open the App
- **Frontend:** http://localhost:3000
- **API Docs:** http://localhost:8000/docs

---

## 🧪 Testing

```bash
# Activate venv and run tests
source backend/.venv/bin/activate
pytest backend/tests/ -v

# Expected: 24 passed tests
```

Test coverage includes:
- ✅ Password validation (strength requirements)
- ✅ Authentication flow (register, login)
- ✅ Places discovery & search
- ✅ Route optimization
- ✅ Recommendations
- ✅ Rate limiting

---

## 🔒 Security Features

| Feature | Implementation |
|---------|----------------|
| **JWT Authentication** | Tokens expire in 60 min, SECRET_KEY from env |
| **Password Validation** | Min 8 chars, uppercase, lowercase, number |
| **Rate Limiting** | 100 req/min global, 10 req/min for expensive endpoints |
| **CORS** | Configurable via environment variable |
| **Environment Secrets** | No hardcoded keys, fails in production if missing |

---

## 🗺️ Roadmap

- [x] City discovery with Google Places
- [x] Dynamic city autocomplete
- [x] Route optimization with TSP
- [x] Preference-based recommendations
- [x] User authentication with JWT
- [x] AI-powered vibe search
- [x] Comprehensive test suite (24 tests)
- [ ] Save & share itineraries
- [ ] Embedded Google Maps in itinerary
- [ ] Export to Google Calendar
- [ ] Mobile app (React Native)

---

## 📝 License

MIT License - feel free to use this for your own projects!

---

## 🙏 Acknowledgments

- Google Maps Platform for location APIs
- OpenAI for natural language parsing
- Vercel for Next.js hosting
- The open-source community

---

<p align="center">
  Made with ❤️ for California explorers
</p>