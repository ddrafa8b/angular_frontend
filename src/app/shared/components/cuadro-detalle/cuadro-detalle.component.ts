import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { CuadroService } from '../../services/cuadro.service';
import { ArtistaDetalleComponent } from '../artista-detalle/artista-detalle.component';
import { ReservarComponent } from '../reservar/reservar.component';

@Component({
  selector: 'app-cuadro-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './cuadro-detalle.component.html',
  styleUrls: ['./cuadro-detalle.component.scss'],
})
export class CuadroDetalleComponent implements OnInit {
  @Input() cuadro: any = null;
  @Input() id_cuadro?: number;

  cuadroCompleto: any = null;
  nuevoComentario = '';
  usuarioId: number | null = null;
  esUsuario = false;
  esAdmin = false;
  esArtista = false;

  modalCtrl = inject(ModalController);
  cuadroService = inject(CuadroService);

  ngOnInit() {
    const userStr = localStorage.getItem('usuario');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.usuarioId = user.id_usuario;
      this.esUsuario = user.tipo === 'usuario';
      this.esAdmin = user.tipo === 'admin';
      this.esArtista = user.tipo === 'artista';
    }

    if (this.cuadro) {
      if (this.cuadro.comentarios) {
        this.cuadroCompleto = this.cuadro;
        this.verificarSiSigueArtista();
      } else {
        this.cargarCuadroConComentarios(this.cuadro.id || this.cuadro.id_cuadro);
      }
    } else if (this.id_cuadro) {
      this.cargarCuadroConComentarios(this.id_cuadro);
    }
  }

  formatoFechaComentario(fecha: string): string {
  if (!fecha) return 'Ahora mismo';

  const partes = fecha.split(/[- :]/);
  const publicada = new Date(
    Number(partes[0]),
    Number(partes[1]) - 1,
    Number(partes[2]),
    Number(partes[3]),
    Number(partes[4])
  );

  const ahora = new Date();
  const diffMs = ahora.getTime() - publicada.getTime();
  const diffMin = diffMs / 60000;

  if (diffMin < 5) return 'Ahora mismo';
  if (diffMin < 60) return 'Última hora';

  const diffHrs = diffMin / 60;
  if (diffHrs < 24) return 'Hoy';

  const diffDias = diffHrs / 24;
  if (diffDias < 7) return 'Varios días';
  if (diffDias < 30) return 'Último mes';
  if (diffDias < 365) return 'Varios meses';

  return 'Hace más de un año';
}


  cargarCuadroConComentarios(id: number) {
    this.cuadroService.getCuadroById(id).subscribe(cuadro => {
      if (this.esUsuario) {
        this.cuadroService.getComentarios(id).subscribe(comentarios => {
          this.cuadroCompleto = {
            ...cuadro,
            comentarios: comentarios || []
          };
          this.verificarSiSigueArtista();
        });
      } else {
        this.cuadroCompleto = {
          ...cuadro,
          comentarios: []
        };
        this.verificarSiSigueArtista();
      }
    });
  }

  verificarSiSigueArtista() {
    if (!this.usuarioId || !this.cuadroCompleto?.id_artista) return;
    this.cuadroService.getArtistasSeguidos(this.usuarioId).subscribe({
      next: (artistas: any[]) => {
        const ids = artistas.map(a => a.id);
        this.cuadroCompleto.estaSeguido = ids.includes(this.cuadroCompleto.id_artista);
      },
      error: err => console.error('Error al verificar si sigue al artista:', err)
    });
  }


  seguirArtista(id_artista: number) {
    if (!this.usuarioId) return;
    this.cuadroService.seguirArtista(this.usuarioId, id_artista).subscribe(() => {
      this.cuadroCompleto.estaSeguido = true;
    });
  }

  dejarDeSeguirArtista(id_artista: number) {
    if (!this.usuarioId) return;
    this.cuadroService.dejarDeSeguirArtista(this.usuarioId, id_artista).subscribe(() => {
      this.cuadroCompleto.estaSeguido = false;
    });
  }

  publicarComentario() {
  if (!this.nuevoComentario.trim() || !this.usuarioId || !this.cuadroCompleto) return;
  const texto = this.nuevoComentario.trim();

  this.cuadroService.postComentario(this.usuarioId, this.cuadroCompleto.id_cuadro ?? this.cuadroCompleto.id, texto)
    .subscribe(() => {
      this.cuadroCompleto.comentarios.push({
        comentario: texto,
        fecha_formateada: 'Ahora mismo'
      });
      this.nuevoComentario = '';
    });
}


  abrirModalArtista(id_artista: number) {
    this.modalCtrl.dismiss();
    this.modalCtrl.create({
      component: ArtistaDetalleComponent,
      componentProps: { id_artista }
    }).then(modal => modal.present());
  }

  async abrirModalReservar() {
    this.modalCtrl.dismiss();
    const modal = await this.modalCtrl.create({
      component: ReservarComponent,
      componentProps: { id_cuadro: this.cuadroCompleto.id_cuadro ?? this.cuadroCompleto.id }
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.reservaConfirmada) {
      this.modalCtrl.dismiss();
    }
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }
}
