import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AulasDetalhesComponent } from './aulas-detalhes.component';

describe('AulasDetalhesComponent', () => {
  let component: AulasDetalhesComponent;
  let fixture: ComponentFixture<AulasDetalhesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AulasDetalhesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AulasDetalhesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
