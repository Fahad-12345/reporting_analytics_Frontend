import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatInputModule } from "@angular/material/input";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { SharedModule } from "@appDir/shared/shared.module";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";

import { GlobalFiltersComponent } from "./global-filters/global-filters.component";
import { SummeryStatsComponent } from "./summery-stats/summery-stats.component";
import { TruncatePipe } from "./pipes/truncate.pipe";
import { DynamicTableComponent } from './dynamic-table/dynamic-table.component';
import { KeysPipe } from "./pipes/keys.pipe";
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { DashboardSwitchComponent } from './dashboard-switch/dashboard-switch/dashboard-switch.component';

@NgModule({
    declarations: [
      GlobalFiltersComponent,
      SummeryStatsComponent,
      TruncatePipe,
      DynamicTableComponent,
      KeysPipe,
      DashboardSwitchComponent
    ],
    imports: [
      CommonModule,
      FormsModule,
      SharedModule,
      MatNativeDateModule,
      MatDatepickerModule,
      MatInputModule,
      MatProgressBarModule,
      NgxDatatableModule,
      NgbTooltipModule
      
    ],
    exports:[GlobalFiltersComponent,DashboardSwitchComponent,SummeryStatsComponent,TruncatePipe,DynamicTableComponent,KeysPipe]
  })
  export class AnalyticsSharedModule { }