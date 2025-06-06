import { Comentario } from "./caja.model";

export interface Cuadro {
    id: number;
    titulo: string;
    descripcion: string;
    imagen_base64: string;
    fecha_creacion: string;
    isBookable: boolean;
    likes: number;
    id_artista: number;
    id_categoria: number;
    comentarios?: Comentario[];
    like: boolean;
    nombre_artista:string;
  }
  