import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonTitle } from '@ionic/angular/standalone';
import { CarruselComponent } from "../../shared/components/carrusel/carrusel.component";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonTitle, IonHeader, CommonModule, FormsModule, CarruselComponent, RouterModule]
})
export class HomePage implements OnInit {

  esArtista = false;
  esUsuario = false;
  esAdmin = false;

  constructor() { }

  ngOnInit() {
    const userStr = localStorage.getItem('usuario');
    if (userStr) {
      try {
        const usuario = JSON.parse(userStr);
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
}
