import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-editar-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './editar-perfil.component.html',
  styleUrls: ['./editar-perfil.component.scss'],
})
export class EditarPerfilComponent implements OnInit {
  @Input() usuario: any;

  email = '';
  nombre = '';
  nombre_usuario = '';
  biografia = '';

  constructor(
    private modalCtrl: ModalController,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit() {
    this.email = this.usuario.email || '';
    this.nombre = this.usuario.nombre || '';
    this.nombre_usuario = this.usuario.nombre_usuario || '';
    this.biografia = this.usuario.biografia || '';
  }

  guardarCambios() {
    const payload: any = {
      id_usuario: this.usuario.id_usuario,
      email: this.email,
      nombre_usuario: this.nombre_usuario
    };

    if (this.usuario.tipo === 'artista') {
      payload.nombre = this.nombre;
      payload.biografia = this.biografia;
    }

    this.usuarioService.updateUsuario(payload).subscribe(() => {
      this.modalCtrl.dismiss(payload);
    });
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }
}
