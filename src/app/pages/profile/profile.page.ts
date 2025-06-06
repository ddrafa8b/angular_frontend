import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonList, IonLabel } from "@ionic/angular/standalone";
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { EditarPerfilComponent } from 'src/app/shared/components/editar-perfil/editar-perfil.component';
import { CambiarPassComponent } from 'src/app/shared/components/cambiar-pass/cambiar-pass.component';
import { ReservasComponent } from 'src/app/shared/components/reservas/reservas.component';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonLabel, IonList, IonItem, IonCardContent, IonCardTitle, IonCardHeader, IonCard, CommonModule, FormsModule, RouterModule],
  providers: [ModalController, AlertController]
})
export class ProfilePage implements OnInit {
  esArtista = false;
  esUsuario = false;
  esAdmin = false;
  usuario: any = null;
  private baseUrl = environment.apiUrl;

  constructor(
    private router: Router,
    private modalController: ModalController,
    private alertController: AlertController,
    private http: HttpClient
  ) { }

  ngOnInit() {
    const userStr = localStorage.getItem('usuario');

    if (!userStr) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const usuario = JSON.parse(userStr);
      this.usuario = usuario;

      switch (usuario?.tipo) {
        case 'artista':
          this.esArtista = true;
          break;
        case 'usuario':
          this.esUsuario = true;
          break;
        case 'admin':
          this.router.navigate(['/login']);
          break;
      }
    } catch (err) {
      console.error('Error parsing usuario from localStorage', err);
      this.router.navigate(['/login']);
    }
  }


  async abrirEditarPerfil() {
    const modal = await this.modalController.create({
      component: EditarPerfilComponent,
      componentProps: {
        usuario: this.usuario
      }
    });

    modal.onWillDismiss().then(result => {
      if (result?.data) {
        this.usuario = { ...this.usuario, ...result.data };
        localStorage.setItem('usuario', JSON.stringify(this.usuario));
      }
    });


    await modal.present();
  }

  async abrirCambiarPass() {
    const modal = await this.modalController.create({
      component: CambiarPassComponent,
      componentProps: {
        usuarioId: this.usuario.id_usuario
      }
    });

    await modal.present();
  }

  async abrirReservas() {
    const modal = await this.modalController.create({
      component: ReservasComponent,
      componentProps: {
        usuario: this.usuario
      }
    });

    await modal.present();
  }


  cerrarSesion() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('api_keys');
    this.router.navigate(['/home']).then(() => {
      window.location.reload();
    });
  }

  async confirmarBorrarCuenta() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que deseas borrar tu cuenta? Esta acción es irreversible.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Borrar', role: 'confirm', cssClass: 'danger' }
      ]
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    if (role === 'confirm') {
      this.borrarCuenta();
    }
  }

  borrarCuenta() {
    const userId = this.usuario.id_usuario;
    const tipo = this.usuario.tipo;
    let url = '';

    if (this.esUsuario) {
      url = `${this.baseUrl}/usuario/${userId}/borrar`;
    } else if (this.esArtista) {
      url = `${this.baseUrl}/artista/${userId}/borrar`;
    } else {
      return;
    }

    this.http.delete(url).subscribe({
      next: () => {
        localStorage.removeItem('usuario');
        localStorage.removeItem('api_keys');
        this.router.navigate(['/home']).then(() => {
          window.location.reload();
        });
      }
    });
  }
}