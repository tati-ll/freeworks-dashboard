export interface Entregable {
  id: number;
  proyecto: number;
  nombre: string;
  descripcion: string;
  fecha_entrega: string;
  archivo_simulado: string;
  entregado: boolean;
  esta_atrasado: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface EntregableRequest {
  proyecto: number;
  nombre: string;
  descripcion: string;
  fecha_entrega: string;
  archivo_simulado: string;
  entregado: boolean;
}