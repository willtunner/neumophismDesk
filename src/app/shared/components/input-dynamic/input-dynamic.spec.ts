import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputDynamic } from './input-dynamic';

describe('InputDynamic', () => {
  let component: InputDynamic;
  let fixture: ComponentFixture<InputDynamic>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputDynamic]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputDynamic);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
