import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from simulator import init_default_data, simulation_tick
from routers import auth, bins, simulation, vision, recommendations, collections, reports, settings

# Create all database tables
Base.metadata.create_all(bind=engine)

# Auto background simulation worker
simulation_active = True

async def periodic_simulation_worker():
    """Background task advancing simulated IoT sensor data every 8 seconds."""
    while simulation_active:
        await asyncio.sleep(8)
        try:
            db = SessionLocal()
            simulation_tick(db, multiplier=1.0)
            db.close()
        except Exception:
            pass

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Seed default data
    db = SessionLocal()
    try:
        init_default_data(db)
    finally:
        db.close()
    
    # Launch background simulation
    sim_task = asyncio.create_task(periodic_simulation_worker())
    yield
    # Shutdown
    global simulation_active
    simulation_active = False
    sim_task.cancel()

app = FastAPI(
    title="Smart Waste Management Digital Twin API",
    description="IoT Sensor Telemetry, OpenCV/YOLO Waste Classification, Leaflet Mapping, and Digital Twin System",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(bins.router)
app.include_router(simulation.router)
app.include_router(vision.router)
app.include_router(recommendations.router)
app.include_router(collections.router)
app.include_router(reports.router)
app.include_router(settings.router)

@app.get("/")
def root():
    return {
        "project": "Smart Waste Management Digital Twin",
        "status": "online",
        "docs_url": "/docs",
        "api_version": "1.0.0"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "Smart Waste API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
