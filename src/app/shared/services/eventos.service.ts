import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
    providedIn: 'root'
})
export class EventosService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl + '/eventos';
    private baseUrl = environment.apiUrl;

    private getApiKey(): string {
        const keysStr = localStorage.getItem('api_keys');
        const keys = keysStr ? JSON.parse(keysStr) : [];
        return keys[0] || '';
    }

    private getApiKeyArtista(): string {
        const keysStr = localStorage.getItem('api_keys');
        const keys = keysStr ? JSON.parse(keysStr) : [];
        return keys[1] || '';
    }

    private getAdminKey(): string {
        const keysStr = localStorage.getItem('api_keys');
        const keys = keysStr ? JSON.parse(keysStr) : [];
        return keys[2] || '';
    }

    getEventosConAsistentes() {
        const headers = new HttpHeaders().set('x-api-key', this.getAdminKey());
        return this.http.get<any[]>(`${this.apiUrl}`, { headers });
    }

    getEventosDeArtistasSeguidos(idUsuario: number): Observable<any> {
        const headers = new HttpHeaders().set('x-api-key', this.getApiKey());
        return this.http.get(`${this.apiUrl}/seguidos/${idUsuario}`, { headers });
    }

    getAsistentesEvento(idEvento: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/asistentesEvento`, {
            params: { id_evento: idEvento }
        });
    }

    getEventosDeArtista(idArtista: number) {
        const headers = new HttpHeaders().set('x-api-key', this.getApiKey());
        return this.http.get<any[]>(`http://localhost:5000/artista/${idArtista}/eventos`, { headers });
    }

    asistirEvento(id_usuario: number, id_evento: number) {
        const headers = new HttpHeaders().set('x-api-key', this.getApiKeyArtista());
        return this.http.post(
            `${this.apiUrl}/${id_evento}/asistir`,
            { id_artista: id_usuario }, { headers });
    }

    cancelarAsistencia(id_usuario: number, id_evento: number) {
        const headers = new HttpHeaders().set('x-api-key', this.getApiKeyArtista());
        return this.http.delete(
            `${this.apiUrl}/${id_evento}/asistencias/${id_usuario}`, { headers });
    }

    crearEventoArtista(idArtista: number, eventoData: any) {
        const headers = new HttpHeaders().set('x-api-key', this.getApiKeyArtista());
        return this.http.post(
            `${this.baseUrl}/artista/${idArtista}/eventos`,
            eventoData,
            { headers }
        );
    }

    eliminarEvento(id_evento: number) {
        const headers = new HttpHeaders().set('x-api-key', this.getAdminKey());
        return this.http.delete(`${this.apiUrl}/${id_evento}`, { headers });
    }

}
