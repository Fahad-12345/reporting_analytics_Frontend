import {HostListener} from '@angular/core';

import { Component } from '@angular/core';

@Component({
  template: ''
})
export abstract class ComponentFormValidateChecker {

    abstract canDeactivate(): boolean;


    @HostListener('window:beforeunload', ['$event'])
    unloadNotification($event: any) {
        if (!this.canDeactivate()) {
            $event.returnValue = true;
        }
    }
}
