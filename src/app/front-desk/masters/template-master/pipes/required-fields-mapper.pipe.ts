import { Pipe, PipeTransform } from '@angular/core';
import { RequestService } from '@appDir/shared/services/request.service';
import { TemplateMasterUrlEnum } from '../template-master-url.enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';

@Pipe({
  name: 'requiredFieldsMapper'
})
export class RequiredFieldsMapperPipe implements PipeTransform {

  lstRequiredFields: any[] = []
  constructor(private requestService: RequestService) {
    this.requestService.sendRequest(TemplateMasterUrlEnum.getRequiredFieldsList, 'get', REQUEST_SERVERS.fd_api_url).subscribe(data => {
      this.lstRequiredFields = data['result'].data
    })
  }
  transform(id: any, args?: any): any {
    let field = this.lstRequiredFields.find(field => field.id == id);
    return field ? field.title : ''
  }

}
