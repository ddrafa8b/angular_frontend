import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/reserva';
  private baseUrl = environment.apiUrl;

  private getHeaders(tipo: string): HttpHeaders {
    const apiKeys = JSON.parse(localStorage.getItem('api_keys') || '[]');
    const key = tipo === 'artista' ? apiKeys?.[1] : apiKeys?.[0];
    return new HttpHeaders({
      'x-api-key': key || '',
      'Content-Type': 'application/json'
    });
  }

  obtenerReservasPorUsuario(id_usuario: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/usuario/${id_usuario}/reservas`,
      { headers: this.getHeaders('usuario') }
    );
  }

  obtenerReservasDeMisCuadros(id_artista: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/artista/${id_artista}/reservas`,
      { headers: this.getHeaders('artista') }
    );
  }

  cancelarReserva(id_reserva: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/reservas/${id_reserva}`, { estado: 'cancelada' }, {
      headers: this.getHeaders('usuario')
    });
  }

  crearReserva(data: {
    id_cuadro: number,
    nombre_cliente: string,
    email_cliente: string,
    dni_cliente: string
  }): Observable<any> {
    return this.http.post(this.apiUrl, data, {
      headers: this.getHeaders('usuario')
    });
  }

  confirmarReserva(id_reserva: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/reservas/${id_reserva}`, { estado: 'confirmada' }, {
      headers: this.getHeaders('artista')
    });
  }
}
