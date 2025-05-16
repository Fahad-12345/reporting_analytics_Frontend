import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgLoaderBusyComponent } from './ng-busy-loader/ngbusy.loader.component';
import { NgProgressModule } from 'ngx-progressbar';

@NgModule({
  declarations: [NgLoaderBusyComponent],
  imports: [
    CommonModule,
    NgProgressModule,
  ],
  exports: [
    NgLoaderBusyComponent
  ]
})
export class BusyLoaderModule { }
