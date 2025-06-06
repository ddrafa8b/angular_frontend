import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Solicitud } from '../models/solicitud.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {

  private apiUrl = 'http://localhost:5000/solicitud';

  constructor(private http: HttpClient) {}

  enviarSolicitud(solicitud: Solicitud): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': 'este-es-el-decorador-que-protege-a-la-api-y-permite-hacer-llamadas-a-todos-los-usuarios'
    });

    return this.http.post(this.apiUrl, solicitud, { headers });
  }
}
