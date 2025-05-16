import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { Component, OnInit } from '@angular/core';
import { MainService } from '@shared/services/main-service';
import { FRONT_DESK_LINKS } from '../models/leftPanel/leftPanel';
import { ToastrService } from 'ngx-toastr';
import { FDServices } from '../fd_shared/services/fd-services.service';
import { LocalStorage } from '@shared/libs/localstorage';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Logger } from '@nsalaun/ng-logger';

@Component({
	selector: 'app-accident',
	templateUrl: './accident.component.html',
})
export class AccidentComponent implements OnInit {

	public title: string
	public caseData: any;
	public caseId: number;
	public accident: any = {}
	public accidentReports: any = {}
	public vehicleInfos: any[] = []
	public patientSituationsVehicles: any = {}
	public reasonForApplication: string;

  constructor(private mainService: MainService, private toastrService: ToastrService, private fd_services: FDServices, private localStorage: LocalStorage, private titleService: Title, private route: ActivatedRoute, private logger: Logger,public datePipeService:DatePipeFormatService) {
      this.caseId = +this.localStorage.get('caseId')
      this.fd_services.currentCase.subscribe(c => this.caseData = c)
   }

	ngOnInit() {
		this.mainService.setLeftPanel(FRONT_DESK_LINKS)
		this.titleService.setTitle(this.route.snapshot.data['title'])
		this.title = this.route.snapshot.data['title']

		if (this.fd_services.isEmpty(this.caseData)) {
			this.getCase()
		} else {
			this.assignValues()
		}
	}

	getCase() {
		this.fd_services.getCaseDetail(this.caseId).subscribe(res => {
			// this.logger.log('case', res);
			if (res.statusCode == 200) {
				this.fd_services.setCase(res.data.case)
				this.caseData = res.data.case
				this.assignValues()
			}
		}, err => {
			this.toastrService.error(err.message, 'Error')
		})
	}

	assignValues() {

		if (this.caseData.accident != null) {
			this.accident = this.caseData.accident
			this.vehicleInfos = this.caseData.accident.vehicleInfos
			this.accidentReports = this.caseData.accident.accidentReports
			this.patientSituationsVehicles = this.caseData.accident.patientSituationsVehicles
			this.reasonForApplication = this.caseData.accident.reasonForApplication
		}

	}

}
