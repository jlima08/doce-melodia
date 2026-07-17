import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { PrimeNG, providePrimeNG } from 'primeng/config';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import Aura from '@primeng/themes/aura';
import MyPreset from './myprest';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from './environments';

function initializePrimeNG(primeNG: PrimeNG) {
  return () => {
    primeNG.setTranslation({
      dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
      dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
      dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
      monthNames: [
        'Janeiro', 'Fevereiro', 'Março', 'Abril',
        'Maio', 'Junho', 'Julho', 'Agosto',
        'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ],
      monthNamesShort: [
        'Jan', 'Fev', 'Mar', 'Abr',
        'Mai', 'Jun', 'Jul', 'Ago',
        'Set', 'Out', 'Nov', 'Dez'
      ],
      today: 'Hoje',
      clear: 'Limpar',
      firstDayOfWeek: 0,
      dateFormat: 'dd/mm/yy'
    });
  };
}

export const appConfig: ApplicationConfig = {
   providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
     provideHttpClient(),
    providePrimeNG({
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: false
        }
      }
    }),
    provideFirebaseApp(() => initializeApp(environment.firebase)),

    provideAuth(() => getAuth()),

    provideFirestore(() => getFirestore()),
    {
    provide: APP_INITIALIZER,
    useFactory: initializePrimeNG,
    deps: [PrimeNG],
    multi: true
  }
  ]
};
