import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VisitReportDetailComponent } from './components/visit-report-detail/visit-report-detail.component';
import { VisitSummeryReportComponent } from './components/visit-report-summery/visit-report-summery.component';
import { VisitReportComponent } from './components/visit-report/visit-report.component';

const routes: Routes = [
  {
       path:'',
       component: VisitReportComponent,
       children:[
        {
          path:'',
         
          pathMatch:'full',
          redirectTo:'visit-detail',
        },

        {
          path: 'visit-summery',
          component:VisitSummeryReportComponent,
          data: {
            title: 'Visit Summery Report',
            // permission: USERPERMISSIONS.reports_menu_nf2
            }
        },
        {
          path: 'visit-detail',
          component:VisitReportDetailComponent,
          data: {
            title: 'Visit Detail Report',
            // permission: USERPERMISSIONS.reports_menu_nf2
            }
        },
       ]
  },

  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VisitReportRoutingModule { }
