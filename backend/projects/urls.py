from rest_framework.routers import DefaultRouter

from .views import (
    ComentarioViewSet,
    EntregableViewSet,
    ProyectoViewSet,
)

router = DefaultRouter()

router.register(
    "proyectos",
    ProyectoViewSet,
    basename="proyecto",
)

router.register(
    "entregables",
    EntregableViewSet,
    basename="entregable",
)

router.register(
    "comentarios",
    ComentarioViewSet,
    basename="comentario",
)

urlpatterns = router.urls