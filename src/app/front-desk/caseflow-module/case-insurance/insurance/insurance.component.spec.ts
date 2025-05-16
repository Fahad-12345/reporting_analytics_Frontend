import { Logger, LOGGER_LEVEL, NgLoggerModule } from '@nsalaun/ng-logger';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { Config } from '@appDir/config/config';
import { SharedModule } from '@appDir/shared/shared.module';
import { TestBed, async, ComponentFixture, inject, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';
import { InsuranceComponent } from './insurance.component';
import { ToastrModule } from 'ngx-toastr';
import { MainService } from '@appDir/shared/services/main-service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe(("InsuranceComponent"), () => {
	let comp: InsuranceComponent;
	let fixture: ComponentFixture<InsuranceComponent>;
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [InsuranceComponent],
			imports: [ToastrModule.forRoot(), SharedModule, RouterTestingModule, DynamicFormModule,HttpClientTestingModule],
			providers: [LocalStorage, Config,MainService, Logger],
			schemas: [NO_ERRORS_SCHEMA],
			// providers: [Config, LocalStorage, ReasonCodeService, FormBuilder]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(InsuranceComponent);
		comp = fixture.componentInstance;
	})
	it('Should Create', () => {
		expect(comp).toBeTruthy();
	});

});

