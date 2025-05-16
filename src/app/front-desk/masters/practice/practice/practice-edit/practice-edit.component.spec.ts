import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Config } from '@appDir/config/config';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { SharedModule } from '@appDir/shared/shared.module';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { PracticeEditComponent } from './practice-edit.component';
describe('PracticeEditComponent', () => {
	let comp: PracticeEditComponent;
	let fixture: ComponentFixture<PracticeEditComponent>;
	const fakeActivatedRoute = {
		snapshot: { data: {  } }
	  } as ActivatedRoute;
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [PracticeEditComponent],
			schemas: [NO_ERRORS_SCHEMA],
			imports:[
				HttpClientTestingModule,RouterTestingModule.withRoutes([{path: '', component: PracticeEditComponent}])
				// SharedModule,RouterTestingModule,ToastrModule.forRoot()
			],
			providers:[ 
				{
					provide: ActivatedRoute,
					useValue: {
						snapshot: {
							paramMap: {
								get(): string {
									return '123';
								},
							},
						},
					},
				},
				// Config,LocalStorage,ToastrService,ConfirmationService
			]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PracticeEditComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	  });
});
