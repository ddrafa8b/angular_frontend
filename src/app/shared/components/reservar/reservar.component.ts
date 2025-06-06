import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonLabel, IonItem, IonInput, IonContent, IonCheckbox } from "@ionic/angular/standalone";
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReservaService } from '../../services/reserve.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reservar',
  templateUrl: './reservar.component.html',
  styleUrls: ['./reservar.component.scss'],
  imports: [IonContent, IonInput, IonItem, IonLabel, IonButton, IonButtons, IonTitle, IonHeader, IonToolbar, CommonModule, FormsModule, RouterModule, IonCheckbox],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
})
export class ReservarComponent {
  esUsuario = false;
  nombre_cliente = '';
  email_cliente = '';
  dni_cliente = '';
  mostrarStripe = false;

  emailInvalido = false;
  dniInvalido = false;
  terminosInvalido = false;

  aceptaTerminos = false;
  


  @Input() id_cuadro!: number;


  constructor(
    private modalCtrl: ModalController,
    private reservaService: ReservaService
  ) { }

  ngOnInit() {
    console.log('ID CUADRO recibido:', this.id_cuadro);

    const userStr = localStorage.getItem('usuario');
    if (userStr) {
      const usuario = JSON.parse(userStr);
      this.esUsuario = usuario?.tipo === 'usuario';
      if (this.esUsuario) {
        this.nombre_cliente = usuario.nombre || usuario.nombre_usuario || '';
        this.email_cliente = usuario.email || '';
      }
    }
  }

  pagar() {
    const datosReserva = {
      id_cuadro: this.id_cuadro,
      nombre_cliente: this.nombre_cliente,
      email_cliente: this.email_cliente,
      dni_cliente: this.dni_cliente
    };

    this.reservaService.crearReserva(datosReserva).subscribe({
      next: () => {
        this.modalCtrl.dismiss({ reservaConfirmada: true }).then(() => {
          window.location.reload();
        });
      },
      error: () => {
        this.modalCtrl.dismiss({ reservaConfirmada: false });
      }
    });
  }

  confirmarReserva() {
    this.emailInvalido = false;
    this.dniInvalido = false;
    this.terminosInvalido = false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!this.validarDNI(this.dni_cliente)) {
      this.dniInvalido = true;
    }

    if (!this.esUsuario && !emailRegex.test(this.email_cliente)) {
      this.emailInvalido = true;
    }

    if (!this.aceptaTerminos) {
      this.terminosInvalido = true;
    }

    if (
      (this.esUsuario && (!this.dni_cliente || this.dniInvalido)) ||
      (!this.esUsuario &&
        (!this.nombre_cliente || !this.email_cliente || !this.dni_cliente || this.emailInvalido || this.dniInvalido)) ||
      !this.aceptaTerminos
    ) {
      return;
    }

    this.mostrarStripe = true;
  }



  cerrarModal() {
    this.modalCtrl.dismiss({ reservaConfirmada: false });
    this.mostrarStripe = false;
  }

  validarDNI(dni: string): boolean {
    const dniRegex = /^[0-9]{8}[A-Za-z]$/;
    return dniRegex.test(dni);
  }
}
