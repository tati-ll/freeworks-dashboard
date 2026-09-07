import { Component, Input } from '@angular/core';

import { Proyecto } from '../../../../core/models/proyecto';


@Component({
  selector: 'app-project-card',
  standalone: false,
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
})
export class ProjectCardComponent {

  @Input({ required: true })
  proyecto!: Proyecto;

  get estadoClase(): string {
    if (this.proyecto.esta_atrasado) {
      return 'status status--overdue';
    }

    switch (this.proyecto.estado) {
      case 'finalizado':
        return 'status status--finished';

      case 'en_progreso':
        return 'status status--progress';

      default:
        return 'status status--pending';
    }
  }

  get prioridadClase(): string {
    switch (this.proyecto.prioridad) {
      case 'alta':
        return 'priority priority--high';

      case 'media':
        return 'priority priority--medium';

      default:
        return 'priority priority--low';
    }
  }

  get prioridadTexto(): string {
    switch (this.proyecto.prioridad) {
      case 'alta':
        return 'Prioridad alta';

      case 'media':
        return 'Prioridad media';

      default:
        return 'Prioridad baja';
    }
  }
}