import { NgModule } from '@angular/core';
import { ServerModule, ServerTransferStateModule } from '@angular/platform-server';
import { ModuleMapLoaderModule } from '@nguniversal/module-map-ngfactory-loader';
import { UniversalStorage } from './shared/for-storage/server.storage';
import { AppStorage } from './shared/for-storage/universal.inject';
import { TranslatesServerModule } from './shared/translates/translates-server';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';

@NgModule({
  imports: [
    AppModule,
    ServerTransferStateModule,
    ServerModule,
    ModuleMapLoaderModule,
    TranslatesServerModule
  ],
  bootstrap: [AppComponent],
  providers: [
    { provide: AppStorage, useClass: UniversalStorage }
  ],
})
export class AppServerModule {
}
