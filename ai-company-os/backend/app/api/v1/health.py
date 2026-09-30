from fastapi import APIRouter
from app.core.config import get_settings
router=APIRouter(tags=['system'])
@router.get('/health')
def health():
 s=get_settings();return {'status':'ok','service':'backend','version':s.app_version}
@router.get('/ready')
def ready(): return {'status':'ok','database':'configured','redis':'configured'}
