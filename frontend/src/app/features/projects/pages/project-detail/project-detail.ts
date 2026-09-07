import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';

import {
  Comentario,
  ComentarioRequest,
} from '../../../../core/models/comentario';

import {
  Entregable,
  EntregableRequest,
} from '../../../../core/models/entregable';

import { Proyecto } from '../../../../core/models/proyecto';
import { ProjectsApiService } from '../../../../core/services/projects-api.service';


@Component({
  selector: 'app-project-detail',
  standalone: false,
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.scss',
})
export class ProjectDetailComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectsApi =
    inject(ProjectsApiService);
  private readonly cdr =
    inject(ChangeDetectorRef);

  proyecto: Proyecto | null = null;

  cargando = true;
  guardandoEntregable = false;
  guardandoComentario = false;

  eliminandoComentarioIds =
    new Set<number>();

  actualizandoEntregableIds =
    new Set<number>();

  eliminandoEntregableIds =
    new Set<number>();

  mensaje = '';
  error = '';

  entregableForm = this.fb.nonNullable.group(
    {
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(150),
        ],
      ],

      descripcion: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
        ],
      ],

      fecha_entrega: [
        '',
        [
          Validators.required,
          this.fechaDentroProyectoValidator(),
        ],
      ],

      archivo_simulado: [
        '',
        Validators.maxLength(255),
      ],
    }
  );

  comentarioForm = this.fb.nonNullable.group({
    autor: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(150),
      ],
    ],

    texto: [
      '',
      [
        Validators.required,
        Validators.minLength(5),
      ],
    ],
  });

  ngOnInit(): void {
    this.cargarProyecto();
  }

  get nombre() {
    return this.entregableForm.controls.nombre;
  }

  get descripcion() {
    return this.entregableForm.controls.descripcion;
  }

  get fechaEntrega() {
    return this.entregableForm.controls.fecha_entrega;
  }

  get archivoSimulado() {
    return this.entregableForm.controls.archivo_simulado;
  }

  get autorComentario() {
  return this.comentarioForm.controls.autor;
  }

  get textoComentario() {
    return this.comentarioForm.controls.texto;
  }

  cargarProyecto(
    mostrarCarga = true
  ): void {
    const id =
      Number(
        this.route.snapshot.paramMap.get('id')
      );

    if (!id) {
      this.error =
        'No se encontró el proyecto solicitado.';
      this.cargando = false;
      return;
    }

    if (mostrarCarga) {
      this.cargando = true;
    }

    this.projectsApi
      .getProyecto(id)
      .subscribe({
        next: (proyecto) => {
          this.proyecto = proyecto;

          this.fechaEntrega
            .updateValueAndValidity();

          this.cargando = false;
          this.cdr.markForCheck();
        },

        error: (error) => {
          console.error(
            'Error al cargar proyecto:',
            error
          );

          this.error =
            'No fue posible cargar el proyecto.';

          this.cargando = false;
          this.cdr.markForCheck();
        },
      });
  }

  agregarEntregable(): void {
    this.mensaje = '';
    this.error = '';

    this.fechaEntrega
      .updateValueAndValidity();

    if (
      this.entregableForm.invalid ||
      !this.proyecto
    ) {
      this.entregableForm.markAllAsTouched();
      return;
    }

    const value =
      this.entregableForm.getRawValue();

    const datos: EntregableRequest = {
      proyecto: this.proyecto.id,
      nombre: value.nombre,
      descripcion: value.descripcion,
      fecha_entrega: value.fecha_entrega,
      archivo_simulado:
        value.archivo_simulado,
      entregado: false,
    };

    this.guardandoEntregable = true;

    this.projectsApi
      .crearEntregable(datos)
      .subscribe({
        next: () => {
          this.guardandoEntregable = false;

          this.entregableForm.reset({
            nombre: '',
            descripcion: '',
            fecha_entrega: '',
            archivo_simulado: '',
          });

          this.mensaje =
            'Entregable agregado correctamente.';

          this.cargarProyecto(false);
          this.cdr.markForCheck();
        },

        error: (error) => {
          console.error(
            'Error al crear entregable:',
            error
          );

          this.guardandoEntregable = false;

          this.error =
            this.obtenerMensajeError(
              error,
              'No fue posible agregar el entregable.'
            );

          this.cdr.markForCheck();
        },
      });
  }

  cambiarEstadoEntregable(
    entregable: Entregable
  ): void {
    if (!this.proyecto) {
      return;
    }

    if (
      this.proyecto.estado === 'finalizado'
    ) {
      this.error =
        'Un proyecto finalizado no puede modificar sus entregables.';
      return;
    }

    this.mensaje = '';
    this.error = '';

    this.actualizandoEntregableIds.add(
      entregable.id
    );

    this.projectsApi
      .actualizarEntregable(
        entregable.id,
        {
          entregado: !entregable.entregado,
        }
      )
      .subscribe({
        next: () => {
          this.actualizandoEntregableIds.delete(
            entregable.id
          );

          this.mensaje =
            'Estado del entregable actualizado.';

          this.cargarProyecto(false);
          this.cdr.markForCheck();
        },

        error: (error) => {
          console.error(
            'Error al actualizar entregable:',
            error
          );

          this.actualizandoEntregableIds.delete(
            entregable.id
          );

          this.error =
            this.obtenerMensajeError(
              error,
              'No fue posible actualizar el entregable.'
            );

          this.cdr.markForCheck();
        },
      });
  }

  eliminarEntregable(
    entregable: Entregable
  ): void {
    if (!this.proyecto) {
      return;
    }

    if (
      this.proyecto.estado === 'finalizado'
    ) {
      this.error =
        'Un proyecto finalizado no puede eliminar entregables.';
      return;
    }

    const confirmar = window.confirm(
      `¿Eliminar el entregable "${entregable.nombre}"?`
    );

    if (!confirmar) {
      return;
    }

    this.mensaje = '';
    this.error = '';

    this.eliminandoEntregableIds.add(
      entregable.id
    );

    this.projectsApi
      .eliminarEntregable(entregable.id)
      .subscribe({
        next: () => {
          this.eliminandoEntregableIds.delete(
            entregable.id
          );

          this.mensaje =
            'Entregable eliminado correctamente.';

          this.cargarProyecto(false);
          this.cdr.markForCheck();
        },

        error: (error) => {
          console.error(
            'Error al eliminar entregable:',
            error
          );

          this.eliminandoEntregableIds.delete(
            entregable.id
          );

          this.error =
            'No fue posible eliminar el entregable.';

          this.cdr.markForCheck();
        },
      });
  }

  estaActualizando(
    id: number
  ): boolean {
    return (
      this.actualizandoEntregableIds.has(id) ||
      this.eliminandoEntregableIds.has(id)
    );
  }

  agregarComentario(): void {
    this.mensaje = '';
    this.error = '';

    if (
      this.comentarioForm.invalid ||
      !this.proyecto
    ) {
      this.comentarioForm.markAllAsTouched();
      return;
    }

    const value =
      this.comentarioForm.getRawValue();

    const datos: ComentarioRequest = {
      proyecto: this.proyecto.id,
      autor: value.autor,
      texto: value.texto,
    };

    this.guardandoComentario = true;

    this.projectsApi
      .crearComentario(datos)
      .subscribe({
        next: () => {
          this.guardandoComentario = false;

          this.comentarioForm.reset({
            autor: '',
            texto: '',
          });

          this.mensaje =
            'Comentario registrado correctamente.';

          this.cargarProyecto(false);
          this.cdr.markForCheck();
        },

        error: (error) => {
          console.error(
            'Error al registrar comentario:',
            error
          );

          this.guardandoComentario = false;

          this.error =
            this.obtenerMensajeError(
              error,
              'No fue posible registrar el comentario.'
            );

          this.cdr.markForCheck();
        },
      });
  }

  eliminarComentario(
    comentario: Comentario
  ): void {
    const confirmar = window.confirm(
      `¿Eliminar el comentario de "${comentario.autor}"?`
    );

    if (!confirmar) {
      return;
    }

    this.mensaje = '';
    this.error = '';

    this.eliminandoComentarioIds.add(
      comentario.id
    );

    this.projectsApi
      .eliminarComentario(comentario.id)
      .subscribe({
        next: () => {
          this.eliminandoComentarioIds.delete(
            comentario.id
          );

          this.mensaje =
            'Comentario eliminado correctamente.';

          this.cargarProyecto(false);
          this.cdr.markForCheck();
        },

        error: (error) => {
          console.error(
            'Error al eliminar comentario:',
            error
          );

          this.eliminandoComentarioIds.delete(
            comentario.id
          );

          this.error =
            'No fue posible eliminar el comentario.';

          this.cdr.markForCheck();
        },
      });
  }

  estaEliminandoComentario(
    id: number
  ): boolean {
    return this.eliminandoComentarioIds.has(id);
  }

  volver(): void {
    this.router.navigate(['/']);
  }

  private fechaDentroProyectoValidator():
    ValidatorFn {
    return (
      control: AbstractControl
    ): ValidationErrors | null => {
      if (
        !control.value ||
        !this.proyecto
      ) {
        return null;
      }

      const fecha = control.value;

      if (
        fecha < this.proyecto.fecha_inicio ||
        fecha > this.proyecto.fecha_limite
      ) {
        return {
          fueraDeRango: true,
        };
      }

      return null;
    };
  }

  private obtenerMensajeError(
    error: any,
    mensajeDefault: string
  ): string {
    const errores = error?.error;

    if (
      errores &&
      typeof errores === 'object'
    ) {
      const primeraClave =
        Object.keys(errores)[0];

      if (primeraClave) {
        const valor =
          errores[primeraClave];

        if (Array.isArray(valor)) {
          return String(valor[0]);
        }

        return String(valor);
      }
    }

    return mensajeDefault;
  }
}