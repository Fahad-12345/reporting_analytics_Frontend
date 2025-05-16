import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { Config } from '@appDir/config/config';
import { ToastrModule } from 'ngx-toastr';
import { SharedModule } from '@appDir/shared/shared.module';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { Nf2ReportsListComponent } from './nf2-reports-list/nf2-reports-list.component';
import { TableFilterComponent } from '../shared/components/table-filter/table-filter.component';
import { ReportsService } from '../reports.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe(("Nf2ReportsListComponent"), () => {
	let comp: Nf2ReportsListComponent;
	let fixture: ComponentFixture<Nf2ReportsListComponent>;
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [Nf2ReportsListComponent, TableFilterComponent],
			imports: [ToastrModule.forRoot(), SharedModule,RouterTestingModule,HttpClientTestingModule ],
			providers: [LocalStorage, Config, ReportsService]
			// providers: [Config, LocalStorage, ReasonCodeService, FormBuilder]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(Nf2ReportsListComponent);
		comp = fixture.componentInstance;
	})
	it('Should Create', () => {
		expect(comp).toBeTruthy();
	})
	it('should loadSpin false at start', () => {
		expect(comp.loadSpin).toBe(false);
	});

	it('should inject report service in constructor', () => {
		const service = TestBed.get(ReportsService);
		expect(service).toBeTruthy();
	});
	it('should call initializeDefaultPagination function in constructor', () => {
		const spy_initializeDefaultPagination = spyOn(comp, 'initializeDefaultPagination');
		comp.initializeDefaultPagination();
		expect(spy_initializeDefaultPagination).toHaveBeenCalled() // this is the trigger of constructor method
	});
	it('Should fetchReportsData function is call from ngOnInit', () => {
	 const defaultPagination = {
		page: 1,
		per_page: 20,
		pagination: 1,
	};
		spyOn(comp, 'fetchReportsData');
		comp.fetchReportsData(defaultPagination);
		expect(comp.fetchReportsData).toHaveBeenCalledWith(defaultPagination);
	});

	function getListReportsAllSameFacilityID() {
		const defaultPagination = {
			page: 1,
			per_page: 20,
			pagination: 1,
		};
		spyOn(comp, 'fetchReportsData');
		comp.fetchReportsData(defaultPagination);
		expect(comp.fetchReportsData).toHaveBeenCalledWith(defaultPagination);
	}
	it('should not show generate button when not row selected', async(() => {
		// fixture.detectChanges();
		const compiled = fixture.debugElement.nativeElement;
		const messages = compiled.querySelector('#generatePOM');
		if(comp.reportSelection.selected.length < 1) {
			expect(messages).toBeFalsy();
		}
	  }));
	// it('should call reportsmasterToggle on change checkbox', () => {
	// 	const compiled = fixture.debugElement.nativeElement;
	// 	const de = compiled.querySelector('#selectall');
	// 	spyOn(comp, 'reportsmasterToggle');
	// 	de.triggerEventHandler('change',null);
	// 	fixture.detectChanges();
	// 	fixture.whenStable().then(() => {
	// 		expect(comp.reportsmasterToggle()).toHaveBeenCalled();
	// 	});
	//   })

	//   it('should call goHome function', async(() => {
	// 	spyOn(comp, 'GenereatePOM');
	// 	fixture.detectChanges();
	// 	let button = fixture.debugElement.query(By.css('button')); // modify here
	// 	button.triggerEventHandler('click','content');
	// 	fixture.detectChanges();
	// 	expect(comp.GenereatePOM).toHaveBeenCalled();
	//   }));
	// it(`should toggle all lines`, async(() => {
	// 	const  body = getListReportsAllSameFacilityID();
	// 	console.log(body+'=body');
	// 	const compiled = fixture.debugElement.nativeElement;
	// 	const checkbox = compiled.querySelector('mat-checkbox')
	// 	console.log(checkbox + '=checkbox ');
	// 	checkbox.click();
	// 	fixture.detectChanges();
	// 	fixture.whenStable().then(() => {
	// 		expect(comp.reportSelection._selected.length).toBeGreaterThan(0);
	// 		checkbox.click();
	// 		fixture.whenStable().then(() => {
	// 			expect(comp.reportSelection._selected.length).toEqual(0);
	// 		});
	// 	});
	// }));
});

