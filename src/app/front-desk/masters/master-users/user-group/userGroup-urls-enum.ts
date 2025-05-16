export enum UserGroupUrlsEnum {
	// UserGroup_list_Get = 'all_groups',
	// UserGroup_list_GET = 'groups_list',
	UserGroup_list_GET = 'groups',
	UserGroup_list_Post = 'add_group',
	UserGroup_list_DELETE = 'delete_group',
	UserGroup_list_Put = 'update_group',
	// UserGroup Search
	UserGroup_searchGroup_Post = 'search_group',
	UserGroup_searchUser_Post = 'users/search-user',
	Group_detail_Get = 'groups',

	// group related api's
	AllGroup_list_GET = 'all_groups',
	AllGroup_search_POST = 'search_group', // used for intellicence
}
