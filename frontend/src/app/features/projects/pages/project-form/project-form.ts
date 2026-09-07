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
  EstadoProyecto,
  PrioridadProyecto,
  Proyecto,
  ProyectoRequest,
} from '../../../../core/models/proyecto';
import { ProjectsApiService } from '../../../../core/services/projects-api.service';


@Component({
  selector: 'app-project-form',
  standalone: false,
  templateUrl: './project-form.html',
  styleUrl: './project-form.scss',
})
export class ProjectFormComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectsApi =
    inject(ProjectsApiService);
  private readonly cdr =
    inject(ChangeDetectorRef);

  proyectoId: number | null = null;
  proyectoActual: Proyecto | null = null;

  cargando = false;
  guardando = false;
  errorServidor = '';

  prioridades: {
    valor: PrioridadProyecto;
    texto: string;
  }[] = [
    {
      valor: 'baja',
      texto: 'Baja',
    },
    {
      valor: 'media',
      texto: 'Media',
    },
    {
      valor: 'alta',
      texto: 'Alta',
    },
  ];

  estadosBase: {
    valor: EstadoProyecto;
    texto: string;
  }[] = [
    {
      valor: 'pendiente',
      texto: 'Pendiente',
    },
    {
      valor: 'en_progreso',
      texto: 'En progreso',
    },
  ];

  form = this.fb.nonNullable.group(
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

      cliente: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(150),
        ],
      ],

      prioridad: [
        'media' as PrioridadProyecto,
        Validators.required,
      ],

      estado: [
        'pendiente' as EstadoProyecto,
        Validators.required,
      ],

      fecha_inicio: [
        '',
        Validators.required,
      ],

      fecha_limite: [
        '',
        Validators.required,
      ],
    },
    {
      validators: this.validadorFechas(),
    }
  );

  ngOnInit(): void {
    const id =
      this.route.snapshot.paramMap.get('id');

    if (id) {
      this.proyectoId = Number(id);
      this.cargarProyecto();
    }
  }

  get esEdicion(): boolean {
    return this.proyectoId !== null;
  }

  get tituloPagina(): string {
    return this.esEdicion
      ? 'Editar proyecto'
      : 'Nuevo proyecto';
  }

  get estadosDisponibles(): {
    valor: EstadoProyecto;
    texto: string;
  }[] {
    const estados = [...this.estadosBase];

    if (
      this.proyectoActual?.puede_finalizar ||
      this.proyectoActual?.estado === 'finalizado'
    ) {
      estados.push({
        valor: 'finalizado',
        texto: 'Finalizado',
      });
    }

    return estados;
  }

  get nombre() {
    return this.form.controls.nombre;
  }

  get descripcion() {
    return this.form.controls.descripcion;
  }

  get cliente() {
    return this.form.controls.cliente;
  }

  get prioridad() {
    return this.form.controls.prioridad;
  }

  get estado() {
    return this.form.controls.estado;
  }

  get fechaInicio() {
    return this.form.controls.fecha_inicio;
  }

  get fechaLimite() {
    return this.form.controls.fecha_limite;
  }

  cargarProyecto(): void {
    if (this.proyectoId === null) {
      return;
    }

    this.cargando = true;
    this.errorServidor = '';

    this.projectsApi
      .getProyecto(this.proyectoId)
      .subscribe({
        next: (proyecto) => {
          this.proyectoActual = proyecto;

          this.form.patchValue({
            nombre: proyecto.nombre,
            descripcion: proyecto.descripcion,
            cliente: proyecto.cliente,
            prioridad: proyecto.prioridad,
            estado: proyecto.estado,
            fecha_inicio: proyecto.fecha_inicio,
            fecha_limite: proyecto.fecha_limite,
          });

          this.cargando = false;
          this.cdr.markForCheck();
        },

        error: (error) => {
          console.error(
            'Error al cargar proyecto:',
            error
          );

          this.errorServidor =
            'No fue posible cargar el proyecto.';

          this.cargando = false;
          this.cdr.markForCheck();
        },
      });
  }

  guardar(): void {
    this.errorServidor = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value =
      this.form.getRawValue();

    const datos: ProyectoRequest = {
      nombre: value.nombre,
      descripcion: value.descripcion,
      cliente: value.cliente,
      prioridad: value.prioridad,
      estado: value.estado,
      fecha_inicio: value.fecha_inicio,
      fecha_limite: value.fecha_limite,
    };

    this.guardando = true;

    if (
      this.esEdicion &&
      this.proyectoId !== null
    ) {
      this.projectsApi
        .actualizarProyecto(
          this.proyectoId,
          datos
        )
        .subscribe({
          next: () => {
            this.guardando = false;
            this.cdr.markForCheck();

            this.router.navigate(['/']);
          },

          error: (error) => {
            this.procesarErrorServidor(error);
          },
        });

      return;
    }

    this.projectsApi
      .crearProyecto(datos)
      .subscribe({
        next: () => {
          this.guardando = false;
          this.cdr.markForCheck();

          this.router.navigate(['/']);
        },

        error: (error) => {
          this.procesarErrorServidor(error);
        },
      });
  }

  cancelar(): void {
    this.router.navigate(['/']);
  }

  private procesarErrorServidor(
    error: any
  ): void {
    console.error(
      'Error al guardar proyecto:',
      error
    );

    this.guardando = false;

    const errores = error?.error;

    if (
      errores &&
      typeof errores === 'object'
    ) {
      if (errores.nombre) {
        this.nombre.setErrors({
          servidor: this.extraerMensaje(
            errores.nombre
          ),
        });
      }

      if (errores.descripcion) {
        this.descripcion.setErrors({
          servidor: this.extraerMensaje(
            errores.descripcion
          ),
        });
      }

      if (errores.cliente) {
        this.cliente.setErrors({
          servidor: this.extraerMensaje(
            errores.cliente
          ),
        });
      }

      if (errores.fecha_inicio) {
        this.fechaInicio.setErrors({
          servidor: this.extraerMensaje(
            errores.fecha_inicio
          ),
        });
      }

      if (errores.fecha_limite) {
        this.fechaLimite.setErrors({
          servidor: this.extraerMensaje(
            errores.fecha_limite
          ),
        });
      }

      if (errores.estado) {
        this.estado.setErrors({
          servidor: this.extraerMensaje(
            errores.estado
          ),
        });
      }

      if (errores.prioridad) {
        this.prioridad.setErrors({
          servidor: this.extraerMensaje(
            errores.prioridad
          ),
        });
      }

      this.errorServidor =
        'Revisa los campos marcados antes de continuar.';
    } else {
      this.errorServidor =
        'No fue posible guardar el proyecto.';
    }

    this.cdr.markForCheck();
  }

  private extraerMensaje(
    valor: unknown
  ): string {
    if (Array.isArray(valor)) {
      return String(valor[0]);
    }

    return String(valor);
  }

  private validadorFechas(): ValidatorFn {
    return (
      control: AbstractControl
    ): ValidationErrors | null => {
      const inicio =
        control.get('fecha_inicio')?.value;

      const limite =
        control.get('fecha_limite')?.value;

      if (!inicio || !limite) {
        return null;
      }

      if (limite < inicio) {
        return {
          fechasInvalidas: true,
        };
      }

      return null;
    };
  }
}