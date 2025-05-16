import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestResultsComponent } from './test-results.component';
import {TestResultsRoutingModule} from './test-results-routing.module';
import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FormValidateCheckerGuard} from './can-deactivate/form-validate-checker.guard';
import {RouterModule} from '@angular/router';

@NgModule({
  declarations: [TestResultsComponent],
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    PerfectScrollbarModule,
    TestResultsRoutingModule,
    RouterModule
  ],
  providers: [
      FormValidateCheckerGuard
  ]
})
export class TestResultsModule { }
