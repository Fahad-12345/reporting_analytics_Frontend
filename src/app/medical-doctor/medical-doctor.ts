import { MainService } from "@appDir/shared/services/main-service";
import { ActivatedRoute, Router } from "@angular/router";
import { MDService } from "./services/md/medical-doctor.service";
import { StorageData } from "@appDir/pages/content-pages/login/user.class";
import { Subscription } from "rxjs";
import { MDParams } from "./mdparams";
import { ToastrService } from "ngx-toastr";
import { getObjectChildValue } from "@appDir/shared/utils/utils.helpers";

export class MedicalDoctor {

    public subscription: Subscription[] = [];
    public visitType;
    public session;
    public gender;
    public validRequest = false;


    public params: MDParams;


    constructor(
        public mainService: MainService,
        protected route: ActivatedRoute,
        protected MDService: MDService,
        protected storageData: StorageData,
        protected router: Router,
        protected toastrService: ToastrService) {
            

        this.mainService.setPanelData();
        this.session = this.MDService.getCurrentSession();
        this.gender = getObjectChildValue(this.session, '', ['patient', 'gender']);
        this.visitType = getObjectChildValue(this.session, '', ['patient', 'visitType']);
    }

}
