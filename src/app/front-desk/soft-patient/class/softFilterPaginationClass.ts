export default interface ISoftFilterPagination {
	page: number;
	searchKey: string;
	lastPage: number;
	per_page: number;
}

export default class SoftFilterPaginationClass implements ISoftFilterPagination {
	page: number = 0;
	searchKey: string =  '';
	lastPage:number =  2;
	per_page: number =  10;
}
