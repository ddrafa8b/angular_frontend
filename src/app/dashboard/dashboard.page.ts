import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { IonContent, IonCol, IonRow, IonGrid } from "@ionic/angular/standalone";
import { HeaderComponent } from '../shared/components/header/header.component';
import { FooterComponent } from '../shared/components/footer/footer.component';
import { CookiesFirtsComponent } from '../shared/components/cookies-firts/cookies-firts.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    IonGrid, IonRow, IonCol, IonContent,
    CommonModule, RouterModule,
    HeaderComponent, FooterComponent,
    CookiesFirtsComponent
  ],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss', '../app.component.scss'],
})
export class DashboardPage {
  currentRoute: string = '';
  isMobileMenuOpen = false;
  showCookies = false;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
      });

    const cookies = localStorage.getItem('cookies');
    if (!cookies) {
      this.showCookies = true;
    }
  }

  isProfileRoute(): boolean {
    return this.currentRoute.includes('profile');
  }

  onMobileMenuToggle(isOpen: boolean) {
    this.isMobileMenuOpen = isOpen;
  }

  handleCookiesClosed() {
    this.showCookies = false;
  }
}
