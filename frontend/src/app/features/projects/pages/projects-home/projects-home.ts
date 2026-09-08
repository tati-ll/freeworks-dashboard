import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';

import { Entregable } from '../../../../core/models/entregable';

import {
  EstadoProyecto,
  Proyecto,
} from '../../../../core/models/proyecto';

import { ProjectsApiService } from '../../../../core/services/projects-api.service';


@Component({
  selector: 'app-projects-home',
  standalone: false,
  templateUrl: './projects-home.html',
  styleUrl: './projects-home.scss',
})
export class ProjectsHomeComponent implements OnInit {

  proyectos: Proyecto[] = [];
  cargando = true;
  error = '';
  busqueda = '';
  filtroCliente = 'todos';
  filtroEstado = 'todos';
  filtroPrioridad = 'todos';
  fechaDesde = '';
  fechaHasta = '';
  mensajeEstado = '';
  errorEstado = '';

  actualizandoEstadoIds =
    new Set<number>();

  constructor(
    private projectsApi: ProjectsApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarProyectos();
  }

  cargarProyectos(): void {
    this.cargando = true;
    this.error = '';

    this.projectsApi.getProyectos().subscribe({
      next: (proyectos) => {
        this.proyectos = proyectos;
        this.cargando = false;

        this.cdr.markForCheck();
      },

      error: (error) => {
        console.error(
          'Error al cargar proyectos:',
          error
        );

        this.error =
          'No fue posible cargar los proyectos.';

        this.cargando = false;

        this.cdr.markForCheck();
      },
    });
  }

  get totalProyectos(): number {
    return this.proyectos.length;
  }

  get proyectosEnProgreso(): number {
    return this.proyectos.filter(
      (proyecto) =>
        proyecto.estado === 'en_progreso'
    ).length;
  }

  get proyectosPendientes(): number {
    return this.proyectos.filter(
      (proyecto) =>
        proyecto.estado === 'pendiente'
    ).length;
  }

  get proyectosFinalizados(): number {
    return this.proyectos.filter(
      (proyecto) =>
        proyecto.estado === 'finalizado'
    ).length;
  }

  get proyectosAtrasados(): number {
    return this.proyectos.filter(
      (proyecto) =>
        proyecto.esta_atrasado
    ).length;
  }

  get totalEntregables(): number {
    return this.proyectos.reduce(
      (total, proyecto) =>
        total + proyecto.total_entregables,
      0
    );
  }

  get totalEntregablesCompletados(): number {
    return this.proyectos.reduce(
      (total, proyecto) =>
        total +
        proyecto.entregables_completados,
      0
    );
  }

  get progresoPromedio(): number {
    if (this.proyectos.length === 0) {
      return 0;
    }

    const suma = this.proyectos.reduce(
      (total, proyecto) =>
        total + proyecto.progreso,
      0
    );

    return Math.round(
      suma / this.proyectos.length
    );
  }

  get porcentajeEntregablesCompletados(): number {
    if (this.totalEntregables === 0) {
      return 0;
    }

    return Math.round(
      (
        this.totalEntregablesCompletados /
        this.totalEntregables
      ) * 100
    );
  }

  get estadisticasEstado(): {
    etiqueta: string;
    cantidad: number;
    porcentaje: number;
    clase: string;
  }[] {
    const atrasados =
      this.proyectos.filter(
        (proyecto) =>
          proyecto.esta_atrasado
      ).length;

    const pendientes =
      this.proyectos.filter(
        (proyecto) =>
          !proyecto.esta_atrasado &&
          proyecto.estado === 'pendiente'
      ).length;

    const enProgreso =
      this.proyectos.filter(
        (proyecto) =>
          !proyecto.esta_atrasado &&
          proyecto.estado === 'en_progreso'
      ).length;

    const finalizados =
      this.proyectos.filter(
        (proyecto) =>
          proyecto.estado === 'finalizado'
      ).length;

    return [
      {
        etiqueta: 'Pendientes',
        cantidad: pendientes,
        porcentaje:
          this.calcularPorcentaje(
            pendientes
          ),
        clase: 'pending',
      },
      {
        etiqueta: 'En progreso',
        cantidad: enProgreso,
        porcentaje:
          this.calcularPorcentaje(
            enProgreso
          ),
        clase: 'progress',
      },
      {
        etiqueta: 'Finalizados',
        cantidad: finalizados,
        porcentaje:
          this.calcularPorcentaje(
            finalizados
          ),
        clase: 'finished',
      },
      {
        etiqueta: 'Atrasados',
        cantidad: atrasados,
        porcentaje:
          this.calcularPorcentaje(
            atrasados
          ),
        clase: 'overdue',
      },
    ];
  }  

  private calcularPorcentaje(
    cantidad: number
  ): number {
    if (this.totalProyectos === 0) {
      return 0;
    }

    return Math.round(
      (cantidad / this.totalProyectos) *
        100
    );
  }

  get entregasAtrasadas(): {
    proyecto: Proyecto;
    entregable: Entregable;
  }[] {
    const resultados: {
      proyecto: Proyecto;
      entregable: Entregable;
    }[] = [];

    for (
      const proyecto of this.proyectos
    ) {
      for (
        const entregable
        of proyecto.entregables
      ) {
        if (entregable.esta_atrasado) {
          resultados.push({
            proyecto,
            entregable,
          });
        }
      }
    }

    return resultados;
  }

  get hayAlertasAtraso(): boolean {
    return (
      this.proyectosAtrasados > 0 ||
      this.entregasAtrasadas.length > 0
    );
  }

  get clientesDisponibles(): string[] {
    return [
      ...new Set(
        this.proyectos
          .map((proyecto) => proyecto.cliente)
          .filter(Boolean)
      ),
    ].sort((a, b) =>
      a.localeCompare(b, 'es')
    );
  }
  
  private normalizarTexto(
    texto: string
  ): string {
    return texto
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
      .toLowerCase()
      .trim();
  }

  get proyectosFiltrados(): Proyecto[] {
    const termino =
      this.normalizarTexto(this.busqueda);

    return this.proyectos.filter(
      (proyecto) => {

        const coincideBusqueda =
          !termino ||
          this.normalizarTexto(
            proyecto.nombre
          ).includes(termino) ||
          this.normalizarTexto(
            proyecto.descripcion
          ).includes(termino) ||
          proyecto.entregables.some(
            (entregable) =>
              this.normalizarTexto(
                entregable.nombre
              ).includes(termino) ||
              this.normalizarTexto(
                entregable.descripcion
              ).includes(termino)
          );

        const coincideCliente =
          this.filtroCliente === 'todos' ||
          proyecto.cliente ===
            this.filtroCliente;

        const coincidePrioridad =
          this.filtroPrioridad === 'todos' ||
          proyecto.prioridad ===
            this.filtroPrioridad;

        const coincideEstado =
          this.filtroEstado === 'todos' ||
          (
            this.filtroEstado ===
              'atrasado'
              ? proyecto.esta_atrasado
              : proyecto.estado ===
                this.filtroEstado
          );

        const coincideFechaDesde =
          !this.fechaDesde ||
          proyecto.fecha_limite >=
            this.fechaDesde;

        const coincideFechaHasta =
          !this.fechaHasta ||
          proyecto.fecha_limite <=
            this.fechaHasta;

        return (
          coincideBusqueda &&
          coincideCliente &&
          coincidePrioridad &&
          coincideEstado &&
          coincideFechaDesde &&
          coincideFechaHasta
        );
      }
    );
  }

  get hayFiltrosActivos(): boolean {
    return (
      this.busqueda.trim() !== '' ||
      this.filtroCliente !== 'todos' ||
      this.filtroEstado !== 'todos' ||
      this.filtroPrioridad !== 'todos' ||
      this.fechaDesde !== '' ||
      this.fechaHasta !== ''
    );
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroCliente = 'todos';
    this.filtroEstado = 'todos';
    this.filtroPrioridad = 'todos';
    this.fechaDesde = '';
    this.fechaHasta = '';
  }

  cambiarEstado(
    proyecto: Proyecto,
    nuevoEstado: EstadoProyecto
  ): void {
    if (
      proyecto.estado === nuevoEstado
    ) {
      return;
    }

    this.mensajeEstado = '';
    this.errorEstado = '';

    this.actualizandoEstadoIds.add(
      proyecto.id
    );

    this.cdr.markForCheck();

    this.projectsApi
      .actualizarProyecto(
        proyecto.id,
        {
          estado: nuevoEstado,
        }
      )
      .subscribe({
        next: (proyectoActualizado) => {
          this.proyectos =
            this.proyectos.map(
              (item) =>
                item.id ===
                proyectoActualizado.id
                  ? proyectoActualizado
                  : item
            );

          this.actualizandoEstadoIds.delete(
            proyecto.id
          );

          this.mensajeEstado =
            `El estado de "${proyectoActualizado.nombre}" fue actualizado correctamente.`;

          this.cdr.markForCheck();
        },

        error: (error) => {
          console.error(
            'Error al cambiar estado:',
            error
          );

          this.actualizandoEstadoIds.delete(
            proyecto.id
          );

          const mensajeBackend =
            error?.error?.estado;

          if (
            Array.isArray(mensajeBackend)
          ) {
            this.errorEstado =
              String(mensajeBackend[0]);
          } else if (mensajeBackend) {
            this.errorEstado =
              String(mensajeBackend);
          } else {
            this.errorEstado =
              'No fue posible cambiar el estado del proyecto.';
          }

          this.cdr.markForCheck();
        },
      });
  }

  estaActualizandoEstado(
    proyectoId: number
  ): boolean {
    return this.actualizandoEstadoIds.has(
      proyectoId
    );
  }

  trackByProyectoId(
    _index: number,
    proyecto: Proyecto
  ): number {
    return proyecto.id;
  }
}