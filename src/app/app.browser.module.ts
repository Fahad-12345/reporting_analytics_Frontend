import { NgModule } from '@angular/core';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { CookieStorage } from './shared/for-storage/browser.storage';
import { AppStorage } from './shared/for-storage/universal.inject';
import { TranslatesBrowserModule } from './shared/translates/translates-browser';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';
export function getRequest(): any {
  return { headers: { cookie: document.cookie } };
}

@NgModule({
  bootstrap: [AppComponent],
  imports: [
    BrowserTransferStateModule,
    AppModule,
    TranslatesBrowserModule,
    // ServiceWorkerModule.register('/ngsw-worker.js', { enabled: false })
  ],
  providers: [
    // {
    //   provide: REQUEST, useFactory: (getRequest)
    // },
    { provide: AppStorage, useClass: CookieStorage },
    { provide: 'ORIGIN_URL', useValue: location.origin }
  ]
})
export class AppBrowserModule {
}
