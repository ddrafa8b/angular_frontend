import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [CommonModule, RouterModule],
  standalone: true,
})
export class HeaderComponent {
  isMenuOpen = false;
  userLogued = false;
  userTipo: 'usuario' | 'artista' | 'admin' | null = null;
  isDesktop = window.innerWidth >= 769;

  @Output() menuStatus = new EventEmitter<boolean>();

  constructor() {
  const user = localStorage.getItem('usuario');
  if (user) {
    const parsedUser = JSON.parse(user);
    this.userLogued = true;
    this.userTipo = parsedUser?.tipo || null;
  }
}

  @HostListener('window:resize', [])
  onResize() {
    this.isDesktop = window.innerWidth >= 769;

    if (this.isDesktop) {
      this.isMenuOpen = false;
      this.menuStatus.emit(false);
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.menuStatus.emit(this.isMenuOpen);
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('api_keys');
    this.userLogued = false;
    this.userTipo = null;
    window.location.reload();
  }
}
