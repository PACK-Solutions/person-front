import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'person',
        pathMatch: 'full'
      },
    {
        path: 'person',
        children: [
          {
            path: '',
            loadComponent: () => import('./person').then(m => m.PersonListComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./person').then(m => m.PersonFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./person').then(m => m.PersonDetailComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./person').then(m => m.PersonFormComponent)
          }
        ]
      },
];
