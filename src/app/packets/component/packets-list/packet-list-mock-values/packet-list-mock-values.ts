export class PacketListMockValues {
	billingPacketData = {
		status: true,
		result: {
			data: [],
		},
	};
	downloadPacketResp = {
		status: true,
		result: {
			data: {
				url: 'dummy_url',
			},
		},
	};
	downloadPacketRespIfUrlNotExists = {
		status: false,
		result: {},
	};
	repacketingPacketsResp = {
		status: true,
		message: 'Some Message Here',
	};
	packetInfoResp = {
		status: true,
		result: {
			total: 20,
			last_page: 2,
			data: [],
		},
	};
	genertePOMResp = {
		result: {
			data: {
				pom_media: { link: 'dummy_link' },
			},
		},
	};
}
