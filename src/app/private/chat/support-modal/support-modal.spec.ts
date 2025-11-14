import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportModal } from './support-modal';

describe('SupportModal', () => {
  let component: SupportModal;
  let fixture: ComponentFixture<SupportModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupportModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
