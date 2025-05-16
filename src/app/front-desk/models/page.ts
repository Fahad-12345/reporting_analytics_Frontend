/**
 * An object used to get page information from the server
 */
export class Page {
    //The number of elements in the page
    size: number = 0;
    //The total number of elements
    totalElements: number = 0;
    //The total number of pages
    totalPages: number = 0;
    //The current page number
    pageNumber: number = 0;
    // Existing page size
    // existingPageSize:number = 0;
    offset?: number = 0;

    public column?: string;
    // sorting order
    public order?: string;
	public maxPaginationContentSize? : number = 10;





}
