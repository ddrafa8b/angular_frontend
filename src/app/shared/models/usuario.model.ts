export type TipoUsuario = 'usuario' | 'artista' | 'admin';

export interface Usuario {
  id_usuario: number;
  email: string;
  tipo: TipoUsuario;
  nombre?: string;
  nombre_usuario?: string;
  biografia?: string;
  identificador?: string;
}