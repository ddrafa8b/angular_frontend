import { Routes } from '@angular/router';
import { DashboardPage } from './dashboard.page';

export const routes: Routes = [
  {
    path: '',
    component: DashboardPage,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () => import('../pages/home/home.page').then(m => m.HomePage)
      },
      {
        path: 'gallery',
        loadComponent: () => import('../pages/gallery/gallery.page').then(m => m.GalleryPage)
      },
      {
        path: 'events',
        loadComponent: () => import('../pages/events/events.page').then(m => m.EventsPage)
      },
      {
        path: 'profile',
        loadComponent: () => import('../pages/profile/profile.page').then(m => m.ProfilePage)
      },
      {
        path: 'login',
        loadComponent: () => import('../pages/login/login.page').then(m => m.LoginPage)
      },
      {
        path: 'solicitud',
        loadComponent: () => import('../pages/solicitud/solicitud.page').then(m => m.SolicitudPage)
      },
    ]
  }
];
