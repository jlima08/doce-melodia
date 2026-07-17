import { Routes } from '@angular/router';
import { authGuard } from './core/guard/auth.guard';

export const routes: Routes = [
  {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./login/login.component')
            .then(m => m.LoginComponent)
      },
      {
       path: 'restrito',
       canActivate: [authGuard],
       loadComponent: () =>
        import('./restrito/layout/layout.component')
            .then(m => m.LayoutComponent),

        children: [
        {
            path: 'alunos',
            loadComponent: () =>
            import('./restrito/alunos/alunos.component')
                .then(m => m.AlunosComponent)
        },
        {
            path: 'professores',
            loadComponent: () =>
            import('./restrito/professores/professores.component')
                .then(m => m.ProfessoresComponent)
        },
        {
            path: 'aulas',
            loadComponent: () =>
            import('./restrito/aulas/aulas.component')
                .then(m => m.AulasComponent)
        },
        ]
       },
]
