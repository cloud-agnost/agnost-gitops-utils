import axios from "axios";

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const BASE_URL = `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records`;

const endpointHandler = async (req, res) => {
	try {
		// First, find the record ID
		const { body } = req;
		const listResponse = await axios.get(
			`${BASE_URL}?type=TXT&name=acme-${body.slug}.agnost.dev&content=${body.value}`,
			{
				headers: {
					Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
					"Content-Type": "application/json",
				},
			}
		);

		const record = listResponse.data.result.find(
			(record) => record.content === body.value
		);
		if (record) {
			const deleteResponse = await axios.delete(`${BASE_URL}/${record.id}`, {
				headers: {
					Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
					"Content-Type": "application/json",
				},
			});
			console.log("TXT record deleted:", deleteResponse.data);
			res.json();
		} else {
			console.log("TXT record not found");
			res.json();
		}
	} catch (error) {
		console.error(
			"Error deleting TXT record:",
			error.response ? error.response.data : error.message
		);
		res.status(400).json();
	}
};

export default endpointHandler;
