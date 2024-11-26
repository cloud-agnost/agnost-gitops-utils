import axios from "axios";

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const BASE_URL = `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records`;

const endpointHandler = async (req, res) => {
	try {
		const { body } = req;
		// Check to see if there is already a record
		const listResponse = await axios.get(
			`${BASE_URL}?type=TXT&name=acme-${body.slug}.agnost.dev&content="${body.value}"`,
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
		// Record exits, do nothing return success
		if (record) return res.json();

		const response = await axios.post(
			BASE_URL,
			{
				type: "TXT",
				name: `acme-${body.slug}.agnost.dev`,
				content: body.value,
				ttl: 120, // Time to live, in seconds
			},
			{
				headers: {
					Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
					"Content-Type": "application/json",
				},
			}
		);
		console.log("TXT record added:", response.data);
		res.json();
	} catch (error) {
		console.error(
			"Error adding TXT record:",
			error.response ? error.response.data : error.message
		);
		res.status(400).json();
	}
};

export default endpointHandler;
