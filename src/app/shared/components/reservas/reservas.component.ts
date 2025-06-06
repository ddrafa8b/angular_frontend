import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ReservaService } from '../../services/reserve.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButtons, IonHeader, IonToolbar, IonTitle, IonButton, IonContent, IonList, IonItem, IonLabel, IonText } from "@ionic/angular/standalone";

@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.component.html',
  styleUrls: ['./reservas.component.scss'],
  imports: [IonButton, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonText, IonToolbar, CommonModule, FormsModule]
})
export class ReservasComponent implements OnInit {
  @Input() usuario: any;
  reservas: any[] = [];
  loading = true;

  constructor(
    private modalCtrl: ModalController,
    private reservaService: ReservaService
  ) { }

  ngOnInit() {
    if (!this.usuario) return;

    if (this.usuario.tipo === 'usuario') {
      this.reservaService.obtenerReservasPorUsuario(this.usuario.id_usuario).subscribe({
        next: res => {
          this.reservas = res;
          this.loading = false;
        },
        error: err => {
          console.error('Error al cargar reservas del usuario', err);
          this.loading = false;
        }
      });
    } else if (this.usuario.tipo === 'artista') {
      this.reservaService.obtenerReservasDeMisCuadros(this.usuario.id_usuario).subscribe({
        next: res => {
          this.reservas = res;
          this.loading = false;
        },
        error: err => {
          console.error('Error al cargar reservas de cuadros', err);
          this.loading = false;
        }
      });
    }
  }

  cancelarReserva(id_reserva: number) {
    this.reservaService.cancelarReserva(id_reserva).subscribe({
      next: () => {
        this.reservas = this.reservas.map(r =>
          r.id_reserva === id_reserva ? { ...r, estado: 'cancelada' } : r
        );
      },
      error: err => {
        console.error('Error cancelando reserva', err);
      }
    });
  }

  confirmarReserva(id: number) {
    this.reservaService.confirmarReserva(id).subscribe({
      next: () => {
        this.reservas = this.reservas.map(r =>
          r.id_reserva === id ? { ...r, estado: 'confirmada' } : r
        );
      },
      error: (err) => console.error('Error al confirmar reserva', err)
    });
  }


  cerrar() {
    this.modalCtrl.dismiss();
  }
}