export interface HttpCollectionSuccessResponse {
  message: string;
  status: boolean;
  result: HttpCollectionSuccessResponseResultObj;
}

export interface HttpSuccessResponse {
  message: string;
  status: boolean;
}

export interface HttpCollectionSuccessResponseResultObj {
  current_page?: number;
  data: any[];
  from?: number;
  last_page?: number;
  next_page_url?: string;
  path?: string;
  per_page?: string;
  prev_page_url?: string;
  to?: number;
  total?: number;
}
