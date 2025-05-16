import { PomComponent } from './component/pom-component/pom-component';
import { PomSplitListComponent } from './component/pom-component-list/pom-component-list';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: PomComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'pom-list' },
    //   {
    //     path: 'hbot-notes',
    //     component: HbotNotesComponent
    //   },
      {
        path: 'pom-list',
        component: PomSplitListComponent

      },
	  {
        path: 'case-list',
        component: PomSplitListComponent

      }
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PomRoutingModule { }
