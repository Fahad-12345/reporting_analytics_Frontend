import { Injectable, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FDServices } from '../../services/fd-services.service';
import { Logger } from '@nsalaun/ng-logger';
import { Observable } from 'rxjs';
import { BodyParts } from 'app/front-desk/models/BodyParts';

@Injectable({
  providedIn: 'root'
})
export class BodypartsFormService {

  @Input() bodyParts: BodyParts[] = [];
  @Input() caseId: number;
  @Output() getCase = new EventEmitter();

  constructor(private fd_services: FDServices, private logger: Logger) { }

  set(bodyparts: any) {
    if (bodyparts) {
      this.bodyParts = bodyparts
    }
  }


  getBodyParts() {

    this.fd_services.getBodyParts({all_body_parts:true}).subscribe(res => {
      if (res.statusCode == 200) {
        res.data.forEach(bodypart => {
          this.fd_services.getSensations(bodypart.id).subscribe(sensations => {
            let bodypartData = {
              name: bodypart.name,
              id: bodypart.id,
              selected: false,
              sensations: sensations.data
            }
            this.bodyParts.push(bodypartData);
            // this.bodyPartsService.bodyParts.push(bodypartData);
            this.logger.log(this.bodyParts);
          })
        });
      }
    })
  }
}
