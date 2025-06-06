import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { EventosService } from '../../services/eventos.service';
import { ArtistaDetalleComponent } from '../artista-detalle/artista-detalle.component';

@Component({
  selector: 'app-evento-detalle',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './evento-detalle.component.html',
  styleUrls: ['./evento-detalle.component.scss']
})
export class EventoDetalleComponent implements OnInit {
  @Input() evento: any;
  asistentes: any[] = [];

  private modalCtrl = inject(ModalController);
  private eventosService = inject(EventosService);
  esArtista = false;
  esUsuario = false;
  esAdmin = false;

  estaAsistiendo = false;
  usuarioId: number | null = null;
  usuarioNombre: string | null = null;

  ngOnInit() {
    const userStr = localStorage.getItem('usuario');
    if (userStr) {
      try {
        const usuario = JSON.parse(userStr);
        this.usuarioId = usuario.id_usuario;
        this.usuarioNombre = usuario.nombre;
        switch (usuario?.tipo) {
          case 'artista':
            this.esArtista = true;
            this.eventosService.getAsistentesEvento(this.evento.id_evento).subscribe({
              next: (asistentes) => {
                this.asistentes = asistentes;
                this.estaAsistiendo = asistentes.some(a => a.id === this.usuarioId);
              },
              error: (err) => console.error('Error cargando asistentes', err)
            });
            break;
          case 'usuario':
            this.esUsuario = true;
            this.eventosService.getAsistentesEvento(this.evento.id_evento).subscribe({
              next: (asistentes) => {
                this.asistentes = asistentes;
                this.estaAsistiendo = asistentes.some(a => a.id === this.usuarioId);
              },
              error: (err) => console.error('Error cargando asistentes', err)
            });
            break;
          case 'admin':
            this.esAdmin = true;
            break;
        }
      } catch (err) {
        console.error('Error parsing usuario from localStorage', err);
      }
    }
  }

  asistirEvento() {
    this.eventosService.asistirEvento(this.usuarioId!, this.evento.id_evento).subscribe({
      next: () => {
        this.estaAsistiendo = true;
        this.asistentes.push({ id: this.usuarioId, nombre: this.usuarioNombre });
      },
      error: err => console.error('Error al asistir al evento:', err)
    });
  }

  cancelarAsistencia() {
    this.eventosService.cancelarAsistencia(this.usuarioId!, this.evento.id_evento).subscribe({
      next: () => {
        this.estaAsistiendo = false;
        this.asistentes = this.asistentes.filter(a => a.id !== this.usuarioId);
      },
      error: err => console.error('Error al cancelar asistencia:', err)
    });
  }

  toggleAsistencia() {
    if (!this.usuarioId) return;

    if (this.estaAsistiendo) {
      this.cancelarAsistencia();
      this.modalCtrl.dismiss()
    } else {
      this.asistirEvento();
      this.modalCtrl.dismiss()
    }
  }


  abrirModalArtista(id_artista: number) {
    this.modalCtrl.dismiss();
    this.modalCtrl.create({
      component: ArtistaDetalleComponent,
      componentProps: { id_artista }
    }).then(modal => modal.present());
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }
}
