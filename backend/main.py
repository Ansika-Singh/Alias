from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as AuthRouter
from routes.students import router as StudentRouter
from routes.timetable import router as TimetableRouter
from routes.attendance import router as AttendanceRouter
from routes.leaves import router as LeaveRouter
from routes.analytics import router as AnalyticsRouter
from routes.camera import router as CameraRouter
from routes.registration import router as RegistrationRouter
from routes.student_portal import router as StudentPortalRouter
from routes.qr import router as QRRouter
from routes.audit import router as AuditRouter
from services.scheduler import start_scheduler

app = FastAPI(title="ALIAS Backend API", description="Automated Live Identification & Attendance System")

@app.on_event("startup")
async def startup_event():
    start_scheduler()


# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173", # Vite default
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "https://alias-frontend.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to ALIAS Backend API"}

@app.get("/health", tags=["System"])
async def health_check():
    try:
        from database import client
        await client.admin.command('ping')
        return {"status": "online", "database": "connected"}
    except Exception as e:
        return {"status": "online", "database": f"error: {str(e)}"}

app.include_router(StudentRouter, tags=["Students"], prefix="/api/students")
app.include_router(TimetableRouter, tags=["Timetable"], prefix="/api/timetable")
app.include_router(AttendanceRouter, tags=["Attendance"], prefix="/api/attendance")
app.include_router(LeaveRouter, tags=["Leaves"], prefix="/api/leaves")
app.include_router(AnalyticsRouter, tags=["Analytics"], prefix="/api/analytics")
app.include_router(AuthRouter, tags=["Auth"], prefix="/api/auth")
app.include_router(CameraRouter, tags=["Camera"], prefix="/api/camera")
app.include_router(RegistrationRouter, tags=["Registration"], prefix="/api/registration")
app.include_router(StudentPortalRouter, tags=["Student Portal"], prefix="/api/portal")
app.include_router(QRRouter, tags=["QR Codes"], prefix="/api/qr")
app.include_router(AuditRouter, tags=["Audit Logs"], prefix="/api/audit")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
