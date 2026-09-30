from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.founder import router as founder_router
from app.api.v1.company import router as company_router
from app.api.v1.execution import router as execution_router
from app.api.v1.product_documents import router as product_router
from app.api.v1.delivery import router as delivery_router
from app.api.v1.virtual_office import router as virtual_office_router
api_router=APIRouter()
for r in [health_router,founder_router,company_router,execution_router,product_router,delivery_router,virtual_office_router]: api_router.include_router(r)
