import { Injectable } from "@angular/core";
import { CaseTypeUrlsEnum } from "@appDir/front-desk/masters/providers/caseType/case.type.enum";
import { REQUEST_SERVERS } from "@appDir/request-servers.enum";
import { RequestService } from "@appDir/shared/services/request.service";
import { UserTemplateManagerUrlEnums } from "./user-template-manager-service-url-Enum";

@Injectable({
    providedIn: 'root'
})
export class UserTemplateManagerService{
	constructor(private requestService: RequestService)
	{

	}

	getVisitTypesBySpeciality(param:any)
	{

		return this.requestService.sendRequest(UserTemplateManagerUrlEnums.single_speciality_GET, 'get', REQUEST_SERVERS.fd_api_url, param)
	}

	AttachTemplateToUser(param:any)
	{
		return this.requestService.sendRequest(UserTemplateManagerUrlEnums.Attach_Template_To_User, 'post', REQUEST_SERVERS.fd_api_url, param)
	} 

	editTemplateToUser(param:any)
	{
		return this.requestService.sendRequest(UserTemplateManagerUrlEnums.edit_template_to_user, 'post', REQUEST_SERVERS.fd_api_url, param)
	} 

	getUserCaseTypeWithTemplate(param:any)
	{
		return this.requestService.sendRequest(UserTemplateManagerUrlEnums.user_case_type_with_template_get, 'get', REQUEST_SERVERS.fd_api_url, param)
	} 
	getUserCaseType(param:any)
	{
		return this.requestService.sendRequest( CaseTypeUrlsEnum.CaseType_list_GET,'GET', REQUEST_SERVERS.fd_api_url, param)
	}

	getTemplates(param:any)
	{
		return this.requestService.sendRequest( UserTemplateManagerUrlEnums.get_Templates,'GET', REQUEST_SERVERS.templateManagerUrl, param)
	}

	deleteUserTemplate(param:any)
	{
		return this.requestService.sendRequest( UserTemplateManagerUrlEnums.delete_user_template,'Delete', REQUEST_SERVERS.fd_api_url, param)
	}

	
}
