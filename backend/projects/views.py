from rest_framework import viewsets

from .models import Comentario, Entregable, Proyecto
from .serializers import (
    ComentarioSerializer,
    EntregableSerializer,
    ProyectoSerializer,
)


class ProyectoViewSet(viewsets.ModelViewSet):
    queryset = Proyecto.objects.prefetch_related(
        "entregables",
        "comentarios",
    ).all()
    serializer_class = ProyectoSerializer


class EntregableViewSet(viewsets.ModelViewSet):
    queryset = Entregable.objects.select_related(
        "proyecto",
    ).all()
    serializer_class = EntregableSerializer


class ComentarioViewSet(viewsets.ModelViewSet):
    queryset = Comentario.objects.select_related(
        "proyecto",
    ).all()
    serializer_class = ComentarioSerializer