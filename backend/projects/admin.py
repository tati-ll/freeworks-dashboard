from django.contrib import admin

from .models import Comentario, Entregable, Proyecto


@admin.register(Proyecto)
class ProyectoAdmin(admin.ModelAdmin):
    list_display = (
        "nombre",
        "cliente",
        "prioridad",
        "estado",
        "fecha_inicio",
        "fecha_limite",
    )
    list_filter = (
        "estado",
        "prioridad",
        "cliente",
    )
    search_fields = (
        "nombre",
        "descripcion",
        "cliente",
    )


@admin.register(Entregable)
class EntregableAdmin(admin.ModelAdmin):
    list_display = (
        "nombre",
        "proyecto",
        "fecha_entrega",
        "entregado",
    )
    list_filter = (
        "entregado",
        "fecha_entrega",
    )
    search_fields = (
        "nombre",
        "descripcion",
        "proyecto__nombre",
    )


@admin.register(Comentario)
class ComentarioAdmin(admin.ModelAdmin):
    list_display = (
        "proyecto",
        "autor",
        "fecha",
    )
    search_fields = (
        "autor",
        "texto",
        "proyecto__nombre",
    )