import { CommonModule } from '@angular/common';
import {
	HTTP_INTERCEPTORS,
	HttpClient,
	HttpClientModule,
} from '@angular/common/http';
import {
	APP_INITIALIZER,
	NgModule,
} from '@angular/core';
import {
	FormsModule,
	ReactiveFormsModule,
} from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CookieService } from 'ngx-cookie-service';
import { NgProgressModule } from 'ngx-progressbar';
  import { ToastrModule } from 'ngx-toastr';
  
import {
	JwtModule,
	JwtModuleOptions,
} from '@auth0/angular-jwt';
// import {
// 	MetaLoader,
// 	MetaModule,
// 	MetaStaticLoader,
// 	PageTitlePositioning,
// } from '@ngx-meta/core';
import {
	TranslateLoader,
	TranslateModule,
	TranslateService,
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {
	Level,
	NgLoggerModule,
} from '@nsalaun/ng-logger';


import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { ContentLayoutComponent } from '@shared/layouts/content/content-layout.component';
import { WrapperComponent } from '@shared/layouts/wrapper/wrapper.component';
 import { MainService } from '@shared/services/main-service';
 import { AppRoutes } from './app.routing';
 import { Config } from './config/config';
import { FDServices } from './front-desk/fd_shared/services/fd-services.service';
import {
	RouterLoaderServiceService,
} from './medical-doctor/services/router-loader-service.service';
import {
	ForgotPasswordComponent,
} from './pages/content-pages/forgot-password/forgot-password.component';
import { LoginPageComponent } from './pages/content-pages/login/login-page.component';
import { AuthGuard } from './shared/auth/auth-guard.service';
import { AuthService } from './shared/auth/auth.service';
import { BusyLoaderModule } from './shared/busy-loader/busy-loader.module';
import { httpInterceptorProviders } from './shared/interceptors';
import { ErrorInterceptor } from './shared/interceptors/http.interceptor';
import { LocalStorage } from './shared/libs/localstorage';
 import { TranslatesService } from './shared/translates';
  import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { MainHeaderComponent } from './shared/layouts/main-header/main-header.component';
import { NavbarComponent } from './shared/layouts/navbar/navbar.component';
import { TimeZoneModalComponent } from './shared/layouts/main-header/time-zone-modal/time-zone-modal.component';
import { NgSelectModule } from '@ng-select/ng-select';
 import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from './shared/shared.module';
import { LoaderInterceptor } from './shared/interceptors/loader.interceptor';
import { BillFileUploadComponent } from './pages/content-pages/bill-file-upload/bill-file-upload.component';



 const config: SocketIoConfig = { url:environment['socketUrl'], options: {} };
export function initLanguage(translateService: TranslatesService): Function {
	return (): Promise<any> => translateService.initLanguage();
}
export function gettoken(): string {
	return '';
}

const jwtConf: JwtModuleOptions = {
	config: {
		tokenGetter: gettoken,
    skipWhenExpired: true,
    // whitelistedDomains: environment['whitelistedDomains'],
	},
};

export function createTranslateLoader(http: HttpClient) {
	let time = new Date().getTime();
	return new TranslateHttpLoader(http, './assets/i18n/', '.json?v=' + time);
}

// export function metaFactory(): MetaLoader {
// 	return new MetaStaticLoader({
// 		pageTitlePositioning: PageTitlePositioning.PrependPageTitle,
// 		pageTitleSeparator: ' - ',
// 		applicationName: 'Tour of (lazy/busy) heroes',
// 		defaults: {
// 			title: 'Mighty mighty mouse',
// 			description: 'Mighty Mouse is an animated superhero mouse character',
// 			'og:image': 'https://upload.wikimedia.org/wikipedia/commons/f/f8/superraton.jpg',
// 			'og:type': 'website',
// 			'og:locale': 'en_US',
// 			'og:locale:alternate': 'en_US,nl_NL,tr_TR',
// 		},
// 	});
// }
@NgModule({
	imports: [
		BrowserModule.withServerTransition({ appId: 'my-app' }),
		CommonModule,
		ReactiveFormsModule,
		FormsModule,
		HttpClientModule,
		SharedModule,
		NgProgressModule,
		 AppRoutes,
		BrowserAnimationsModule,
		 BusyLoaderModule,
		NgLoggerModule.forRoot(Level.LOG),
		// MetaModule.forRoot({
		// 	provide: MetaLoader,
		// 	useFactory: metaFactory,
		// 	deps: [TranslateService],
		// }),
		 JwtModule.forRoot(jwtConf),
		 ToastrModule.forRoot({
			positionClass: 'toast-top-center',
		 }),
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: createTranslateLoader,
				deps: [HttpClient],
			},
		}),
		// JasperoConfirmationsModule.forRoot(),
		   NgSelectModule,
		   NgbModalModule,
	    SocketIoModule.forRoot(config)
	],
	declarations: [
		AppComponent,
		WrapperComponent,
		ContentLayoutComponent,
		MainHeaderComponent,
		NavbarComponent,
		LoginPageComponent,
		BillFileUploadComponent,
		ForgotPasswordComponent,
		TimeZoneModalComponent
	],
	providers: [
		Config,
		 CookieService,
		httpInterceptorProviders,
		{ provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
		{ provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
		AuthGuard,
		AuthService,
		LocalStorage,
		FDServices,
		MainService,
		RouterLoaderServiceService,
		 {
		 	provide: APP_INITIALIZER,
		 	useFactory: initLanguage,
			multi: true,
			deps: [TranslatesService],
		 },
	],
	bootstrap: [AppComponent],
	exports: [],
	entryComponents:[
    // TimeZoneModalComponent
  ]
})
export class AppModule {}
