import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxDynamic } from './checkbox-dynamic';

describe('CheckboxDynamic', () => {
  let component: CheckboxDynamic;
  let fixture: ComponentFixture<CheckboxDynamic>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxDynamic]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckboxDynamic);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
