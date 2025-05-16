import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TasksRoutingModule } from './tasks-routing.module';
import { TaskPriorityComponent } from './task-priority/task-priority.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@appDir/shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';

@NgModule({
  declarations: [
    TaskPriorityComponent],
  imports: [
    CommonModule,
    TasksRoutingModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgxDatatableModule,
    PaginationModule.forRoot(),
    MatCheckboxModule,
    GooglePlaceModule,
  ],
  entryComponents: [],
})
export class TasksModule { }
