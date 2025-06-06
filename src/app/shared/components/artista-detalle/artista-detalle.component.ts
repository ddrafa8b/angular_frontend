import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { CuadroService } from '../../services/cuadro.service';
import { CuadroDetalleComponent } from '../cuadro-detalle/cuadro-detalle.component';
import { EventosService } from '../../services/eventos.service';
import { EventoDetalleComponent } from '../evento-detalle/evento-detalle.component';

@Component({
  selector: 'app-artista-detalle',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './artista-detalle.component.html',
  styleUrls: ['./artista-detalle.component.scss']
})

export class ArtistaDetalleComponent {
  @Input() artista: any;
  @Input() id_artista: any;

  cuadros: any[] = [];
  eventos: any[] = [];

  servicio = inject(CuadroService);
  eventosService = inject(EventosService);
  modalCtrl = inject(ModalController);
  esArtista = false;
  esUsuario = false;
  esAdmin = false;

  constructor() { }

  ngOnInit() {
    const userStr = localStorage.getItem('usuario');
    if (userStr) {
      try {
        const usuario = JSON.parse(userStr);
        switch (usuario?.tipo) {
          case 'artista':
            this.esArtista = true;
            break;
          case 'usuario':
            this.esUsuario = true;
            break;
          case 'admin':
            this.esAdmin = true;
            break;
        }
      } catch (err) {
        console.error('Error parsing usuario from localStorage', err);
      }
    }

    const id = this.artista?.id_usuario ?? this.id_artista;
    if (id) {
      this.cargarCuadros(id);
      if(this.esUsuario){
      this.cargarEventos(id);
      }
    }

    if (!this.artista && this.id_artista != null) {
      this.servicio.getArtistaPorId(this.id_artista).subscribe({
        next: artista => this.artista = artista,
        error: err => console.error('Error al obtener el artista:', err)
      });
    }
  }

  private cargarCuadros(idArtista: number) {
    this.servicio.getCuadrosDeArtista(idArtista).subscribe({
      next: res => this.cuadros = res,
      error: err => console.error('Error al obtener cuadros del artista:', err)
    });
  }

  private cargarEventos(idArtista: number) {
    this.eventosService.getEventosDeArtista(idArtista).subscribe({
      next: res => this.eventos = res,
      error: err => console.error('Error al obtener eventos del artista:', err)
    });
  }

  async abrirDetalleCuadro(cuadro: any) {
    this.modalCtrl.dismiss();
    const modal = await this.modalCtrl.create({
      component: CuadroDetalleComponent,
      componentProps: cuadro.id ? { id_cuadro: cuadro.id } : { cuadro }
    });
    await modal.present();
  }

  async abrirDetalleEvento(evento: any) {
    this.modalCtrl.dismiss();
    const modal = await this.modalCtrl.create({
      component: EventoDetalleComponent,
      componentProps: { evento }
    });
    await modal.present();
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }
}
