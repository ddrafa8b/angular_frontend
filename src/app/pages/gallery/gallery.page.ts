import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchBarComponent } from 'src/app/shared/components/searchbar/searchbar.component';
import { RouterModule } from '@angular/router';
import { CuadroService } from '../../shared/services/cuadro.service';
import { forkJoin, map } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { ArtistaDetalleComponent } from 'src/app/shared/components/artista-detalle/artista-detalle.component';
import { CuadroDetalleComponent } from 'src/app/shared/components/cuadro-detalle/cuadro-detalle.component';
import { CrearCuadroComponent } from 'src/app/shared/components/crear-cuadro/crear-cuadro.component';
import { IonicModule } from '@ionic/angular';
import { Comentario } from 'src/app/shared/models/caja.model';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.page.html',
  styleUrls: ['./gallery.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, SearchBarComponent, RouterModule]
})
export class GalleryPage implements OnInit {
  tipoBusqueda: 'cuadros' | 'artistas' = 'cuadros';
  esArtista = false;
  esUsuario = false;
  esAdmin = false;
  cuadros: any[] = [];
  artistasSeguidosIds: number[] = [];
  usuarioId: number | null = null;

  modalAbierto = false;
  cuadroSeleccionado: any = null;
  nuevoComentario: string = '';

  constructor(private cuadroService: CuadroService, private modalCtrl: ModalController) { }

  ngOnInit() {
    const userStr = localStorage.getItem('usuario');
    if (userStr) {
      try {
        const usuario = JSON.parse(userStr);
        this.usuarioId = usuario.id_usuario;
        switch (usuario?.tipo) {
          case 'artista':
            this.esArtista = true;
            this.cargarCuadrosArtista(usuario.id_usuario);
            break;
          case 'usuario':
            this.esUsuario = true;
            this.cargarCuadrosUsuario(usuario.id_usuario);
            break;
          case 'admin':
            this.esAdmin = true;
            this.cargarTodosLosCuadros();
            break;

        }
      } catch (err) {
        console.error('Error parsing usuario from localStorage', err);
      }
    }
  }

  cargarCuadrosUsuario(id_usuario: number) {
    this.cuadroService.getArtistasSeguidos(id_usuario).subscribe(artistas => {
      this.artistasSeguidosIds = artistas.map(a => a.id);

      this.cuadroService.getCuadrosDeArtistasSeguidos().subscribe(cuadros => {
        const artistasIdsUnicos = Array.from(new Set(cuadros.map(c => c.id_artista)));

        const artistasObservables = artistasIdsUnicos.map(idArtista =>
          this.cuadroService.getArtistaPorId(idArtista)
        );

        forkJoin(artistasObservables).subscribe(artistasInfo => {
          const mapaArtistas = new Map<number, string>();
          artistasInfo.forEach(artista => {
            mapaArtistas.set(artista.id, artista.nombre_artista || 'Artista');
          });

          const observables = cuadros.map(cuadro => {
            return forkJoin({
              comentarios: this.cuadroService.getComentarios(cuadro.id),
              likeResp: this.cuadroService.verificarLike(id_usuario, cuadro.id)
            }).pipe(
              map(({ comentarios, likeResp }) => ({
                ...cuadro,
                comentarios: comentarios || [],
                like: likeResp?.like ?? false,
                nombre_artista: mapaArtistas.get(cuadro.id_artista) || 'Artista',
                estaSeguido: this.artistasSeguidosIds.includes(cuadro.id_artista)
              }))
            );
          });

          forkJoin(observables).subscribe(enriquecidos => {
            this.cuadros = enriquecidos.sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime());
          });
        });
      });
    });
  }

  cargarCuadrosArtista(id_artista: number) {
    this.cuadroService.getCuadrosDeArtista(id_artista).subscribe(cuadros => {
      const cuadroObservables = cuadros.map(cuadro =>
        this.cuadroService.getComentarios(cuadro.id_cuadro).pipe(
          map(comentarios => ({
            ...cuadro,
            id: cuadro.id_cuadro,
            comentarios: comentarios || [],
            likes: cuadro.likes || 0
          }))
        )
      );

      forkJoin(cuadroObservables).subscribe(cuadrosCompletos => {
        this.cuadros = cuadrosCompletos.sort(
          (a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
        );
      });
    });
  }

  cargarTodosLosCuadros() {
    this.cuadroService.getTodosCuadros().subscribe(cuadros => {
      this.cuadros = cuadros.sort(
        (a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
      );
    });
  }


  seguirArtista(id_artista: number) {
    if (!this.usuarioId) return;
    this.cuadroService.seguirArtista(this.usuarioId, id_artista).subscribe(() => {
      if (!this.artistasSeguidosIds.includes(id_artista)) {
        this.artistasSeguidosIds.push(id_artista);
      }
      this.cuadros = this.cuadros.map(c =>
        c.id_artista === id_artista ? { ...c, estaSeguido: true } : c
      );
      if (this.cuadroSeleccionado?.id_artista === id_artista) {
        this.cuadroSeleccionado.estaSeguido = true;
      }
    });
  }

  dejarDeSeguirArtista(id_artista: number) {
    if (!this.usuarioId) return;
    this.cuadroService.dejarDeSeguirArtista(this.usuarioId, id_artista).subscribe(() => {
      this.artistasSeguidosIds = this.artistasSeguidosIds.filter(id => id !== id_artista);

      this.cuadros = this.cuadros.map(c =>
        c.id_artista === id_artista ? { ...c, estaSeguido: false } : c
      );
      if (this.cuadroSeleccionado?.id_artista === id_artista) {
        this.cuadroSeleccionado.estaSeguido = false;
      }
    });
  }

  marcarEditado(cuadro: any) {
    cuadro.editado = true;
  }

  eliminarComentario(cuadro: any, index: number) {
    cuadro.comentarios.splice(index, 1);
    this.marcarEditado(cuadro);
  }

  eliminarTodosComentarios(cuadro: any) {
    cuadro.comentarios = [];
    this.marcarEditado(cuadro);
  }

  guardarCambiosCuadro(cuadro: any) {
    const datosActualizados = {
      id_artista: this.usuarioId,
      titulo: cuadro.titulo,
      descripcion: cuadro.descripcion,
      fecha_creacion: cuadro.fecha_creacion,
      isBookable: !!cuadro.isBookable,
      comentarios_actuales: cuadro.comentarios?.map((c: Comentario) => c.id) || []
    };


    this.cuadroService.actualizarCuadro(cuadro.id, datosActualizados).subscribe({
      next: () => {
        cuadro.editado = false;
      },
      error: (err) => {
        console.error('Error al actualizar el cuadro:', err);
      }
    });
  }


  eliminarCuadro(id_cuadro: number, id_artista: number) {
    if (!this.usuarioId) return;

    if (this.usuarioId !== id_artista) {
      return;
    }

    if (!confirm('¿Estás seguro que deseas eliminar este cuadro?')) {
      return;
    }

    this.cuadroService.eliminarCuadro(id_cuadro).subscribe({
      next: () => {
        this.cuadros = this.cuadros.filter(c => c.id !== id_cuadro);
        window.location.reload();
      }
    });
  }

  eliminarCuadroAdmin(id_cuadro: number) {
    if (!confirm('¿Estás seguro que deseas eliminar este cuadro como administrador?')) {
      return;
    }

    this.cuadroService.eliminarCuadroComoAdmin(id_cuadro).subscribe({
      next: () => {
        window.location.reload();
      }
    });
  }



  toggleLike(cuadro: any) {
    if (!this.usuarioId) return;

    if (cuadro.like) {
      this.cuadroService.eliminarLike(this.usuarioId, cuadro.id).subscribe(() => {
        cuadro.like = false;
      });
    } else {
      this.cuadroService.darLike(this.usuarioId, cuadro.id).subscribe(() => {
        cuadro.like = true;
      });
    }
  }

  async abrirDetalleCuadro(cuadro: any) {
    const modal = await this.modalCtrl.create({
      component: CuadroDetalleComponent,
      componentProps: cuadro.id ? { id_cuadro: cuadro.id } : { cuadro }
    });
    await modal.present();
  }

  abrirModalArtista(artista: any) {
    this.modalCtrl.create({
      component: ArtistaDetalleComponent,
      componentProps: {
        id_artista: artista
      }
    }).then(modal => modal.present());
  }

  async abrirModalCrearCuadro() {
    const modal = await this.modalCtrl.create({
      component: CrearCuadroComponent,
      componentProps: {
        artistaId: this.usuarioId
      }
    });

    modal.onDidDismiss().then(result => {
      if (result.data) {
        this.cargarCuadrosArtista(this.usuarioId!);
      }
    });

    await modal.present();
  }
}

