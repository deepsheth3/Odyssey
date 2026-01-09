from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from backend.core.logging import configure_logging, get_logger
from backend.api.routes import router as routes_router
from backend.api.places import router as places_router
from contextlib import asynccontextmanager
import time 
from backend.api.reccomend import router as recommend_router

#1 Configure Login on Startup

@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    logger = get_logger('Odyssey.main')
    logger.info('Starting Application...')
    yield
    logger.info('Shutting Down Application...')

app = FastAPI(lifespan=lifespan)
logger = get_logger('Odyssey.main')

# Include routers
app.include_router(routes_router)
app.include_router(places_router)
app.include_router(recommend_router)

# 2. Middleware for Request Logging
@app.middleware('http')
async def log_request(request: Request, call_next):
    start_time = time.time()

    response = await call_next(request)

    process_time = time.time() - start_time
    formatted_process_time = f'{process_time:.4f}s'

    logger.info(
        f'{request.method} {request.url.path} | {response.status_code} | Time : {formatted_process_time}'
    )

    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/api/health')
async def health_check():
    logger.info('Health check requested')
    return {
        'status': 'ok',
        'message': 'Odyssey backend is running'
    }

