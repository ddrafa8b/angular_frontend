import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EventosService } from '../../services/eventos.service';
import { ModalController } from '@ionic/angular';
import {
  IonHeader, IonCheckbox, IonContent, IonToolbar, IonTitle,
  IonButtons, IonButton, IonItem, IonLabel, IonInput,
  IonTextarea, IonNote
} from "@ionic/angular/standalone";
import { ReactiveFormsModule } from '@angular/forms';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-crear-evento',
  templateUrl: './crear-evento.component.html',
  styleUrls: ['./crear-evento.component.scss'],
  standalone: true,
  imports: [
    IonHeader, IonCheckbox, IonContent, IonToolbar, IonTitle,
    IonButtons, IonButton, IonItem, IonLabel, IonInput,
    IonTextarea, IonNote, ReactiveFormsModule,
    CommonModule
  ]
})
export class CrearEventoComponent {
  eventoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private eventosService: EventosService,
    private modalController: ModalController
  ) {
    this.eventoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      fecha: ['', [Validators.required, this.fechaMinimaValidator]],
      ubicacion_nombre: ['', Validators.required],
      ubicacion_url: ['', [Validators.required]],
      permiteInscripcion: [false]
    });
  }

  fechaMinimaValidator(control: AbstractControl): ValidationErrors | null {
      const fechaIngresada = new Date(control.value);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      fechaIngresada.setHours(0, 0, 0, 0);

      return fechaIngresada >= hoy ? null : { fechaInvalida: true };
    }

  cerrarModal() {
    this.modalController.dismiss();
  }

  onSubmit() {
    if (this.eventoForm.invalid) {
      this.eventoForm.markAllAsTouched();
      return;
    }

    const usuarioStr = localStorage.getItem('usuario');
    const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;

    if (!usuario || !usuario.id_usuario) {
      return;
    }

    const nuevoEvento = {
      nombre: this.eventoForm.value.nombre,
      descripcion: this.eventoForm.value.descripcion,
      fecha: this.eventoForm.value.fecha,
      ubicacion_nombre: this.eventoForm.value.ubicacion_nombre,
      ubicacion_url: this.eventoForm.value.ubicacion_url,
    };

    this.eventosService.crearEventoArtista(usuario.id_usuario, nuevoEvento).subscribe({
      next: () => {
        this.cerrarModal();
      }
    });
  }
}
