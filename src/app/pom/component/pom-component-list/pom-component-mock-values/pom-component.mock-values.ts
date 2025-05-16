export class PomSplitListMockValues {
	pomListingResponce = {
		status: 200,
		result: {
			data: [],
			total: 20,
			page: 1,
		},
	};
	addMediaResp = {
		body:{},
		status:true,
		message:'Message'
	}
	addMediaRespWithStatusFalse = {
		body:{},
		status:false,
		message:'Message'
	}
}
