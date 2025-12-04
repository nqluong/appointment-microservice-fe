import { DetailAppointments } from './detail-appointments';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('PatientPendingAppointments', () => {
  let component: DetailAppointments;
  let fixture: ComponentFixture<DetailAppointments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailAppointments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailAppointments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
