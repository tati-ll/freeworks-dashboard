import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Proyecto,
  ProyectoRequest,
} from '../models/proyecto';

import {
  Entregable,
  EntregableRequest,
} from '../models/entregable';

import {
  Comentario,
  ComentarioRequest,
} from '../models/comentario';


@Injectable({
  providedIn: 'root',
})
export class ProjectsApiService {

  private readonly apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  // Proyectos

  getProyectos(): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(
      `${this.apiUrl}/proyectos/`
    );
  }

  getProyecto(id: number): Observable<Proyecto> {
    return this.http.get<Proyecto>(
      `${this.apiUrl}/proyectos/${id}/`
    );
  }

  crearProyecto(
    datos: ProyectoRequest
  ): Observable<Proyecto> {
    return this.http.post<Proyecto>(
      `${this.apiUrl}/proyectos/`,
      datos
    );
  }

  actualizarProyecto(
    id: number,
    datos: Partial<ProyectoRequest>
  ): Observable<Proyecto> {
    return this.http.patch<Proyecto>(
      `${this.apiUrl}/proyectos/${id}/`,
      datos
    );
  }

  eliminarProyecto(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/proyectos/${id}/`
    );
  }

  // Entregables

  getEntregables(): Observable<Entregable[]> {
    return this.http.get<Entregable[]>(
      `${this.apiUrl}/entregables/`
    );
  }

  crearEntregable(
    datos: EntregableRequest
  ): Observable<Entregable> {
    return this.http.post<Entregable>(
      `${this.apiUrl}/entregables/`,
      datos
    );
  }

  actualizarEntregable(
    id: number,
    datos: Partial<EntregableRequest>
  ): Observable<Entregable> {
    return this.http.patch<Entregable>(
      `${this.apiUrl}/entregables/${id}/`,
      datos
    );
  }

  eliminarEntregable(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/entregables/${id}/`
    );
  }

  // Comentarios

  getComentarios(): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(
      `${this.apiUrl}/comentarios/`
    );
  }

  crearComentario(
    datos: ComentarioRequest
  ): Observable<Comentario> {
    return this.http.post<Comentario>(
      `${this.apiUrl}/comentarios/`,
      datos
    );
  }

  actualizarComentario(
    id: number,
    datos: Partial<ComentarioRequest>
  ): Observable<Comentario> {
    return this.http.patch<Comentario>(
      `${this.apiUrl}/comentarios/${id}/`,
      datos
    );
  }

  eliminarComentario(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/comentarios/${id}/`
    );
  }
}