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
import { ErxOverrideReasonListComponent } from './erx-override-reason-list.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe(("ErxOverrideReasonListComponent"), () => {
	let comp: ErxOverrideReasonListComponent;
	let fixture: ComponentFixture<ErxOverrideReasonListComponent>;
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ErxOverrideReasonListComponent],
			schemas: [NO_ERRORS_SCHEMA],
			imports: [RouterTestingModule, ToastrModule.forRoot(), SharedModule,HttpClientTestingModule ],
			providers: [LocalStorage, Config]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ErxOverrideReasonListComponent);
		comp = fixture.componentInstance;
	})
	it('Should Create', () => {
		expect(comp).toBeTruthy();
	});
	
});

