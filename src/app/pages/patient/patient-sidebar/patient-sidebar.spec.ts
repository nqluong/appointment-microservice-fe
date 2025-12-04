import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientSidebar } from './patient-sidebar';

describe('PatientSidebar', () => {
  let component: PatientSidebar;
  let fixture: ComponentFixture<PatientSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientSidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientSidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
