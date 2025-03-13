from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReminderBase(BaseModel):
    userId: str
    title: str
    description: str
    reminderDate: str
    priority: str  # "baixa", "media", "alta"
    relatedConvenioId: Optional[str] = None
    relatedPendenciaId: Optional[str] = None

class ReminderCreate(ReminderBase):
    pass

class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    reminderDate: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None  # "pending", "completed"
    relatedConvenioId: Optional[str] = None
    relatedPendenciaId: Optional[str] = None

class ReminderInDB(ReminderBase):
    id: str
    created: str
    status: str  # "pending", "completed"

class ReminderResponse(ReminderInDB):
    pass