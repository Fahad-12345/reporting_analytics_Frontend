import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, ChangeDetectionStrategy } from "@angular/core";
import { LayoutService } from "../../services/layout.service";
import { SubjectService } from "../../services/subject.service";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
	selector: "app-text",
	templateUrl: "./text.component.html",
	styleUrls: ["./text.component.scss"],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextComponent implements OnInit {
	object: any = {};
	item: any = {};
	text = "text";
	subscription: any;
	editText: any = false;
	boundStatement: any = "";
	constructor(public changeDetector: ChangeDetectorRef, public layoutService: LayoutService, public sanitizer: DomSanitizer, public subject: SubjectService) {}
	public uiComponents: any = [];
	// heightStatement = 1;

	ngOnInit() {
		this.subscription = this.subject.textRefresh.subscribe((res) => {
			if (res.length != 0) {
				if(this.object.uicomponent_name==res.uicomponent_name){
					// this.object = {...res};
					this.changeDetector.markForCheck();
				}
      }
		});
		if(!this.object.instanceStatement || this.object.instanceStatement.length==0){
			this.object.instanceStatement = this.object.statement;

		}
		this.boundStatement = this.object.statement;
	}

	ngOnDestroy(){
		this.subscription.unsubscribe();
	}

}
