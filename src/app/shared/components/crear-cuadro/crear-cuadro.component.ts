import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CuadroService } from '../../services/cuadro.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalController } from '@ionic/angular';
import {
  IonHeader, IonCheckbox, IonContent, IonToolbar, IonTitle,
  IonButtons, IonButton, IonItem, IonLabel, IonInput,
  IonTextarea, IonNote
} from "@ionic/angular/standalone";

@Component({
  selector: 'app-crear-cuadro',
  templateUrl: './crear-cuadro.component.html',
  styleUrls: ['./crear-cuadro.component.scss'],
  standalone: true,
  imports: [
    IonHeader, IonCheckbox, IonContent, IonToolbar, IonTitle,
    IonButtons, IonButton, IonItem, IonLabel, IonInput,
    IonTextarea, IonNote,
    ReactiveFormsModule, CommonModule
  ]
})
export class CrearCuadroComponent {
  cuadroForm: FormGroup;
  imagenPreview: any = null;
  imagenFile: File | null = null;
  errorImagen: string | null = null;

  constructor(
    private fb: FormBuilder,
    private cuadroService: CuadroService,
    private sanitizer: DomSanitizer,
    private modalController: ModalController
  ) {
    this.cuadroForm = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      isBookable: [true],
      fecha_creacion: ['', Validators.required]
    });
  }

  cerrarModal() {
    this.modalController.dismiss();
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg'];
    if (!validTypes.includes(file.type)) {
      this.errorImagen = 'Solo se permite formato .jpg';
      this.imagenFile = null;
      return;
    }

    this.errorImagen = null;
    this.imagenFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagenPreview = this.sanitizer.bypassSecurityTrustUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  onSubmit() {
    if (!this.cuadroForm.valid || !this.imagenFile) {
      this.errorImagen = this.imagenFile ? null : 'Debes seleccionar una imagen .jpg';
      return;
    }

    const usuarioStr = localStorage.getItem('usuario');
    const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;

    if (!usuario || !usuario.id_usuario) {
      return;
    }

    const formData = new FormData();
    formData.append('titulo', this.cuadroForm.value.titulo);
    formData.append('descripcion', this.cuadroForm.value.descripcion);
    formData.append('isBookable', this.cuadroForm.value.isBookable.toString());
    formData.append('fecha_creacion', this.cuadroForm.value.fecha_creacion);
    formData.append('id_artista', usuario.id_usuario);
    formData.append('imagen', this.imagenFile, this.imagenFile.name);

    this.cuadroService.crearCuadro(formData).subscribe({
      next: () => {
        this.cerrarModal();
        window.location.reload();
      }
    });
  }
}
