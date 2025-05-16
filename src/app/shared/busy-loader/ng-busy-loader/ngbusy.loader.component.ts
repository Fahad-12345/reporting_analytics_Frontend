import { Component, OnInit, ViewChild, ElementRef, NgZone, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";

import { Logger } from '@nsalaun/ng-logger';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NgProgress, NgProgressRef } from 'ngx-progressbar';


@Component({
    selector: 'busy-loader',
    templateUrl: './ngbusy.loader.component.html',
    styleUrls: ['./ngbusy.loader.component.scss']
})
export class NgLoaderBusyComponent implements OnInit {


    // @Input() loaderSpin: boolean = false;
    @Input() loaderSpin;
	@Input()loaderSpinnerProgressOnly :boolean  = false;
    progressRef: NgProgressRef;

    constructor(
        public ngProgress: NgProgress) {
    }

    ngOnChanges() {
        (this.loaderSpin && this.progressRef ) ? 
        this.progressRef.start() :
        this.progressRef? 
        this.progressRef.complete():null;
		(this.loaderSpinnerProgressOnly && this.progressRef) ? this.progressRef.start() : 
        (this.progressRef)?
        this.progressRef.complete():null;

    }

    ngOnInit() {
        this.progressRef = this.ngProgress.ref('material');

    }
}
