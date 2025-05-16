import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { HomeRoutes } from './home.routing';
import { HomeComponent } from './home.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    HomeRoutes,
    TranslateModule,SharedModule
  ],
  declarations: [HomeComponent]
})
export class HomeModule { }
