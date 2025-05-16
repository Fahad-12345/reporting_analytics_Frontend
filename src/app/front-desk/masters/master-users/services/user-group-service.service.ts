import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { GroupModel } from '../models/Group.Model';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Config } from '@appDir/config/config';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';

@Injectable({
  providedIn: 'root'
})
export class UserGroupServiceService {

  constructor(private httpService: HttpClient, private config: Config, private storageData: StorageData) { }

  lstGroups: Array<GroupModel> = []
  private readonly baseUrl = this.config.getConfig(REQUEST_SERVERS.fd_api_url)
  private readonly addGroupMemberUrl = "add_group_members";
  private readonly removeMembersAgainstGroupUrl = "removeGroupMembers";
  private readonly deleteGroupUrl = "delete_group";
  private readonly getGroupsAndMembersUrl = "get_group_members";
  private readonly updateGroupUrl = "update_group";
  private readonly addGroupUrl = "add_group";
  private readonly getAllGroupsUrl = "all_groups";
  private readonly searchUserUrl = "users/search-user"
  private readonly searchUserByIdUrl = "users/search-user?id="
  private readonly deleteMultipleGroupUrl = "delete_multiple_group";
  private readonly searchGroup = "search_group"
  private readonly groupDetail = " groups/67"
  addGroupMember(groupId: string, lstMembers: Array<string>) {
    return this.httpService.post(this.baseUrl + this.addGroupMemberUrl, { id: groupId, group_members: lstMembers }, this.getHeader())
  }

  removeMembersAgainstGroup(groupId: string, lstMembers: Array<string>) {
    return this.httpService.put(this.baseUrl + this.removeMembersAgainstGroupUrl, { id: groupId, group_members: lstMembers }, this.getHeader())
  }

  deleteGroup(groupId: Array<string>) {

    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.storageData.getToken()
      }),
      body: {
        id: groupId
      },
    };
    var params = new HttpParams()
    params.append('token', this.storageData.getToken() + "")
    return this.httpService.delete(this.baseUrl + this.deleteGroupUrl, options)

  }

  getAllGroups(pageNumber?, pageSize?) {
    var url = this.getAllGroupsUrl
    if (pageNumber && pageSize) {
      url = url + '?page=' + pageNumber + '&per_page=' + pageSize
    }
    return this.httpService.get(this.baseUrl + url, this.getHeader())
  }
  searchUserGroup(name) {
    return this.httpService.post(this.baseUrl + this.searchGroup, { name: name })
  }
  addGroup(group: GroupModel) {
    return this.httpService.post(this.baseUrl + this.addGroupUrl, group, this.getHeader())
  }

  updateGroup(group: GroupModel) {
    return this.httpService.put(this.baseUrl + this.updateGroupUrl, { id: group.id, name: group.name, group_members: group.group_members }, this.getHeader())
  }

  userSearch(name) {
    return this.httpService.post(this.baseUrl + this.searchUserUrl, { name: name }, this.getHeader())
  }

  userSearchById(id) {
    return this.httpService.get(this.baseUrl + this.searchUserByIdUrl + id, this.getHeader())
  }


  private getHeader() {
    return {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.storageData.getToken()
      })
    };
  }
  getGroupDetail(id: number) {

  }
}
