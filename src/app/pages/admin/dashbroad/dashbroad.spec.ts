import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dashbroad } from './dashbroad';

describe('Dashbroad', () => {
  let component: Dashbroad;
  let fixture: ComponentFixture<Dashbroad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashbroad]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dashbroad);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
