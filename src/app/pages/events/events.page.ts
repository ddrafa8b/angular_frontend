import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchBarComponent } from 'src/app/shared/components/searchbar/searchbar.component';
import { RouterModule } from '@angular/router';
import { EventosService } from 'src/app/shared/services/eventos.service';
import { ModalController } from '@ionic/angular';
import { EventoDetalleComponent } from '../../shared/components/evento-detalle/evento-detalle.component';
import { IonButton } from "@ionic/angular/standalone";
import { CrearEventoComponent } from 'src/app/shared/components/crear-evento/crear-evento.component';

@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
  standalone: true,
  imports: [IonButton, CommonModule, FormsModule, SearchBarComponent, RouterModule]
})
export class EventsPage implements OnInit {
  esArtista = false;
  esUsuario = false;
  esAdmin = false;

  usuarioId: number | null = null;
  eventosSeguidos: any[] = [];
  todosLosEventos: any[] = [];

  constructor(private eventosService: EventosService, private modalCtrl: ModalController) { }

  ngOnInit() {
    const userStr = localStorage.getItem('usuario');
    if (userStr) {
      try {
        const usuario = JSON.parse(userStr);
        this.usuarioId = usuario.id_usuario;
        switch (usuario?.tipo) {
          case 'artista':
            this.esArtista = true;
            break;
          case 'usuario':
            this.esUsuario = true;
            this.cargarEventosSeguidos(usuario.id_usuario);
            break;
          case 'admin':
            this.esAdmin = true;
          this.cargarTodosLosEventosConAsistentes();
          break;
        }
      } catch (err) {
        console.error('Error parsing usuario from localStorage', err);
      }
    }
  }

  cargarEventosSeguidos(idUsuario: number) {
    this.eventosService.getEventosDeArtistasSeguidos(idUsuario).subscribe({
      next: (eventos) => this.eventosSeguidos = eventos,
      error: (err) => console.error('Error cargando eventos seguidos', err)
    });
  }

  cargarTodosLosEventosConAsistentes() {
  this.eventosService.getEventosConAsistentes().subscribe({
    next: (eventos) => this.todosLosEventos = eventos,
    error: (err) => console.error('Error cargando eventos con asistentes', err)
  });
}

eliminarEvento(id_evento: number) {
  if (confirm('¿Estás seguro de que deseas eliminar este evento?')) {
    this.eventosService.eliminarEvento(id_evento).subscribe({
      next: () => {
        window.location.reload();
      }
    });
  }
}


  abrirDetalleEvento(evento: any) {
    this.modalCtrl.create({
      component: EventoDetalleComponent,
      componentProps: { evento }
    }).then(modal => modal.present());
  }

  async abrirModalCrearEvento() {
    this.modalCtrl.create({
      component: CrearEventoComponent,
      componentProps: {
        id_artista: this.usuarioId
            }
    }).then(modal => modal.present());
  }
}
