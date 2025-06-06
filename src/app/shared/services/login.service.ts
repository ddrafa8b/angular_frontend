import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  login(email: string, clave: string): Observable<any> {
    const url = `${this.apiUrl}/login`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = { email, clave };

    return this.http.post(url, body, { headers }).pipe(
      tap((res: any) => {
        if (res?.id_usuario && res?.tipo) {
          const userData = {
            id_usuario: res.id_usuario,
            tipo: res.tipo,
            email: res.email,
            nombre_usuario: res.nombre_usuario,
            biografia: res.biografia || null,
            nombre: res.nombre || null,
            identificador: res.identificador || null,
          };
          localStorage.setItem('usuario', JSON.stringify(userData));

          let apiKeys: string[] = [];

          switch (res.tipo) {
            case 'usuario':
              apiKeys = [
                'este-es-el-decorador-que-protege-a-la-api-y-permite-hacer-llamadas-a-todos-los-usuarios'
              ];
              break;
            case 'artista':
              apiKeys = [
                'este-es-el-decorador-que-protege-a-la-api-y-permite-hacer-llamadas-a-todos-los-usuarios',
                'este-es-el-decorador-que-protege-a-la-api-y-permite-hacer-llamadas-a-todos-los-usuarios-que-sean-artistas'
              ];
              break;
            case 'admin':
              apiKeys = [
                'este-es-el-decorador-que-protege-a-la-api-y-permite-hacer-llamadas-a-todos-los-usuarios',
                'este-es-el-decorador-que-protege-a-la-api-y-permite-hacer-llamadas-a-todos-los-usuarios-que-sean-artistas',
                'este-es-el-decorador-que-protege-a-la-api-y-permite-hacer-llamadas-a-todos-los-usuarios-que-sean-administradores-de-la-aplicacion'
              ];
              break;
          }

          localStorage.setItem('api_keys', JSON.stringify(apiKeys));
        }
      })
    );
  }

  registro(usuario: {
    email: string,
    clave: string,
    nombre: string,
    nombre_usuario: string
  }): Observable<any> {
    const url = `${this.apiUrl}/registro`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(url, usuario, { headers });
  }

  logout(): void {
    localStorage.removeItem('usuario');
    localStorage.removeItem('api_keys');
  }

  getUsuario(): any {
    const userData = localStorage.getItem('usuario');
    return userData ? JSON.parse(userData) : null;
  }

  getApiKeys(): string[] {
    const keys = localStorage.getItem('api_keys');
    return keys ? JSON.parse(keys) : [];
  }

  esUsuarioOrdinario(): boolean {
    const user = this.getUsuario();
    return user?.tipo === 'usuario';
  }
}
