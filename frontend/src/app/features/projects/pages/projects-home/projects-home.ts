import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';

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