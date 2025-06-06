import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carrusel',
  standalone: true,
  templateUrl: './carrusel.component.html',
  styleUrls: ['./carrusel.component.scss'],
  imports: [CommonModule],
})
export class CarruselComponent implements AfterViewInit {
  images = [
    { src: 'assets/char1.png', name: 'Francisco Pablo Millán Ortiz' },
    { src: 'assets/char2.png', name: 'Yumara Vallejo Vallejo' },
    { src: 'assets/char3.png', name: 'Antonio Luis Navarro Florecilla' },
    { src: 'assets/char4.png', name: 'Rafael Díaz Delgado' },
    { src: 'assets/char5.png', name: 'Daniela Benítez Pérez' },
    { src: 'assets/char6.png', name: 'Victor Ivanov' },
    { src: 'assets/char7.png', name: 'Daniel Marín Díaz' },
    { src: 'assets/char8.png', name: 'Iván Santos Galán' },
    { src: 'assets/char9.png', name: 'Nicolás Leo Santiago' },
    { src: 'assets/char10.png', name: 'Mario Díaz Arias' }
  ];

  ngAfterViewInit() {
    const Swiper = (window as any).Swiper;
    new Swiper('.swiper', {
      loop: true,
      centeredSlides: true,
      slidesPerView: 3,
      spaceBetween: 5,
      autoplay: {
        delay: 2500,
        disableOnInteraction: false
      },
    });
  }
}
