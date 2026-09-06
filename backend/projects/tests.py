from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Comentario, Entregable, Proyecto


class ProyectoAPITests(APITestCase):
    def setUp(self):
        hoy = timezone.localdate()

        self.proyecto = Proyecto.objects.create(
            nombre="Sitio web EcoMarket",
            descripcion="Desarrollo de plataforma de comercio electrónico.",
            cliente="EcoMarket",
            prioridad=Proyecto.Prioridad.ALTA,
            estado=Proyecto.Estado.EN_PROGRESO,
            fecha_inicio=hoy,
            fecha_limite=hoy + timedelta(days=30),
        )

    def test_listar_proyectos(self):
        response = self.client.get("/api/proyectos/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(
            response.data[0]["nombre"],
            "Sitio web EcoMarket",
        )

        self.assertIn("progreso", response.data[0])
        self.assertIn("estado_calculado", response.data[0])
        self.assertIn("entregables", response.data[0])
        self.assertIn("comentarios", response.data[0])

    def test_crear_proyecto(self):
        hoy = timezone.localdate()

        datos = {
            "nombre": "Aplicación corporativa",
            "descripcion": "Desarrollo de una aplicación para el cliente.",
            "cliente": "Cliente Demo",
            "prioridad": "media",
            "estado": "pendiente",
            "fecha_inicio": hoy.isoformat(),
            "fecha_limite": (hoy + timedelta(days=20)).isoformat(),
        }

        response = self.client.post(
            "/api/proyectos/",
            datos,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )
        self.assertTrue(
            Proyecto.objects.filter(
                nombre="Aplicación corporativa"
            ).exists()
        )

    def test_editar_proyecto(self):
        response = self.client.patch(
            f"/api/proyectos/{self.proyecto.id}/",
            {
                "nombre": "Sitio web EcoMarket actualizado",
                "prioridad": "media",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.proyecto.refresh_from_db()

        self.assertEqual(
            self.proyecto.nombre,
            "Sitio web EcoMarket actualizado",
        )
        self.assertEqual(
            self.proyecto.prioridad,
            Proyecto.Prioridad.MEDIA,
        )

    def test_eliminar_proyecto(self):
        hoy = timezone.localdate()

        proyecto_eliminar = Proyecto.objects.create(
            nombre="Proyecto temporal",
            descripcion="Proyecto utilizado para comprobar eliminación.",
            cliente="Cliente Temporal",
            prioridad=Proyecto.Prioridad.BAJA,
            estado=Proyecto.Estado.PENDIENTE,
            fecha_inicio=hoy,
            fecha_limite=hoy + timedelta(days=10),
        )

        response = self.client.delete(
            f"/api/proyectos/{proyecto_eliminar.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.assertFalse(
            Proyecto.objects.filter(
                id=proyecto_eliminar.id
            ).exists()
        )

    def test_rechazar_fechas_invalidas(self):
        hoy = timezone.localdate()

        datos = {
            "nombre": "Proyecto inválido",
            "descripcion": "Proyecto con fechas incorrectas para la prueba.",
            "cliente": "Cliente Demo",
            "prioridad": "alta",
            "estado": "pendiente",
            "fecha_inicio": (hoy + timedelta(days=10)).isoformat(),
            "fecha_limite": hoy.isoformat(),
        }

        response = self.client.post(
            "/api/proyectos/",
            datos,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn("fecha_limite", response.data)

    def test_calcular_progreso(self):
        hoy = timezone.localdate()

        Entregable.objects.create(
            proyecto=self.proyecto,
            nombre="Diseño inicial",
            descripcion="Primera propuesta visual del proyecto.",
            fecha_entrega=hoy + timedelta(days=5),
            entregado=True,
        )

        Entregable.objects.create(
            proyecto=self.proyecto,
            nombre="Integración final",
            descripcion="Integración completa de funcionalidades.",
            fecha_entrega=hoy + timedelta(days=15),
            entregado=False,
        )

        response = self.client.get(
            f"/api/proyectos/{self.proyecto.id}/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_entregables"], 2)
        self.assertEqual(response.data["entregables_completados"], 1)
        self.assertEqual(response.data["progreso"], 50)

    def test_no_finalizar_con_entregables_pendientes(self):
        hoy = timezone.localdate()

        Entregable.objects.create(
            proyecto=self.proyecto,
            nombre="Entrega pendiente",
            descripcion="Entregable todavía pendiente del proyecto.",
            fecha_entrega=hoy + timedelta(days=10),
            entregado=False,
        )

        response = self.client.patch(
            f"/api/proyectos/{self.proyecto.id}/",
            {"estado": "finalizado"},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn("estado", response.data)

    def test_finalizar_cuando_todo_esta_entregado(self):
        hoy = timezone.localdate()

        Entregable.objects.create(
            proyecto=self.proyecto,
            nombre="Entrega final",
            descripcion="Entregable completamente terminado.",
            fecha_entrega=hoy + timedelta(days=10),
            entregado=True,
        )

        response = self.client.patch(
            f"/api/proyectos/{self.proyecto.id}/",
            {"estado": "finalizado"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.proyecto.refresh_from_db()

        self.assertEqual(
            self.proyecto.estado,
            Proyecto.Estado.FINALIZADO,
        )

    def test_crear_entregable(self):
        hoy = timezone.localdate()

        datos = {
            "proyecto": self.proyecto.id,
            "nombre": "Manual del sistema",
            "descripcion": "Documentación final del sistema desarrollado.",
            "fecha_entrega": (
                hoy + timedelta(days=10)
            ).isoformat(),
            "archivo_simulado": "manual.pdf",
            "entregado": False,
        }

        response = self.client.post(
            "/api/entregables/",
            datos,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            Entregable.objects.filter(
                proyecto=self.proyecto
            ).count(),
            1,
        )

    def test_crear_comentario(self):
        datos = {
            "proyecto": self.proyecto.id,
            "autor": "EcoMarket",
            "texto": "El cliente solicita revisar el diseño.",
        }

        response = self.client.post(
            "/api/comentarios/",
            datos,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            Comentario.objects.filter(
                proyecto=self.proyecto
            ).count(),
            1,
        )

    def test_rechazar_comentario_demasiado_corto(self):
        datos = {
            "proyecto": self.proyecto.id,
            "autor": "EcoMarket",
            "texto": "Ok",
        }

        response = self.client.post(
            "/api/comentarios/",
            datos,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn("texto", response.data)