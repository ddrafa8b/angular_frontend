import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/usuarios';

  private getApiKey(): string {
    const keysStr = localStorage.getItem('api_keys');
    const keys = keysStr ? JSON.parse(keysStr) : [];
    return keys[0] || '';
  }
  private getHeadersApiKey(): HttpHeaders {
    return new HttpHeaders({ 'x-api-key': this.getApiKey() });
  }

  getUsuarios(): Observable<Usuario[]> {
    const headers = this.getHeadersApiKey();
    return this.http.get<Usuario[]>(this.apiUrl, { headers });
  }

  updateUsuario(usuario: Usuario): Observable<Usuario> {
    const headers = this.getHeadersApiKey();
    return this.http.put<Usuario>(`${this.apiUrl}/${usuario.id_usuario}`, usuario, { headers });
  }

  updatePassword(id_usuario: number, data: { clave_actual: string, nueva_clave: string, confirmar_clave: string }): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'x-api-key': this.getApiKey() });
    return this.http.put(`${this.apiUrl}/${id_usuario}/cambiar-clave`, data, { headers });
  }
}
