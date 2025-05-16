import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PrescriptionsLogComponent } from './prescriptions-log/prescriptions-log.component';
import { ReportsComponent } from './reports.component';
import { ActivityLogsComponent } from './activity-logs/activity-logs.component';
import { EventLogsComponent } from './event-logs/event-logs.component';
const routes: Routes = [
  {
    path: '',
    component: ReportsComponent,
    children: [
      { 
        path: '', pathMatch: 'full',
        component: PrescriptionsLogComponent 

      },
      {
        path: 'prescriptions-log',
        component:PrescriptionsLogComponent
        
      },
      {
        path: 'activity-log',
        component:ActivityLogsComponent
        
      },
      {
        path: 'event-log',
        component:EventLogsComponent
        
      },
      
    ],
   
    
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
