import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController, IonicModule, ToastController } from '@ionic/angular';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-cambiar-pass',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './cambiar-pass.component.html',
  styleUrls: ['./cambiar-pass.component.scss'],
})
export class CambiarPassComponent {
  @Input() usuarioId!: number;

  actual = '';
  nueva = '';
  repetir = '';
  error = '';

  constructor(
    private modalCtrl: ModalController,
    private usuarioService: UsuarioService,
    private toastCtrl: ToastController
  ) { }

  async guardar() {
    if (this.nueva !== this.repetir) {
      this.error = 'Las contraseñas nuevas no coinciden.';
      return;
    }

    const passwordData = {
      clave_actual: this.actual,
      nueva_clave: this.nueva,
      confirmar_clave: this.repetir
    };

    this.usuarioService.updatePassword(this.usuarioId, passwordData).subscribe({
      next: async () => {
        const toast = await this.toastCtrl.create({
          message: 'Contraseña actualizada correctamente',
          duration: 2000,
          color: 'success'
        });
        toast.present();
        this.modalCtrl.dismiss(true);
      },
      error: async (err) => {
        const toast = await this.toastCtrl.create({
          message: err.error?.error || 'Error al cambiar la contraseña',
          duration: 2000,
          color: 'danger'
        });
        toast.present();
      }
    });
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }
}
