import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren:() => import('./dashboard/dashboard.routes').then(m => m.routes),
  },
  {
    path: 'information',
    loadComponent:() => import('./information/information.page').then(m => m.InformationPage),
  },
  {
    path: 'solicitud',
    loadComponent: () => import('./pages/solicitud/solicitud.page').then( m => m.SolicitudPage)
  },
];

