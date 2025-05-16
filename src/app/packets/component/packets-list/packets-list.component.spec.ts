import { RequestMockService } from '@appDir/shared/mock-services/RequestMock.service';
import { LocalStorage } from './../../../shared/libs/localstorage';
import { Config } from './../../../config/config';
import { SharedModule } from './../../../shared/shared.module';
import {
	async,
	ComponentFixture,
	TestBed,
	tick,
	fakeAsync,
	discardPeriodicTasks,
} from '@angular/core/testing';
import { PacketsListComponent } from './packets-list.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { delay } from 'rxjs/operators';
import { RequestService } from '@appDir/shared/services/request.service';
import { PacketListMockValues } from './packet-list-mock-values/packet-list-mock-values';
import { CustomDiallogMockService } from '@appDir/shared/mock-services/CustomDialog.service';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('PacketsListComponent', () => {
	let component: PacketsListComponent;
	let fixture: ComponentFixture<PacketsListComponent>;
	let requestMockService = new RequestMockService();
	let packetListGetMockValues = new PacketListMockValues();
	let customDialogMockService = new CustomDiallogMockService();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [PacketsListComponent],
			imports: [SharedModule, RouterTestingModule, ToastrModule.forRoot()],
			providers: [
				Config,
				LocalStorage,
				ToastrService,
				{
					provide: ActivatedRoute,
					useValue: {
						queryParams: of({ page: 5, per_page: 20 })
					}
				},
				{
					provide: RequestService,
					useValue: requestMockService,
				},
				{
					provide: CustomDiallogService,
					useValue: customDialogMockService,
				},
			],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PacketsListComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should create', () => {
		expect(component).toBeTruthy();
	});
	it('Should ngOnInit Test', () => {
		spyOn(component, 'getPacketInfo');
		component.ngOnInit();
		expect(component.getPacketInfo).toHaveBeenCalled();
		expect(component.page.size).toBe(20);
		expect(component.page.pageNumber).toBe(5);
		expect(component.page.offset).toBe(component.page.pageNumber - 1);
	});
	it('Should pageLimit Test', () => {
		spyOn(component, 'getPacketInfo');
		component.pageLimit(10);
		expect(component.getPacketInfo).toHaveBeenCalled();
		expect(component.page.size).toBe(10);
		expect(component.page.pageNumber).toBe(1);
		expect(component.page.offset).toBe(0);
	});
	it('Should onPageChange Test', () => {
		spyOn(component, 'getPacketInfo');
		spyOn(component, 'paramsObject');
		component.onPageChange({ offset: 0 });
		expect(component.getPacketInfo).toHaveBeenCalled();
		expect(component.paramsObject).toHaveBeenCalled();
		expect(component.page.pageNumber).toBe(1);
		expect(component.page.offset).toBe(0);
	});
	it('Should getPacketDetail Test If Successfull', fakeAsync(() => {
		spyOn(component['modalService'], 'open');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of(packetListGetMockValues.billingPacketData).pipe(delay(1)),
		);
		component.getPacketDetail(10, 'pomModal');
		discardPeriodicTasks();
		tick(15000);
		expect(component['modalService'].open).toHaveBeenCalled();
		expect(component.loadSpin).toBe(false);
		expect(component.billingPacketData.length).toBe(0);
	}));
	it('Should getPacketDetail Test If UnSuccessfull', fakeAsync(() => {
		spyOn(component['toastrService'], 'error');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			throwError({ error: { message: 'Error' } }),
		);
		component.getPacketDetail(10, 'pomModal');
		discardPeriodicTasks();
		tick(15000);
		expect(component['toastrService'].error).toHaveBeenCalled();
		expect(component.loadSpin).toBe(false);
	}));
	it('Should downloadPacket Test If Successfull If Result.Data Exists', fakeAsync(() => {
		spyOn(window, 'open');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of(packetListGetMockValues.downloadPacketResp).pipe(delay(1)),
		);
		component.downloadPacket({ id: 10 });
		discardPeriodicTasks();
		tick(15000);
		expect(window.open).toHaveBeenCalled();
		expect(component.loadSpin).toBe(false);
	}));
	it('Should downloadPacket Test If Successfull If Result.Data Not Exists', fakeAsync(() => {
		spyOn(component['toastrService'], 'error');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of(packetListGetMockValues.downloadPacketRespIfUrlNotExists).pipe(delay(1)),
		);
		component.downloadPacket({ id: 10 });
		discardPeriodicTasks();
		tick(15000);
		expect(component['toastrService'].error).toHaveBeenCalled();
	}));
	it('Should downloadPacket Test If UnSuccessfull', fakeAsync(() => {
		spyOn(component['toastrService'], 'error');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			throwError({ error: { message: 'Error' } }),
		);
		component.downloadPacket({ id: 10 });
		discardPeriodicTasks();
		tick(15000);
		expect(component['toastrService'].error).toHaveBeenCalled();
		expect(component.loadSpin).toBe(false);
	}));
	it('Should rePacket When Subscribe successfull & confirmed true', fakeAsync(() => {
		spyOn(component, 'repacketingPackets');
		spyOn(customDialogMockService, 'confirm').and.returnValue(Promise.resolve(true));
		component.rePacket({ id: 10 });
		expect(customDialogMockService.confirm).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(component.loadSpin).toBe(true);
		expect(component.repacketingPackets).toHaveBeenCalled();
	}));
	it('Should rePacket When Subscribe successfull & confirmed false', fakeAsync(() => {
		spyOn(component, 'repacketingPackets');
		spyOn(customDialogMockService, 'confirm').and.returnValue(Promise.resolve(false));
		component.rePacket({ id: 10 });
		expect(customDialogMockService.confirm).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(component.loadSpin).toBe(true);
		expect(component.repacketingPackets).toHaveBeenCalled();
	}));
	it('Should repacketingPackets Test If Successfull', fakeAsync(() => {
		spyOn(component['toastrService'], 'success');
		spyOn(component, 'getPacketInfo');
		spyOn(component, 'paramsObject');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of(packetListGetMockValues.repacketingPacketsResp).pipe(delay(1)),
		);
		component.repacketingPackets({ id: 10 });
		discardPeriodicTasks();
		tick(15000);
		expect(component.loadSpin).toBe(false);
		expect(component['toastrService'].success).toHaveBeenCalled();
		expect(component.getPacketInfo).toHaveBeenCalled();
		expect(component.paramsObject).toHaveBeenCalled();
	}));
	it('Should repacketingPackets Test If UnSuccessfull', fakeAsync(() => {
		spyOn(component['toastrService'], 'error');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			throwError({ error: { message: 'Error' } }),
		);
		component.repacketingPackets({ id: 10 });
		discardPeriodicTasks();
		tick(15000);
		expect(component.loadSpin).toBe(false);
		expect(component['toastrService'].error).toHaveBeenCalled();
	}));
	it('Should getPacketInfo Test If Successfull', fakeAsync(() => {
		spyOn(component, 'addUrlQueryParams');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of(packetListGetMockValues.packetInfoResp).pipe(delay(1)),
		);
		component.getPacketInfo({ offset: 0 });
		discardPeriodicTasks();
		tick(15000);
		expect(component.loadSpin).toBe(false);
		expect(component.packetLists.length).toBe(0);
		expect(component.page.totalElements).toBe(packetListGetMockValues.packetInfoResp.result.total);
		expect(component.page.totalPages).toBe(packetListGetMockValues.packetInfoResp.result.last_page);
		expect(component.page.offset).toBe(0);
	}));
	it('Should getPacketInfo Test If UnSuccessfull', fakeAsync(() => {
		spyOn(component, 'addUrlQueryParams');
		spyOn(requestMockService, 'sendRequest').and.returnValue(throwError('Error'));
		component.getPacketInfo({ offset: 0 });
		discardPeriodicTasks();
		tick(15000);
		expect(component.loadSpin).toBe(false);
	}));
	it('Should filterResponseData Test', () => {
		spyOn(component, 'getPacketInfo');
		component.filterResponseData({});
		expect(component.page.offset).toBe(0);
		expect(component.page.pageNumber).toBe(1);
		expect(component.getPacketInfo).toHaveBeenCalled();
	});
	it('Should getLinkwithAuthToken Test If Token true', () => {
		spyOn(component['storageData'], 'getToken').and.returnValue(true);
		let result = component.getLinkwithAuthToken('link');
		expect(result).toMatch('link&token=true');
	});
	it('Should getLinkwithAuthToken Test If Token false', () => {
		spyOn(component['storageData'], 'getToken').and.returnValue(false);
		let result = component.getLinkwithAuthToken('link');
		expect(result).toMatch('link');
	});
	it('Should genertePOM Test If Successfull', fakeAsync(() => {
		spyOn(window, 'open');
		spyOn(component, 'getLinkwithAuthToken');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of(packetListGetMockValues.genertePOMResp).pipe(delay(1)),
		);
		component.genertePOM({ bill_ids: [10], id: 1, facility_id: 10 });
		tick(15000);
		discardPeriodicTasks();
		expect(component.loadSpin).toBe(false);
		expect(component.getLinkwithAuthToken).toHaveBeenCalled();
		expect(window.open).toHaveBeenCalled();
	}));
	it('Should genertePOM Test If UnSuccessfull', fakeAsync(() => {
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			throwError({ error: { message: 'Error' } }),
		);
		spyOn(component['toastrService'], 'error');
		component.genertePOM({ bill_ids: [10], id: 1, facility_id: 10 });
		tick(15000);
		discardPeriodicTasks();
		expect(component.loadSpin).toBe(false);
		expect(component['toastrService'].error).toHaveBeenCalled();
	}));
	it('Should paramsObject Test', () => {
		let result = component.paramsObject();
		expect(result).toEqual({
			page: 5,
			pagination: 1,
			per_page: 20,
		});
	});
	it('Should addUrlQueryParams Test', () => {
		spyOn(component['location'], 'replaceState');
		component.addUrlQueryParams({ id: 10 });
		expect(component['location'].replaceState).toHaveBeenCalled();
	});
	it('Should getStatusPacketAction Test If packate_status Failed', () => {
		let result = component.getStatusPacketAction({ packet_status: 'Failed' });
		expect(result).toBe(true);
	});
	it('Should getStatusPacketAction Test If packate_status Other', () => {
		let result = component.getStatusPacketAction({ packet_status: 'Pass' });
		expect(result).toBe(false);
	});
	it('Should Test isPacketListAllSelected', () => {
		component.packetSelection.selected.length = 5;
		component.packetLists = [10, 20, 30, 40, 50];
		let result = component.isPacketListAllSelected();
		expect(result).toBe(true);
	});
	it('Should Test packetmasterToggle when isSelected True', () => {
		spyOn(component, 'isPacketListAllSelected').and.returnValue(of(true));
		spyOn(component.packetSelection, 'clear');
		component.packetmasterToggle();
		expect(component.isPacketListAllSelected).toHaveBeenCalled();
		expect(component.packetSelection.clear).toHaveBeenCalled();
	});
	it('Should Test masterToggle when isSelected False', () => {
		spyOn(component, 'isPacketListAllSelected').and.returnValue(false);
		component.packetTotalRows = 5;
		component.packetLists = [2];
		component.packetmasterToggle();
		expect(component.isPacketListAllSelected).toHaveBeenCalled();
	});
	it('Should packetListEvents Test', () => {
		let array: any = { id: 10 };
		component.packetSelection.selected.push(array);
		spyOn(component, 'onDeletePacket');
		component.packetListEvents('delete-packet');
		expect(component.onDeletePacket).toHaveBeenCalled();
	});

	it('Should onDeletePacket Test If Successfull', fakeAsync(() => {
		spyOn(component['packetSelection'], 'clear');
		spyOn(component, 'paramsObject');
		spyOn(component, 'getPacketInfo');
		spyOn(component['toastrService'], 'success');
		spyOn(customDialogMockService, 'confirm').and.returnValue(Promise.resolve(true));
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of(packetListGetMockValues.repacketingPacketsResp).pipe(delay(1)),
		);
		component.onDeletePacket({ ids: [1] });
		tick(15000);
		discardPeriodicTasks();
		expect(component.loadSpin).toBe(false);
		expect(component.page.offset).toBe(0);
		expect(component.page.pageNumber).toBe(1);
		expect(component['packetSelection'].clear).toHaveBeenCalled();
		expect(component.paramsObject).toHaveBeenCalled();
		expect(component.getPacketInfo).toHaveBeenCalled();
		expect(component['toastrService'].success).toHaveBeenCalled();
	}));

	it('Should onDeletePacket Test If UnSuccessfull', fakeAsync(() => {
		spyOn(component['toastrService'], 'error');
		spyOn(customDialogMockService, 'confirm').and.returnValue(Promise.resolve(true));
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			throwError({ error: { message: 'Error' } }),
		);
		component.onDeletePacket({ ids: [1] });
		tick(15000);
		discardPeriodicTasks();
		expect(component.loadSpin).toBe(false);
		expect(component['toastrService'].error).toHaveBeenCalled();
	}));
	it('Should generteEnvelope Test If Successfull', fakeAsync(() => {
		spyOn(window, 'open');
		spyOn(requestMockService, 'sendRequest').and.returnValue(of(true).pipe(delay(1)));
		component.generteEnvelope({ bill_ids: [10] });
		expect(window.open).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(component.loadSpin).toBe(false);
	}));
	it('Should generteEnvelope Test If UnSuccessfull', fakeAsync(() => {
		spyOn(window, 'open');
		spyOn(requestMockService, 'sendRequest').and.returnValue(throwError('Error'));
		component.generteEnvelope({ bill_ids: [10] });
		tick(15000);
		discardPeriodicTasks();
		expect(window.open).toHaveBeenCalled();
		expect(component.loadSpin).toBe(false);
	}));
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
