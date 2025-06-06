import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudService } from '../../shared/services/solicitud.service';
import { Solicitud } from '../../shared/models/solicitud.model';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-solicitud',
  templateUrl: './solicitud.page.html',
  styleUrls: ['./solicitud.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class SolicitudPage {
  solicitud: Solicitud = {
    email: '',
    nombre: '',
    nombre_artistico: '',
    descripcion: ''
  };

  constructor(
    private solicitudService: SolicitudService,
    private alertController: AlertController,
    private router: Router
  ) {}

  async enviar() {
    if (!this.solicitud.email || !this.solicitud.nombre || !this.solicitud.descripcion) {
      const alerta = await this.alertController.create({
        header: 'Campos incompletos',
        message: 'Por favor completa los campos obligatorios.',
        buttons: ['OK']
      });
      await alerta.present();
      return;
    }

    this.solicitudService.enviarSolicitud(this.solicitud).subscribe({
      next: async () => {
        const alerta = await this.alertController.create({
          header: 'Solicitud enviada',
          message: 'Gracias por compartir tu arte. Nos pondremos en contacto contigo pronto.',
          buttons: ['OK']
        });
        await alerta.present();
        await alerta.onDidDismiss();
        this.router.navigate(['/home']);
      },
      error: async (error) => {
        const alerta = await this.alertController.create({
          header: 'Error',
          message: error?.error?.error || 'No se pudo enviar la solicitud.',
          buttons: ['OK']
        });
        await alerta.present();
      }
    });
  }
}
