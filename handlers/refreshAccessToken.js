import axios from "axios";
import qs from "qs";

const endpointHandler = async (req, res) => {
	const { providerType } = req.params;
	const { refreshToken } = req.body;

	if (providerType === "gitlab") {
		try {
			const tokenUrl = "https://gitlab.com/oauth/token";
			const data = {
				client_id: process.env.GITLAB_CLIENT_ID,
				client_secret: process.env.GITLAB_CLIENT_SECRET,
				refresh_token: refreshToken,
				grant_type: "refresh_token",
				redirect_uri: process.env.GITLAB_CALLBACK_URL,
			};

			const response = await axios.post(tokenUrl, data, {
				headers: {
					Accept: "application/json",
				},
			});

			res.json({
				accessToken: response.data.access_token,
				refreshToken: response.data.refresh_token,
				expiresAt: response.data.created_at + response.data.expires_in,
			});
		} catch (error) {
			console.log(error.response);
			return res
				.status(400)
				.json(
					createErrorMessage(
						"client_error",
						"refreshAccessTokenError",
						`Cannot refresh the access token. ${JSON.stringify(
							error.response?.data
						)}`
					)
				);
		}
	} else if (providerType === "bitbucket") {
		try {
			const tokenUrl = "https://bitbucket.org/site/oauth2/access_token";
			const headers = {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization:
					"Basic " +
					Buffer.from(
						process.env.BITBUCKET_CLIENT_ID +
							":" +
							process.env.BITBUCKET_CLIENT_SECRET
					).toString("base64"),
			};

			const data = qs.stringify({
				grant_type: "refresh_token",
				refresh_token: refreshToken,
			});

			const response = await axios.post(tokenUrl, data, {
				headers: headers,
			});

			res.json({
				accessToken: response.data.access_token,
				refreshToken: response.data.refresh_token,
				expiresAt: Math.floor(Date.now() / 1000) + response.data.expires_in,
			});
		} catch (error) {
			return res
				.status(400)
				.json(
					createErrorMessage(
						"client_error",
						"refreshAccessTokenError",
						`Cannot refresh the access token. ${JSON.stringify(
							error.response?.data
						)}`
					)
				);
		}
	} else {
		return res
			.status(400)
			.json(
				createErrorMessage(
					"client_error",
					"unsupportedOAuthProvider",
					`The specified OAuth provider (${req.params.providerType}) is not supported for refreshing access tokens.`
				)
			);
	}
};

/**
 * Create an error message object
 * @param  {string} origin Either client or server error
 * @param  {string} code The specific error code
 * @param  {string} message The descriptive error text
 * @param  {Object} details Additional message details
 */
function createErrorMessage(origin, code, message, details) {
	return {
		errors: [{ origin, code, message, details }],
	};
}

export default endpointHandler;
