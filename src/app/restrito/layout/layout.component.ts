import { Component, DestroyRef, inject } from '@angular/core';
import { ButtonModule } from "primeng/button";
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { ToastModule } from "primeng/toast";
import { AuthService } from '../../core/services/auth.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { ProfessoresService } from '../../core/services/professores.service';
import { environment } from '../../environments';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-layout',
  imports: [ButtonModule, RouterOutlet, ToastModule, ConfirmDialogModule, RouterLink, RouterLinkActive, TooltipModule, AvatarGroupModule, AvatarModule, BreadcrumbModule ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class LayoutComponent {
  private authService = inject(AuthService);
private router = inject(Router);
private confirmationService = inject(ConfirmationService)
private messageService = inject(MessageService)
private professoresService = inject(ProfessoresService)
private auth = inject(Auth);
private destroyRef = inject(DestroyRef);


open = false;
private timeout: any;
usuario: any;

version = environment.version;

home: MenuItem = {
  icon: 'pi pi-home',
  routerLink: '/restrito/dashboard'
};

breadcrumbItems: MenuItem[] = [];

ngOnInit(): void {

   this.atualizarBreadcrumb();

  this.router.events
    .pipe(
      filter(evento => evento instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe(() => {
      this.atualizarBreadcrumb();
    });

  const authUser = this.authService.usuarioLogado();

  if (!authUser) return;

  this.professoresService
      .buscarPorId(authUser.uid)
      .subscribe(usuario => {

        this.usuario = usuario;

      });

    this.iniciarMonitoramento();
  }

  getIniciais(nome?: string, sobrenome?: string): string {

  return `${nome?.charAt(0) ?? ''}${sobrenome?.charAt(0) ?? ''}`.toUpperCase();

}

async logout() {
  await this.authService.logout();
  this.router.navigate(['/login']);
}

toggleSidebar() {
  this.open = !this.open;
}
fecharSidebarMobile() {
  this.open = false;
}

toastLogout(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Ao sair você será direcionado para o login.',
      header: 'Confirmar Logout?',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Sair',
        severity: 'danger',
        icon: 'pi pi-sign-out',
      },
      accept: () => {
        this.logout();
      },
      reject: () => {
        // this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
      },
    });
  }

  iniciarMonitoramento() {
    this.resetarTempo();

    window.onmousemove = () => this.resetarTempo();

    window.onkeydown = () => this.resetarTempo();

    window.onclick = () => this.resetarTempo();
  }

  resetarTempo() {
    clearTimeout(this.timeout);

    this.timeout = setTimeout(
      () => {
        this.messageService.add({
          severity: 'warn',

          summary: 'Sessão encerrada',

          detail: 'Você ficou muito tempo inativo',
        });

        this.logout();
      },
      1000 * 60 * 20,
    );
  }

  //breadcrumb
  atualizarBreadcrumb() {
  const url = this.router.url.split('?')[0].split('#')[0];

  const paginas: Record<string, string> = {
    dashboard: 'Dashboard',
    alunos: 'Alunos',
    professores: 'Professores',
    aulas: 'Aulas',
    cobrancas: 'Cobranças',
    'minha-conta': 'Minha Conta'
  };

  const segmentos = url.split('/').filter(Boolean);

  const indiceRestrito = segmentos.indexOf('restrito');
  const caminho = segmentos.slice(indiceRestrito + 1);

  const pagina = caminho[0];

  // Página inicial
  if (!pagina || pagina === 'dashboard') {
    this.breadcrumbItems = [
      { label: 'Dashboard' }
    ];
    return;
  }

  // Dashboard sempre aparece primeiro
  this.breadcrumbItems = [
    {
      label: 'Dashboard',
      routerLink: '/restrito/dashboard'
    }
  ];

  // Identifica detalhes da aula
  const detalhesAula =
    pagina === 'aulas' && caminho.length > 1;

  this.breadcrumbItems.push({
    label: paginas[pagina] ?? 'Detalhes da aula',
    ...(detalhesAula
      ? { routerLink: '/restrito/aulas' }
      : {})
  });

  if (detalhesAula) {
    this.breadcrumbItems.push({
      label: 'Detalhes da Aula'
    });
  }
}

}
