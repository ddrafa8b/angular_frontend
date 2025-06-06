import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [CommonModule, RouterModule],
  standalone: true,
})
export class FooterComponent {
  isMenuOpen = false;
  userLogued = false;
  isDesktop = window.innerWidth >= 769;

  @Output() menuStatus = new EventEmitter<boolean>();

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
}
