from rest_framework import serializers

from .models import Comentario, Entregable, Proyecto


class EntregableSerializer(serializers.ModelSerializer):
    esta_atrasado = serializers.ReadOnlyField()

    class Meta:
        model = Entregable
        fields = [
            "id",
            "proyecto",
            "nombre",
            "descripcion",
            "fecha_entrega",
            "archivo_simulado",
            "entregado",
            "esta_atrasado",
            "creado_en",
            "actualizado_en",
        ]
        read_only_fields = [
            "id",
            "esta_atrasado",
            "creado_en",
            "actualizado_en",
        ]

    def validate_nombre(self, value):
        value = value.strip()

        if len(value) < 3:
            raise serializers.ValidationError(
                "El nombre del entregable debe tener al menos 3 caracteres."
            )

        return value

    def validate_descripcion(self, value):
        value = value.strip()

        if len(value) < 10:
            raise serializers.ValidationError(
                "La descripción debe tener al menos 10 caracteres."
            )

        return value

    def validate(self, attrs):
        proyecto = attrs.get(
            "proyecto",
            self.instance.proyecto if self.instance else None,
        )

        fecha_entrega = attrs.get(
            "fecha_entrega",
            self.instance.fecha_entrega if self.instance else None,
        )

        if proyecto and fecha_entrega:
            if fecha_entrega < proyecto.fecha_inicio:
                raise serializers.ValidationError(
                    {
                        "fecha_entrega": (
                            "La fecha del entregable no puede ser anterior "
                            "al inicio del proyecto."
                        )
                    }
                )

            if fecha_entrega > proyecto.fecha_limite:
                raise serializers.ValidationError(
                    {
                        "fecha_entrega": (
                            "La fecha del entregable no puede ser posterior "
                            "a la fecha límite del proyecto."
                        )
                    }
                )

        return attrs


class ComentarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comentario
        fields = [
            "id",
            "proyecto",
            "autor",
            "texto",
            "fecha",
        ]
        read_only_fields = [
            "id",
            "fecha",
        ]

    def validate_autor(self, value):
        value = value.strip()

        if len(value) < 2:
            raise serializers.ValidationError(
                "El nombre del autor debe tener al menos 2 caracteres."
            )

        return value

    def validate_texto(self, value):
        value = value.strip()

        if len(value) < 5:
            raise serializers.ValidationError(
                "El comentario debe tener al menos 5 caracteres."
            )

        return value


class ProyectoSerializer(serializers.ModelSerializer):
    progreso = serializers.ReadOnlyField()
    total_entregables = serializers.ReadOnlyField()
    entregables_completados = serializers.ReadOnlyField()
    esta_atrasado = serializers.ReadOnlyField()
    estado_calculado = serializers.ReadOnlyField()
    puede_finalizar = serializers.ReadOnlyField()

    entregables = EntregableSerializer(
        many=True,
        read_only=True,
    )

    comentarios = ComentarioSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Proyecto
        fields = [
            "id",
            "nombre",
            "descripcion",
            "cliente",
            "prioridad",
            "estado",
            "fecha_inicio",
            "fecha_limite",
            "progreso",
            "total_entregables",
            "entregables_completados",
            "esta_atrasado",
            "estado_calculado",
            "puede_finalizar",
            "entregables",
            "comentarios",
            "creado_en",
            "actualizado_en",
        ]
        read_only_fields = [
            "id",
            "progreso",
            "total_entregables",
            "entregables_completados",
            "esta_atrasado",
            "estado_calculado",
            "puede_finalizar",
            "entregables",
            "comentarios",
            "creado_en",
            "actualizado_en",
        ]

    def validate_nombre(self, value):
        value = value.strip()

        if len(value) < 3:
            raise serializers.ValidationError(
                "El nombre del proyecto debe tener al menos 3 caracteres."
            )

        return value

    def validate_descripcion(self, value):
        value = value.strip()

        if len(value) < 10:
            raise serializers.ValidationError(
                "La descripción debe tener al menos 10 caracteres."
            )

        return value

    def validate_cliente(self, value):
        value = value.strip()

        if len(value) < 2:
            raise serializers.ValidationError(
                "El nombre del cliente debe tener al menos 2 caracteres."
            )

        return value

    def validate(self, attrs):
        fecha_inicio = attrs.get(
            "fecha_inicio",
            self.instance.fecha_inicio if self.instance else None,
        )

        fecha_limite = attrs.get(
            "fecha_limite",
            self.instance.fecha_limite if self.instance else None,
        )

        estado = attrs.get(
            "estado",
            self.instance.estado if self.instance else Proyecto.Estado.PENDIENTE,
        )

        if (
            fecha_inicio
            and fecha_limite
            and fecha_limite < fecha_inicio
        ):
            raise serializers.ValidationError(
                {
                    "fecha_limite": (
                        "La fecha límite no puede ser anterior "
                        "a la fecha de inicio."
                    )
                }
            )

        if estado == Proyecto.Estado.FINALIZADO:
            if self.instance is None:
                raise serializers.ValidationError(
                    {
                        "estado": (
                            "El proyecto debe crearse antes de poder "
                            "marcarse como finalizado."
                        )
                    }
                )

            if not self.instance.puede_finalizar:
                raise serializers.ValidationError(
                    {
                        "estado": (
                            "No se puede finalizar el proyecto mientras "
                            "tenga entregables pendientes."
                        )
                    }
                )

        return attrs