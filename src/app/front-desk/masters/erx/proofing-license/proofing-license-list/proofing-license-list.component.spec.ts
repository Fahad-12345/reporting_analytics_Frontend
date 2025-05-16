import { of } from 'rxjs';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { Config } from '@appDir/config/config';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { ReasonCodeService } from '@appDir/front-desk/masters/reason-code/reason-code.service';
import { SharedModule } from '@appDir/shared/shared.module';
import { TestBed, async, ComponentFixture, inject, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { ProofingLicenseListComponent } from './proofing-license-list.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe(("ProofingLicenseListComponent"), () => {
	let comp: ProofingLicenseListComponent;
	let fixture: ComponentFixture<ProofingLicenseListComponent>;
	let proofingLiscenseList_Mock = [
		{
			"id": 1,
			"order_id": 987102,
			"order_name": "987102",
			"product": "motp",
			"license_key": "ESW-E9A0542CA043E7A7A7BD",
			"expiry_date": "2023-03-04 08:00:00",
			"user_id": 28,
			"account_id": 64660095,
			"license_status": 0,
			"user_status_id": 1,
			"user_license_status": {
				"id": 1,
				"name": "No Proofing",
				"slug": "no_proofing"
			},
			"user": {
				"id": 28,
				"created_by_name": "",
				"basic_info": {
					"user_id": 28,
					"first_name": "test",
					"middle_name": "user",
					"last_name": "scheduler"
				}
			}
		},
		{
			"id": 2,
			"order_id": 987100,
			"order_name": "987100",
			"product": "motp",
			"license_key": "ESW-C1F24AF4C109EE55657D",
			"expiry_date": "2023-03-04 08:00:00",
			"user_id": 29,
			"account_id": 64660096,
			"license_status": 0,
			"user_status_id": 1,
			"user_license_status": {
				"id": 1,
				"name": "No Proofing",
				"slug": "no_proofing"
			},
			"user": {
				"id": 29,
				"created_by_name": "",
				"basic_info": {
					"user_id": 29,
					"first_name": "Mr",
					"middle_name": "Test",
					"last_name": "Provider"
				}
			}
		},
		{
			"id": 3,
			"order_id": 981016,
			"order_name": "981016",
			"product": "motp",
			"license_key": "ESW-AB1DEC7ED475A2081C6A",
			"expiry_date": "2022-03-04 08:00:00",
			"user_id": 57,
			"account_id": 64660098,
			"license_status": 1,
			"user_status_id": 1,
			"user_license_status": {
				"id": 1,
				"name": "No Proofing",
				"slug": "no_proofing"
			},
			"user": {
				"id": 57,
				"created_by_name": "",
				"basic_info": {
					"user_id": 57,
					"first_name": "Akhter",
					"middle_name": "MD",
					"last_name": "Testing"
				}
			}
		},
		{
			"id": 4,
			"order_id": 981018,
			"order_name": "981018",
			"product": "motp",
			"license_key": "ESW-5B3C4D9FA96534195F22",
			"expiry_date": "2022-03-04 08:00:00",
			"user_id": 1,
			"account_id": 64660153,
			"license_status": 0,
			"user_status_id": 1,
			"user_license_status": {
				"id": 1,
				"name": "No Proofing",
				"slug": "no_proofing"
			},
			"user": {
				"id": 1,
				"created_by_name": "",
				"basic_info": {
					"user_id": 1,
					"first_name": "Super",
					"middle_name": "demo",
					"last_name": "Admin"
				}
			}
		},
		{
			"id": 5,
			"order_id": 981020,
			"order_name": "981020",
			"product": "motp",
			"license_key": "ESW-66A941C7F429E65F1FBE",
			"expiry_date": "2022-03-04 08:00:00",
			"user_id": 3,
			"account_id": 64660154,
			"license_status": 0,
			"user_status_id": 1,
			"user_license_status": {
				"id": 1,
				"name": "No Proofing",
				"slug": "no_proofing"
			},
			"user": {
				"id": 3,
				"created_by_name": "",
				"basic_info": {
					"user_id": 3,
					"first_name": "Mr",
					"middle_name": "Acu",
					"last_name": "Provider"
				}
			}
		},
		{
			"id": 6,
			"order_id": 981110,
			"order_name": "981110",
			"product": "motp",
			"license_key": "ESW-2B6617F1AB6974B65A85",
			"expiry_date": "2022-03-04 08:00:00",
			"user_id": 5,
			"account_id": 64660209,
			"license_status": 0,
			"user_status_id": 1,
			"user_license_status": {
				"id": 1,
				"name": "No Proofing",
				"slug": "no_proofing"
			},
			"user": {
				"id": 5,
				"created_by_name": "",
				"basic_info": {
					"user_id": 5,
					"first_name": "Mr",
					"middle_name": "Chiro",
					"last_name": "Provider"
				}
			}
		},
		{
			"id": 7,
			"order_id": 981210,
			"order_name": "981210",
			"product": "motp",
			"license_key": "ESW-CB781AA11EB387B2574C",
			"expiry_date": "2022-03-03 08:00:00",
			"user_id": 3,
			"account_id": 64660318,
			"license_status": 0,
			"user_status_id": 1,
			"user_license_status": {
				"id": 1,
				"name": "No Proofing",
				"slug": "no_proofing"
			},
			"user": {
				"id": 3,
				"created_by_name": "",
				"basic_info": {
					"user_id": 3,
					"first_name": "Mr",
					"middle_name": "Acu",
					"last_name": "Provider"
				}
			}
		},
		{
			"id": 8,
			"order_id": 981214,
			"order_name": "981214",
			"product": "motp",
			"license_key": "ESW-DBBD07E217CE76E8D8AC",
			"expiry_date": "2022-03-04 08:00:00",
			"user_id": 22,
			"account_id": 64660374,
			"license_status": 0,
			"user_status_id": 1,
			"user_license_status": {
				"id": 1,
				"name": "No Proofing",
				"slug": "no_proofing"
			},
			"user": {
				"id": 22,
				"created_by_name": "",
				"basic_info": {
					"user_id": 22,
					"first_name": "chiro",
					"middle_name": "user",
					"last_name": "1"
				}
			}
		},
		{
			"id": 9,
			"order_id": 981410,
			"order_name": "981410",
			"product": "motp",
			"license_key": "ESW-9A9E1046724F216F4EA3",
			"expiry_date": "2022-03-03 08:00:00",
			"user_id": 49,
			"account_id": 64660456,
			"license_status": 0,
			"user_status_id": 1,
			"user_license_status": {
				"id": 1,
				"name": "No Proofing",
				"slug": "no_proofing"
			},
			"user": {
				"id": 49,
				"created_by_name": "",
				"basic_info": {
					"user_id": 49,
					"first_name": "test",
					"middle_name": "user",
					"last_name": "permissions"
				}
			}
		},
		{
			"id": 10,
			"order_id": 982644,
			"order_name": "982644",
			"product": "motp",
			"license_key": "ESW-73B4922210C03538B447",
			"expiry_date": "2022-03-07 08:00:00",
			"user_id": 4,
			"account_id": 64669376,
			"license_status": 0,
			"user_status_id": 1,
			"user_license_status": {
				"id": 1,
				"name": "No Proofing",
				"slug": "no_proofing"
			},
			"user": {
				"id": 4,
				"created_by_name": "",
				"basic_info": {
					"user_id": 4,
					"first_name": "Mr",
					"middle_name": "PT",
					"last_name": "Provider"
				}
			}
		}
	]
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ProofingLicenseListComponent],
			schemas: [NO_ERRORS_SCHEMA],
			imports: [RouterTestingModule, ToastrModule.forRoot(), SharedModule,HttpClientTestingModule],
			providers: [LocalStorage, Config]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ProofingLicenseListComponent);
		comp = fixture.componentInstance;
	})
	it('Should Create', () => {
		expect(comp).toBeTruthy();
	});
	it('Check getQueryParams is called from ngOnInit', () => {
		const spy_getQueryParams = spyOn(comp, 'getQueryParams');
		comp.ngOnInit();
		expect(spy_getQueryParams).toHaveBeenCalled();
	});
	it('Should getProofingLicenseData function call and get proofing license list', fakeAsync(() => {
		const spy_getQueryParams = spyOn(comp, 'getProofingLicenseData').and.returnValue(of(proofingLiscenseList_Mock));
		const queryParams = {
			page: 1,
			per_page: 10,
			order: OrderEnum.DEC,
			pagination: true
		}
		comp.proofingLicenseList = proofingLiscenseList_Mock;
		comp.getProofingLicenseData(queryParams);
		tick();
		expect(comp.proofingLicenseList.length).toEqual(proofingLiscenseList_Mock.length);
		expect(spy_getQueryParams).toHaveBeenCalledWith(queryParams);
		expect(comp.proofingLicenseList).toEqual(proofingLiscenseList_Mock);

	}));
	it('should call assignUserProofingLicenseByID fun on Aissign', () => {
		spyOn(comp, 'setProofingLicenseDetail');
		comp.assignUserProofingLicenseByID(proofingLiscenseList_Mock[0], 'proofingLicenseModal');
		expect(comp.setProofingLicenseDetail).toHaveBeenCalledWith('proofingLicenseModal');
	});
	it('Should call Get new License button', () => {
		spyOn(comp, 'getLicense');
		comp.getLicense();
		expect(comp.getLicense).toHaveBeenCalled();
	});
});

