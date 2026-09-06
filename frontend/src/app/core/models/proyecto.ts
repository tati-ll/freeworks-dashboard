import { Comentario } from './comentario';
import { Entregable } from './entregable';

export type PrioridadProyecto = 'baja' | 'media' | 'alta';

export type EstadoProyecto =
  | 'pendiente'
  | 'en_progreso'
  | 'finalizado';

export interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  cliente: string;
  prioridad: PrioridadProyecto;
  estado: EstadoProyecto;
  fecha_inicio: string;
  fecha_limite: string;

  progreso: number;
  total_entregables: number;
  entregables_completados: number;

  esta_atrasado: boolean;
  estado_calculado: string;
  puede_finalizar: boolean;

  entregables: Entregable[];
  comentarios: Comentario[];

  creado_en: string;
  actualizado_en: string;
}

export interface ProyectoRequest {
  nombre: string;
  descripcion: string;
  cliente: string;
  prioridad: PrioridadProyecto;
  estado: EstadoProyecto;
  fecha_inicio: string;
  fecha_limite: string;
}