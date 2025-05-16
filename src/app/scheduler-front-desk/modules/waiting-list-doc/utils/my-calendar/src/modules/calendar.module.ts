import { NgModule, ModuleWithProviders, Provider } from '@angular/core';
import {
  CalendarCommonModule,
  CalendarModuleConfig,
  CalendarEventTitleFormatter,
  CalendarDateFormatter
} from './common/calendar-common.module';
import { CalendarDayNewModule } from './week-new/calendar-week.module';

import { CalendarUtils } from './common/calendar-utils.provider';
// import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { PopoverModule, PopoverConfig } from 'angular-bootstrap-md';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

export * from './common/calendar-common.module';
export * from './week-new/calendar-week.module';


/**
 * The main module of this library. Example usage:
 *
 * ```typescript
 * import { CalenderModule } from 'angular-calendar';
 *
 * @NgModule({
 *   imports: [
 *     CalenderModule.forRoot()
 *   ]
 * })
 * class MyModule {}
 * ```
 *
 */
@NgModule({
  imports: [
    CalendarCommonModule,
    CalendarDayNewModule,

    // MDBBootstrapModule,
    PopoverModule
  ],
  exports: [
    CalendarCommonModule,
    CalendarDayNewModule,

  ],
  providers: [PopoverConfig]
})
export class CalendarModule {
  static forRoot(
    dateAdapter: Provider,
    config: CalendarModuleConfig = {}
  ): ModuleWithProviders <CalendarModule> {
    return {
      ngModule: CalendarModule,
      providers: [
        dateAdapter,
        config.eventTitleFormatter || CalendarEventTitleFormatter,
        config.dateFormatter || CalendarDateFormatter,
        config.utils || CalendarUtils
      ]
    };
  }
}
