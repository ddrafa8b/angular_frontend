import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { Cuadro } from '../models/cuadro.model';
import { Comentario } from '../models/caja.model';

@Injectable({
  providedIn: 'root'
})
export class CuadroService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/cuadros';
  private baseUrl = environment.apiUrl;

  private getApiKey(): string {
    const keysStr = localStorage.getItem('api_keys');
    const keys = keysStr ? JSON.parse(keysStr) : [];
    return keys[0] || '';
  }

  private getUsuarioId(): number | null {
    const userStr = localStorage.getItem('usuario');
    if (!userStr) return null;
    try {
      const usuario = JSON.parse(userStr);
      return usuario.id_usuario || null;
    } catch {
      return null;
    }
  }

  private getApiKeyArtist(): string {
    const keysStr = localStorage.getItem('api_keys');
    const keys = keysStr ? JSON.parse(keysStr) : [];
    return keys[1] || '';
  }

  private getApiKeyAdmin(): string {
    const keysStr = localStorage.getItem('api_keys');
    const keys = keysStr ? JSON.parse(keysStr) : [];
    return keys[2] || '';
  }

  private getHeadersApiKey(): HttpHeaders {
    return new HttpHeaders({ 'x-api-key': this.getApiKey() });
  }

  private getHeadersConUsuario(): HttpHeaders {
    return new HttpHeaders({
      'x-api-key': this.getApiKey(),
      'Content-Type': 'application/json'
    });
  }

  private getHeadersConArtista(isFormData: boolean = false): HttpHeaders {
    if (isFormData) {
      return new HttpHeaders({
        'x-api-key': this.getApiKeyArtist()
      });
    } else {
      return new HttpHeaders({
        'x-api-key': this.getApiKeyArtist(),
        'Content-Type': 'application/json'
      });
    }
  }

  private getHeadersConAdministrador(isFormData: boolean = false): HttpHeaders {
    if (isFormData) {
      return new HttpHeaders({
        'x-api-key': this.getApiKeyAdmin()
      });
    } else {
      return new HttpHeaders({
        'x-api-key': this.getApiKeyAdmin(),
        'Content-Type': 'application/json'
      });
    }
  }


  getCuadrosDeArtistasSeguidos(): Observable<Cuadro[]> {
    const id_usuario = this.getUsuarioId();
    if (!id_usuario) throw new Error('Usuario no autenticado');

    const headers = this.getHeadersApiKey();

    return this.http.get<any[]>(`${this.baseUrl}/seguidos?id_usuario=${id_usuario}`, { headers }).pipe(
      switchMap((artistas) => {
        const artistasValidos = artistas.filter(artista => artista.id != null && artista.id !== undefined);

        if (artistasValidos.length === 0) {
          return new Observable<Cuadro[]>(subscriber => {
            subscriber.next([]);
            subscriber.complete();
          });
        }

        const peticiones = artistasValidos.map(artista => {
          const url = `${this.apiUrl}/por_artista?id_artista=${artista.id}&id_usuario=${id_usuario}`;

          return this.http.get<any[]>(url, { headers }).pipe(
            map(cuadros =>
              cuadros.map(cuadro => ({
                ...cuadro,
                id: cuadro.id_cuadro
              }))
            )
          );
        });

        return forkJoin(peticiones).pipe(
          map((cuadrosPorArtista) => cuadrosPorArtista.reduce((acc, val) => acc.concat(val), []))
        );
      })
    );
  }

  getTodosCuadros(): Observable<any[]> {
    const headers = this.getHeadersConAdministrador();
    return this.http.get<any[]>(`${this.apiUrl}`, { headers });
  }

  getCuadroById(id: number): Observable<Cuadro> {
    return this.http.get<Cuadro>(`${this.baseUrl}/cuadro/${id}`);
  }

  getCuadrosDeArtista(idArtista: number) {
    return this.http.get<any[]>(`${this.apiUrl}/artista/${idArtista}`);
  }

  crearCuadro(formData: FormData): Observable<any> {
    const headers = this.getHeadersConArtista(true);
    return this.http.post(`${this.apiUrl}/subir`, formData, { headers });
  }

  actualizarCuadro(id: number, datos: any): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put(url, datos, { headers: this.getHeadersConArtista() });
  }

  eliminarCuadro(id_cuadro: number): Observable<any> {
    const headers = this.getHeadersConArtista(false);
    return this.http.delete(`${this.apiUrl}/${id_cuadro}`, { headers });
  }

  eliminarCuadroComoAdmin(id_cuadro: number) {
    const headers = this.getHeadersConAdministrador();
    return this.http.delete(`${this.apiUrl}/admin/${id_cuadro}`, { headers });
  }

  getArtistaPorId(id_artista: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/artista/${id_artista}`);
  }

  postComentario(id_usuario: number, id_cuadro: number, comentario: string): Observable<any> {
    const headers = this.getHeadersConUsuario();
    return this.http.post(`${this.baseUrl}/comentario`, {
      id_usuario,
      id_cuadro,
      comentario
    }, { headers });
  }

  getComentarios(id_cuadro: number): Observable<Comentario[]> {
    const headers = this.getHeadersApiKey();
    return this.http.get<Comentario[]>(`${this.baseUrl}/comentarios?id_cuadro=${id_cuadro}`, { headers });
  }

  darLike(id_usuario: number, id_cuadro: number): Observable<any> {
    const headers = this.getHeadersConUsuario();
    return this.http.post(`${this.baseUrl}/like`, {
      id_usuario,
      id_cuadro
    }, { headers });
  }

  eliminarLike(id_usuario: number, id_cuadro: number): Observable<any> {
    const headers = this.getHeadersConUsuario();
    return this.http.post(`${this.baseUrl}/like/eliminar`, {
      id_usuario,
      id_cuadro
    }, { headers });
  }


  verificarLike(id_usuario: number, id_cuadro: number): Observable<{ like: boolean }> {
    const headers = this.getHeadersApiKey();
    return this.http.get<{ like: boolean }>(
      `${this.baseUrl}/like/verificar?id_usuario=${id_usuario}&id_cuadro=${id_cuadro}`,
      { headers }
    );
  }

  getArtistasSeguidos(id_usuario: number): Observable<any[]> {
    const headers = this.getHeadersApiKey();
    return this.http.get<any[]>(`${this.baseUrl}/seguidos?id_usuario=${id_usuario}`, { headers });
  }

  seguirArtista(id_usuario: number, id_artista: number): Observable<any> {
    const headers = this.getHeadersConUsuario();
    return this.http.post(`${this.baseUrl}/seguir`, { id_usuario, id_artista }, { headers });
  }

  dejarDeSeguirArtista(id_usuario: number, id_artista: number): Observable<any> {
    const headers = this.getHeadersConUsuario();
    return this.http.post(`${this.baseUrl}/dejar_seguir`, { id_usuario, id_artista }, { headers });
  }
}
