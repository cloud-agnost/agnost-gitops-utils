import axios from "axios";

const endpointHandler = async (req, res) => {
	const { accessToken } = req.body;
	const { providerType } = req.params;

	if (providerType == "github") {
		if (accessToken) {
			const revokeUrl = `https://api.github.com/applications/${process.env.GITHUB_CLIENT_ID}/token`;
			const credentials = Buffer.from(
				`${process.env.GITHUB_CLIENT_ID}:${process.env.GITHUB_CLIENT_SECRET}`
			).toString("base64"); // Encode Client ID and Secret

			try {
				await axios.delete(revokeUrl, {
					headers: {
						Authorization: `Basic ${credentials}`,
						Accept: "application/vnd.github.v3+json",
					},
					data: { access_token: accessToken },
				});
				console.log(`Successfully revoked github access_token`);
			} catch (error) {
				console.error("Failed to revoke token:", error);
			}
		}
	} else if (providerType == "gitlab") {
		try {
			await axios.post("https://gitlab.com/oauth/revoke", null, {
				params: {
					client_id: process.env.GITLAB_CLIENT_ID,
					client_secret: process.env.GITLAB_CLIENT_SECRET,
					token: accessToken,
				},
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					//Authorization: `Bearer ${accessToken}`, // Use the access token to authorize the revocation request
				},
			});
			console.log(`Successfully revoked gitlab access_token`);
		} catch (error) {
			console.error(
				`Error revoking access_token:`,
				error.response ? error.response.data : error.message
			);
		}
	} else if (providerType == "bitbucket") {
		// Access token revoke has not been implemented by bitbucket yet
		return res.json();
	}

	res.json();
};

export default endpointHandler;
