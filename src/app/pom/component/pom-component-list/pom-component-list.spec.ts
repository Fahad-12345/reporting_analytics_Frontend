import { RequestMockService } from './../../../shared/mock-services/RequestMock.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
	TestBed,
	async,
	ComponentFixture,
	fakeAsync,
	tick,
	discardPeriodicTasks,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Config } from '@appDir/config/config';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { SharedModule } from '@appDir/shared/shared.module';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { PomSplitListComponent } from './pom-component-list';
import { PomEnum } from '@appDir/pom/pom.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { PomSplitListMockValues } from './pom-component-mock-values/pom-component.mock-values';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('PomSplitListComponent', () => {
	let comp: PomSplitListComponent;
	let fixture: ComponentFixture<PomSplitListComponent>;
	let requestMockService = new RequestMockService();
	let pomSplitGetMockValues = new PomSplitListMockValues();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [PomSplitListComponent],
			imports: [SharedModule, RouterTestingModule, ToastrModule.forRoot(), BrowserAnimationsModule,HttpClientTestingModule],
			schemas: [NO_ERRORS_SCHEMA],
			providers: [
				Config,
				LocalStorage,
				ToastrService,
				{
					provide: ActivatedRoute,
					useValue: {
						queryParams: of({ id: 10 }),
					},
				},
				{
					provide: Router,
					useValue: {
						url: '/pom/pom-list',
					},
				},
				{
					provide: RequestService,
					useValue: requestMockService,
				},
			],
		}).compileComponents();
	}));
	beforeEach(() => {
		fixture = TestBed.createComponent(PomSplitListComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should ngOnInit Test', () => {
		spyOn(comp, 'getPomType');
		spyOn(comp, 'getPomListing');
		spyOn(comp, 'paramsObject');
		comp.ngOnInit();
		expect(comp.getPomType).toHaveBeenCalled();
		expect(comp.getPomListing).toHaveBeenCalled();
		expect(comp.paramsObject).toHaveBeenCalled();
		expect(comp.page.pageNumber).toBe(1);
		expect(comp.page.size).toBe(10);
		expect(comp.page.offset).toBe(0);
	});
	it('Should getPomType Test If url pom-list', () => {
		const router = TestBed.get(Router);
		router.url = '/pom/pom-list';
		comp.getPomType();
		debugger;
		expect(comp.type_id).toMatch(PomEnum.typeIdBillPom);
	});
	it('Should getPomType Test If url pom-list', () => {
		const router = TestBed.get(Router);
		router.url = '/pom/case-list';
		comp.getPomType();
		debugger;
		expect(comp.type_id).toMatch(PomEnum.typeIdCasePom);
	});
	it('Should pageLimit Test', () => {
		spyOn(comp, 'getPomListing');
		comp.pageLimit(10);
		expect(comp.page.size).toBe(10);
		expect(comp.page.pageNumber).toBe(1);
		expect(comp.getPomListing).toHaveBeenCalled();
	});
	it('Should paramsObject Test', () => {
		comp.type_id = 1;
		let result = comp.paramsObject({});
		expect(result).toEqual({
			type_id: 1,
			per_page: 10,
			pagination: 1,
			page: 0,
		});
	});
	it('Should onPageChange Test', () => {
		spyOn(comp, 'getPomListing');
		spyOn(comp, 'paramsObject');
		comp.onPageChange({ offset: 0 });
		expect(comp.page.offset).toBe(0);
		expect(comp.page.pageNumber).toBe(1);
		expect(comp.getPomListing).toHaveBeenCalled();
		expect(comp.paramsObject).toHaveBeenCalled();
	});
	it('Should viewDoc Test If params true', () => {
		spyOn(comp, 'getLinkwithAuthToken');
		spyOn(window, 'open');
		comp.viewDoc({ scan_pom_media: { link: 'link' } }, true);
		expect(comp.getLinkwithAuthToken).toHaveBeenCalled();
		expect(window.open).toHaveBeenCalled();
	});
	it('Should viewDoc Test If params false', () => {
		spyOn(comp, 'getLinkwithAuthToken');
		spyOn(window, 'open');
		comp.viewDoc({ pom_media: { link: 'link' } }, false);
		expect(comp.getLinkwithAuthToken).toHaveBeenCalled();
		expect(window.open).toHaveBeenCalled();
	});
	it('Should getLinkwithAuthToken Test If Token true', () => {
		spyOn(comp['storageData'], 'getToken').and.returnValue(true);
		let result = comp.getLinkwithAuthToken('link');
		debugger;
		expect(result).toMatch('link&token=true');
	});
	it('Should getPomListing Test If Successfull', fakeAsync(() => {
		spyOn(comp, 'addUrlQueryParams');
		spyOn(window, 'setTimeout');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of(pomSplitGetMockValues.pomListingResponce).pipe(delay(1)),
		);
		comp.getPomListing({ offset: 0 });
		discardPeriodicTasks();
		tick(15000);
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(window.setTimeout).toHaveBeenCalled();
		expect(comp.loadSpin).toBe(false);
		expect(comp.pomData.length).toBe(0);
		expect(comp.page.offset).toBe(0);
		expect(comp.page.totalElements).toBe(pomSplitGetMockValues.pomListingResponce.result.total);
		expect(comp.page.totalPages).toBe(pomSplitGetMockValues.pomListingResponce.result.page);
	}));
	it('Should getPomListing Test If UnSuccessfull', fakeAsync(() => {
		spyOn(comp, 'addUrlQueryParams');
		spyOn(requestMockService, 'sendRequest').and.returnValue(throwError('Error'));
		comp.getPomListing({ offset: 0 });
		discardPeriodicTasks();
		tick(15000);
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.loadSpin).toBe(false);
	}));
	it('Should onPomUpload Test ', fakeAsync(() => {
		debugger;
		comp.fileInput = {
			nativeElement: {
				value: 'MOCKED',
			},
		};
		spyOn(comp, 'openTimeStamp');
		comp.onPomUpload({ id: 1 }, 'upload');
		expect(comp.openTimeStamp).toHaveBeenCalled();
		expect(comp.tags).toBeNull();
		expect(comp.scanFile).toBeNull();
		debugger;
		expect(comp.fileInput.nativeElement.value).toMatch('');
	}));
	it('Should makeFileName Test', () => {
		let result = comp.makeFileName(1);
		debugger;
		expect(result).toMatch(`POM_1_${comp.getCurrentDateWithFormat('MM-DD-YY')}.pdf`);
	});
	it('Should getCurrentDateWithFormat Test', () => {
		let result = comp.getCurrentDateWithFormat('MM-DD-YY');
		debugger;
		expect(result).toMatch(comp.getCurrentDateWithFormat('MM-DD-YY'));
	});
	it('Should getPOMDetail Test', () => {
		comp.type_id = PomEnum.typeIdCasePom;
		spyOn(comp, 'openPomModal');
		comp.getPOMDetail(10, 'pomModal', { pom_case_detail: [{ id: 10 }] });
		expect(comp.openPomModal).toHaveBeenCalled();
		expect(comp.billingPomData[0]).toEqual({ id: 10 });
	});
	it('Should getPOMDetail Test If Successfull If Type ID 1', fakeAsync(() => {
		comp.type_id = PomEnum.typeIdBillPom;
		spyOn(comp, 'openPomModal');
		spyOn(window, 'setTimeout');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of(pomSplitGetMockValues.pomListingResponce).pipe(delay(1)),
		);
		comp.getPOMDetail(10, 'pomModal', { pom_case_detail: [{ id: 10 }] });
		discardPeriodicTasks();
		tick(15000);
		expect(comp.openPomModal).toHaveBeenCalled();
		expect(window.setTimeout).toHaveBeenCalled();
		expect(comp.loadSpin).toBe(false);
		expect(comp.billingPomData.length).toBe(0);
	}));
	it('Should getPomListing Test If UnSuccessfull If Type ID 1', fakeAsync(() => {
		comp.type_id = PomEnum.typeIdBillPom;
		spyOn(requestMockService, 'sendRequest').and.returnValue(throwError('Error'));
		comp.getPOMDetail(10, 'pomModal', { pom_case_detail: [{ id: 10 }] });
		discardPeriodicTasks();
		tick(15000);
		expect(comp.loadSpin).toBe(false);
	}));
	it('Should openTimeStamp Test', () => {
		spyOn(comp['modalService'], 'open');
		comp.openTimeStamp({}, 'uploadTimeStamp');
		expect(comp['modalService'].open).toHaveBeenCalled();
	});
	it('Should openPomModal Test', () => {
		spyOn(comp['modalService'], 'open');
		comp.openPomModal({}, 'uploadTimeStamp');
		expect(comp['modalService'].open).toHaveBeenCalled();
	});
	// xit('Should onFileChange Test',()=>{
	// 	spyOn(window, 'FileReader').and.returnValue({
	// 		readAsText: function(file) {
	// 		  this.onload({
	// 			target: {
	// 			  result: 'text content'
	// 			}
	// 		  });
	// 		}
	// 	  });
	// 	comp.onFileChange({target:{files:[{name:'file_name.pdf'}]}})
	// });
	// xit('Should addUrlQueryParams Test', () => {
	// 	spyOn(comp['location'], 'replaceState');
	// 	comp.addUrlQueryParams({ id: 10 });
	// 	expect(comp['location'].replaceState).toHaveBeenCalled();
	// });
	it('Should filterResponseData Test', () => {
		spyOn(comp, 'getPomListing');
		spyOn(comp, 'paramsObject');
		comp.filterResponseData([]);
		expect(comp.page.offset).toBe(0);
		expect(comp.page.pageNumber).toBe(1);
		expect(comp.getPomListing).toHaveBeenCalled();
		expect(comp.paramsObject).toHaveBeenCalled();
	});
	it('Should addMedia Test', () => {
		spyOn(comp['toastrService'], 'error');
		comp.scanFile = null;
		let result = comp.addMedia();
		expect(comp['toastrService'].error).toHaveBeenCalled();
		expect(comp.scanFile).toBeNull();
		expect(result).toBe(false);
	});
	it('Should addMedia Test If scanFile.type != "application/pdf', fakeAsync(() => {
		comp.scanFile = new File([new Blob()], '28-5-2021_Staging_Release Notes.pdf', {
			type: 'application/doc',
		});
		comp.file_name = 'POM_25_09-09-21.pdf';
		comp.type_id = PomEnum.typeIdCasePom;
		comp.pomId = '10';
		comp.tags = [
			{
				value: 10,
			},
		];
		let result = comp.addMedia();
		tick(15000);
		discardPeriodicTasks();
		debugger;
		expect(result).toBe(false);
	}));
	it('Should addMedia Test When Status False', fakeAsync(() => {
		comp.scanFile = new File([new Blob()], '28-5-2021_Staging_Release Notes.pdf', {
			type: 'application/pdf',
		});
		comp.file_name = 'POM_25_09-09-21.pdf';
		comp.type_id = PomEnum.typeIdBillPom;
		comp.pomId = '10';
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of(pomSplitGetMockValues.addMediaRespWithStatusFalse).pipe(delay(1)),
		);
		comp.addMedia();
		tick(20000);
		discardPeriodicTasks();
		debugger;
		expect(comp.loadSpin).toBe(false);
		expect(comp.buttonDisabled).toBe(false);
	}));
	it('Should addMedia Test When Request Successfull', fakeAsync(() => {
		spyOn(comp,'getPomListing');
		comp.scanFile = new File([new Blob()], '28-5-2021_Staging_Release Notes.pdf', {
			type: 'application/pdf',
		});
		comp.file_name = 'POM_25_09-09-21.pdf';
		comp.type_id = PomEnum.typeIdBillPom;
		comp.fileInput = {
			nativeElement: {
				value: 'MOCKED'
			},
		};
		comp.pomId = '10';
		spyOn(comp['modalService'],'dismissAll');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of(pomSplitGetMockValues.addMediaResp).pipe(delay(1)),
		);
		comp.addMedia();
		tick(20000);
		discardPeriodicTasks();
		debugger;
		expect(comp.loadSpin).toBe(false);
		expect(comp.buttonDisabled).toBe(false);
		expect(comp['modalService'].dismissAll).toHaveBeenCalled();
		expect(comp.getPomListing).toHaveBeenCalled();
	}));
	it('Should addMedia Test If Unsuccessfull', fakeAsync(() => {
		comp.scanFile = new File([new Blob()], '28-5-2021_Staging_Release Notes.pdf', {
			type: 'application/pdf'
		});
		comp.file_name = 'POM_25_09-09-21.pdf';
		comp.pomId = '10';
		comp.receivedPOMDate = '2021-08-25';
		spyOn(comp, 'getPomListing');
		spyOn(comp['modalService'], 'dismissAll');
		spyOn(requestMockService, 'sendRequest').and.returnValue(throwError({}));
		comp.addMedia();
		tick(15000);
		discardPeriodicTasks();
		debugger;
		expect(comp.loadSpin).toBe(false);
		expect(comp.buttonDisabled).toBe(false);
	}));
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
