import { Component, inject } from '@angular/core';
import { ButtonModule } from "primeng/button";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { ToastModule } from "primeng/toast";
import { AuthService } from '../../core/services/auth.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { ProfessoresService } from '../../core/services/professores.service';

@Component({
  selector: 'app-layout',
  imports: [ButtonModule, RouterOutlet, ToastModule, ConfirmDialogModule, RouterLink, RouterLinkActive, TooltipModule, AvatarGroupModule, AvatarModule],
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

open = false;
private timeout: any;
usuario: any;

ngOnInit(): void {

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

}
