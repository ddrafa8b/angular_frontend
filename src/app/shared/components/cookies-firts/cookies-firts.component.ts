import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cookies-firts',
  templateUrl: './cookies-firts.component.html',
  styleUrls: ['./cookies-firts.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class CookiesFirtsComponent {
  @Output() closed = new EventEmitter<void>();

  acceptCookies() {
    localStorage.setItem('cookies', JSON.stringify({ status: 'accepted' }));
    this.closed.emit();
  }

  cancelCookies() {
    localStorage.setItem('cookies', JSON.stringify({ status: 'canceled' }));
    this.closed.emit();
  }
}
