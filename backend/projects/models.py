from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

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

    @property
    def total_entregables(self):
        return self.entregables.count()

    @property
    def entregables_completados(self):
        return self.entregables.filter(entregado=True).count()

    @property
    def progreso(self):
        total = self.total_entregables

        if total == 0:
            return 0

        completados = self.entregables_completados
        return round((completados / total) * 100)

    @property
    def esta_atrasado(self):
        return (
            self.estado != self.Estado.FINALIZADO
            and self.fecha_limite < timezone.localdate()
        )

    @property
    def estado_calculado(self):
        if self.esta_atrasado:
            return "Atrasado"

        return self.get_estado_display()

    @property
    def puede_finalizar(self):
        if not self.pk:
            return False

        return (
            self.total_entregables > 0
            and not self.entregables.filter(entregado=False).exists()
        )

    def clean(self):
        errores = {}

        if self.nombre and len(self.nombre.strip()) < 3:
            errores["nombre"] = (
                "El nombre del proyecto debe tener al menos 3 caracteres."
            )

        if self.descripcion and len(self.descripcion.strip()) < 10:
            errores["descripcion"] = (
                "La descripción debe tener al menos 10 caracteres."
            )

        if self.cliente and len(self.cliente.strip()) < 2:
            errores["cliente"] = (
                "El nombre del cliente debe tener al menos 2 caracteres."
            )

        if (
            self.fecha_inicio
            and self.fecha_limite
            and self.fecha_limite < self.fecha_inicio
        ):
            errores["fecha_limite"] = (
                "La fecha límite no puede ser anterior a la fecha de inicio."
            )

        if self.estado == self.Estado.FINALIZADO:
            if not self.pk:
                errores["estado"] = (
                    "El proyecto debe crearse antes de poder marcarse "
                    "como finalizado."
                )
            elif not self.puede_finalizar:
                errores["estado"] = (
                    "No se puede finalizar el proyecto mientras tenga "
                    "entregables pendientes."
                )

        if errores:
            raise ValidationError(errores)

    def save(self, *args, **kwargs):
        if self.nombre:
            self.nombre = self.nombre.strip()

        if self.descripcion:
            self.descripcion = self.descripcion.strip()

        if self.cliente:
            self.cliente = self.cliente.strip()

        self.full_clean()
        return super().save(*args, **kwargs)

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

    @property
    def esta_atrasado(self):
        return (
            not self.entregado
            and self.fecha_entrega < timezone.localdate()
        )

    def clean(self):
        errores = {}

        if self.nombre and len(self.nombre.strip()) < 3:
            errores["nombre"] = (
                "El nombre del entregable debe tener al menos 3 caracteres."
            )

        if self.descripcion and len(self.descripcion.strip()) < 10:
            errores["descripcion"] = (
                "La descripción debe tener al menos 10 caracteres."
            )

        if self.proyecto_id and self.fecha_entrega:
            if self.fecha_entrega < self.proyecto.fecha_inicio:
                errores["fecha_entrega"] = (
                    "La fecha del entregable no puede ser anterior "
                    "al inicio del proyecto."
                )

            if self.fecha_entrega > self.proyecto.fecha_limite:
                errores["fecha_entrega"] = (
                    "La fecha del entregable no puede ser posterior "
                    "a la fecha límite del proyecto."
                )

        if errores:
            raise ValidationError(errores)

    def save(self, *args, **kwargs):
        if self.nombre:
            self.nombre = self.nombre.strip()

        if self.descripcion:
            self.descripcion = self.descripcion.strip()

        if self.archivo_simulado:
            self.archivo_simulado = self.archivo_simulado.strip()

        self.full_clean()
        return super().save(*args, **kwargs)

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

    def clean(self):
        errores = {}

        if self.autor and len(self.autor.strip()) < 2:
            errores["autor"] = (
                "El nombre del autor debe tener al menos 2 caracteres."
            )

        if self.texto and len(self.texto.strip()) < 5:
            errores["texto"] = (
                "El comentario debe tener al menos 5 caracteres."
            )

        if errores:
            raise ValidationError(errores)

    def save(self, *args, **kwargs):
        if self.autor:
            self.autor = self.autor.strip()

        if self.texto:
            self.texto = self.texto.strip()

        self.full_clean()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"Comentario de {self.autor} en {self.proyecto.nombre}"