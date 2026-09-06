import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';

import { Proyecto } from '../../../../core/models/proyecto';
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

  constructor(
    private projectsApi: ProjectsApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarProyectos();
  }

  cargarProyectos(): void {
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
}