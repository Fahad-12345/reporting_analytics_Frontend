/**
 * An object used to get page information from the server
 */
export class Page {
    // The number of elements in the page
    public size: number = 10;
    // The total number of elements
    public totalElements: number = 0;
    // The total number of pages
    public totalPages: number = 0;
    // The current page number
    public pageNumber: number = 0;
    // The colum name
    public column?: string;
    // The offSet number
    public offset?: number = 0;
    // sorting order
    public order?: string;

}
