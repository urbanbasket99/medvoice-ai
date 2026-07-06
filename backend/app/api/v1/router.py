"""Aggregates all v1 routers into a single `APIRouter`."""

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.modules.patients.presentation.router import router as patients_router

api_v1_router = APIRouter()
api_v1_router.include_router(auth_router)
api_v1_router.include_router(patients_router)
