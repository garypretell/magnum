import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BigqueryComponent } from './bigquery.component';

describe('BigqueryComponent', () => {
  let component: BigqueryComponent;
  let fixture: ComponentFixture<BigqueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BigqueryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BigqueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
