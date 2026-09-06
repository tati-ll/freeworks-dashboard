export interface Comentario {
  id: number;
  proyecto: number;
  autor: string;
  texto: string;
  fecha: string;
}

export interface ComentarioRequest {
  proyecto: number;
  autor: string;
  texto: string;
}