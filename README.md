# FreeWorks Dashboard

Panel de control web para la gestión de proyectos de trabajadores freelance, desarrollado como MVP para la startup ficticia **FreeWorks**.

La aplicación permite administrar proyectos, entregables, avances, comentarios de clientes, estados, filtros, búsquedas, estadísticas y alertas de atraso mediante un frontend desarrollado en Angular y una API REST desarrollada con Django.

## Tecnologías utilizadas

### Frontend

- Angular
- Angular Material
- TypeScript
- SCSS
- Nginx para servir la aplicación mediante Docker

### Backend

- Python
- Django
- Django REST Framework
- django-cors-headers
- SQLite

### Herramientas

- Git y GitHub
- Docker
- Docker Compose

## Funcionalidades

- Listado de proyectos.
- Clasificación de proyectos por estado:
  - Pendiente
  - En progreso
  - Finalizado
  - Atrasado, calculado automáticamente.
- Gestión manual del estado de los proyectos.
- Creación y edición de proyectos.
- Validaciones de formularios en frontend y backend.
- Gestión de entregables.
- Registro de fecha, descripción y archivo simulado por entregable.
- Marcado de entregables como pendientes o entregados.
- Cálculo automático del porcentaje de progreso.
- Registro y visualización de comentarios del cliente.
- Filtros por cliente, estado, prioridad y fecha límite.
- Búsqueda por nombre y descripción de proyectos y entregables.
- Estadísticas visuales del estado de los proyectos.
- Resumen del progreso y entregables completados.
- Alertas para proyectos y entregables atrasados.
- Diseño responsive para escritorio, tablet y dispositivos móviles.

## Estructura general

```text
freeworks-dashboard/
│
├── backend/
│   ├── config/
│   ├── projects/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── nginx.conf
│   ├── angular.json
│   ├── package.json
│   └── package-lock.json
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Modelo de datos

La aplicación utiliza tres entidades principales:

### Proyecto

Contiene información como:

- nombre;
- descripción;
- cliente;
- prioridad;
- estado;
- fecha de inicio;
- fecha límite.

### Entregable

Cada entregable pertenece a un proyecto mediante una relación `ForeignKey`.

Contiene:

- nombre;
- descripción;
- fecha de entrega;
- archivo simulado;
- estado entregado/pendiente.

### Comentario

Cada comentario pertenece a un proyecto mediante una relación `ForeignKey`.

Contiene:

- autor;
- texto;
- fecha de registro.

## Lógica de negocio

El porcentaje de progreso se calcula automáticamente de acuerdo con los entregables:

```text
entregables completados
─────────────────────── × 100
entregables totales
```

Un proyecto se considera atrasado cuando su fecha límite ya pasó y no se encuentra finalizado.

Un entregable se considera atrasado cuando su fecha de entrega ya pasó y todavía no ha sido marcado como entregado.

Un proyecto solo puede pasar al estado `Finalizado` cuando posee entregables y todos ellos han sido completados.

---

# Ejecución local

## Requisitos

Para ejecutar el proyecto localmente se requiere:

- Python 3
- Node.js
- npm
- Angular CLI

## 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd freeworks-dashboard
```

## 2. Backend

Entrar a la carpeta:

```bash
cd backend
```

Crear un entorno virtual:

### Windows PowerShell

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Instalar dependencias:

```bash
pip install -r requirements.txt
```

Aplicar migraciones:

```bash
python manage.py migrate
```

Ejecutar Django:

```bash
python manage.py runserver
```

El backend estará disponible en:

```text
http://127.0.0.1:8000
```

API REST:

```text
http://127.0.0.1:8000/api/
```

## 3. Frontend

Desde otra terminal:

```bash
cd frontend
```

Instalar dependencias:

```bash
npm install
```

Ejecutar Angular:

```bash
ng serve
```

El frontend estará disponible en:

```text
http://localhost:4200
```

---

# Ejecución mediante Docker

## Requisito

- Docker Desktop o Docker Engine con Docker Compose.

Desde la raíz del repositorio:

```bash
docker compose up --build
```

También puede ejecutarse en segundo plano:

```bash
docker compose up -d --build
```

Una vez iniciados los contenedores:

### Frontend

```text
http://localhost:8080
```

### Backend

```text
http://localhost:8000
```

### API REST

```text
http://localhost:8000/api/
```

Para revisar los contenedores:

```bash
docker compose ps
```

Para detener la aplicación:

```bash
docker compose down
```

La base SQLite utilizada por Docker se almacena en un volumen persistente.

Para conservar los datos, no utilizar `docker compose down -v`, ya que la opción `-v` elimina los volúmenes.

---

# API REST

Principales endpoints:

```text
GET    /api/proyectos/
POST   /api/proyectos/
GET    /api/proyectos/{id}/
PATCH  /api/proyectos/{id}/
DELETE /api/proyectos/{id}/

GET    /api/entregables/
POST   /api/entregables/
PATCH  /api/entregables/{id}/
DELETE /api/entregables/{id}/

GET    /api/comentarios/
POST   /api/comentarios/
PATCH  /api/comentarios/{id}/
DELETE /api/comentarios/{id}/
```

## Pruebas del backend

Desde la carpeta `backend`, con el entorno virtual activo:

```bash
python manage.py test projects
```

También puede comprobarse la configuración de Django mediante:

```bash
python manage.py check
```

## Compilación del frontend

Desde la carpeta `frontend`:

```bash
ng build
```

## Control de versiones

El proyecto utiliza Git y GitHub.

El desarrollo se realizó utilizando ramas `feature/*` y commits significativos para registrar las distintas etapas de implementación.

## Autor

Proyecto académico desarrollado para la asignatura Aplicaciones y Tecnologías de la Web.
Estudiante: Tatiana Llaña. 