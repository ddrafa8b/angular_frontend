import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../shared/services/login.service';
import { IonicModule, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [CommonModule, FormsModule, IonicModule],
  standalone: true,
})
export class LoginPage {
  email = '';
  clave = '';
  nombre_usuario = '';
  modoRegistro = false;

  usuarioId: number | null = null;
  esArtista = false;
  esUsuario = false;
  esAdmin = false;

  constructor(
    private loginService: LoginService,
    private alertController: AlertController,
  ) { }

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

  alternarModo() {
    this.modoRegistro = !this.modoRegistro;
  }

  private emailValido(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  async iniciarSesion() {
    if (!this.emailValido(this.email)) {
      const alert = await this.alertController.create({
        header: 'Email inválido',
        message: 'Por favor, ingresa un email válido.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    if (this.modoRegistro) {
      this.registrarUsuario();
    } else {
      this.loginService.login(this.email, this.clave).subscribe({
        next: async (res) => {
          if (res?.id_usuario) {
            const alert = await this.alertController.create({
              header: 'Bienvenido',
              message: `Hola, ${res.nombre_usuario}!`,
              buttons: ['OK'],
            });
            await alert.present();
            await alert.onDidDismiss();
            window.location.href = '/';
          }
        },
        error: async () => {
          const alert = await this.alertController.create({
            header: 'Usuario no encontrado',
            message: '¿Deseas registrarte con estos datos?',
            buttons: [
              {
                text: 'Cancelar',
                role: 'cancel'
              },
              {
                text: 'Registrar',
                handler: () => this.modoRegistro = true
              }
            ]
          });
          await alert.present();
        }
      });
    }
  }

  registrarUsuario() {
    const nuevoUsuario = {
      email: this.email,
      clave: this.clave,
      nombre: this.nombre_usuario,
      nombre_usuario: this.nombre_usuario
    };

    this.loginService.registro(nuevoUsuario).subscribe({
      next: async () => {
        const alert = await this.alertController.create({
          header: 'Registro exitoso',
          message: 'Tu cuenta ha sido creada. ¡Bienvenido!',
          buttons: ['OK']
        });
        await alert.present();
        await alert.onDidDismiss();
        window.location.href = '/';
      },
      error: async (error) => {
        const message = error.status === 409
          ? 'El email o nombre de usuario ya existe.'
          : 'Error al registrar el usuario.';
        const alert = await this.alertController.create({
          header: 'Error',
          message,
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }
}
