from django.db import models


class Proyecto(models.Model):
    class Estado(models.TextChoices):
        PENDIENTE = "pendiente", "Pendiente"
        EN_PROGRESO = "en_progreso", "En progreso"
        FINALIZADO = "finalizado", "Finalizado"

    class Prioridad(models.TextChoices):
        BAJA = "baja", "Baja"
        MEDIA = "media", "Media"
        ALTA = "alta", "Alta"

    nombre = models.CharField(max_length=150)
    descripcion = models.TextField()
    cliente = models.CharField(max_length=150)
    prioridad = models.CharField(
        max_length=10,
        choices=Prioridad.choices,
        default=Prioridad.MEDIA,
    )
    estado = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.PENDIENTE,
    )
    fecha_inicio = models.DateField()
    fecha_limite = models.DateField()
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["fecha_limite", "nombre"]
        verbose_name = "Proyecto"
        verbose_name_plural = "Proyectos"

    def __str__(self):
        return self.nombre


class Entregable(models.Model):
    proyecto = models.ForeignKey(
        Proyecto,
        on_delete=models.CASCADE,
        related_name="entregables",
    )
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField()
    fecha_entrega = models.DateField()
    archivo_simulado = models.CharField(
        max_length=255,
        blank=True,
        default="",
    )
    entregado = models.BooleanField(default=False)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["fecha_entrega", "nombre"]
        verbose_name = "Entregable"
        verbose_name_plural = "Entregables"

    def __str__(self):
        return f"{self.nombre} - {self.proyecto.nombre}"


class Comentario(models.Model):
    proyecto = models.ForeignKey(
        Proyecto,
        on_delete=models.CASCADE,
        related_name="comentarios",
    )
    autor = models.CharField(
        max_length=150,
        default="Cliente",
    )
    texto = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-fecha"]
        verbose_name = "Comentario"
        verbose_name_plural = "Comentarios"

    def __str__(self):
        return f"Comentario de {self.autor} en {self.proyecto.nombre}"