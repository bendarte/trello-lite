from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import uuid
from typing import List
import logging
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import text

from database import get_db, engine, SessionLocal
from models import Base, Task as TaskModel
from schemas import Task, TaskCreate, TaskUpdate

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Task Management API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Error handler for all exceptions
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error handler caught: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "timestamp": datetime.utcnow().isoformat()}
    )

@app.get("/")
async def root():
    return {"message": "Task Management API"}

@app.get("/tasks", response_model=List[Task])
def get_tasks(db: Session = Depends(get_db)):
    try:
        return db.query(TaskModel).all()
    except Exception as e:
        logger.error(f"Error fetching tasks: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch tasks")

@app.post("/tasks", response_model=Task)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    try:
        db_task = TaskModel(
            id=str(uuid.uuid4()),
            title=task.title,
            description=task.description,
            status=task.status
        )
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return db_task
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating task: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create task")

@app.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: str, task: TaskUpdate, db: Session = Depends(get_db)):
    try:
        db_task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
        if not db_task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        update_data = task.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_task, field, value)
        
        db.commit()
        db.refresh(db_task)
        return db_task
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating task: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to update task")

@app.delete("/tasks/{task_id}")
def delete_task(task_id: str, db: Session = Depends(get_db)):
    try:
        db_task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
        if not db_task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        db.delete(db_task)
        db.commit()
        return {"message": "Task deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting task: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to delete task")

@app.get("/health")
async def health_check():
    try:
        # Try to create a db session to verify database connection
        db = SessionLocal()
        # Use text() for raw SQL queries
        result = db.execute(text("SELECT 1")).scalar()
        db.close()
        if result == 1:
            return {"status": "healthy", "database": "connected"}
        else:
            raise HTTPException(status_code=503, detail="Database check failed")
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Health check failed: {str(e)}") 