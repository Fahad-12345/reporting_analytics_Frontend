import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedFirmsLocationComponent } from '../shared-firms-location.component';
import { SharedModule } from '@appDir/shared/shared.module';

@NgModule({
  declarations: [SharedFirmsLocationComponent],
  imports: [
	CommonModule,
	SharedModule
  ],exports:[
	SharedFirmsLocationComponent
  ]
})
export class SharedFirmLocationModuleModule { }
