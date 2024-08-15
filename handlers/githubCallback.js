import axios from "axios";

const endpointHandler = async (req, res) => {
	const { error, error_description, state, code } = req.query;
	if (error) {
		return processRedirect(req, res, state, {
			action: "oauth-authorize",
			status: 401,
			code: error,
			error:
				error_description ??
				"User cannot be authenticated through GitHub OAuth flow.",
		});
	} else {
		const accessToken = await getAccessToken(code);
		if (accessToken) {
			return processRedirect(req, res, req.query.state, {
				access_token: accessToken,
				action: "oauth-authorize",
				status: 200,
			});
		} else {
			return processRedirect(req, res, state, {
				action: "oauth-authorize",
				status: 401,
				code: "accessTokenFailure",
				error: "Failed to retrieve GitHub access token.",
			});
		}
	}
};

/**
 * Performs the redirect
 */
export function processRedirect(req, res, redirectURL, queryParams) {
	const finalURL = buildURL(res, redirectURL, queryParams);
	return res.redirect(finalURL.href);
}

function buildURL(res, url, queryParams) {
	try {
		const primaryURL = new URL(decodeURIComponent(url));
		for (const key in queryParams) {
			let value = queryParams[key];
			primaryURL.searchParams.append(key, value);
		}

		return primaryURL;
	} catch (error) {
		res.status(403).json({
			errors: [
				{
					origin: "clientError",
					code: "invalidRedirectURL",
					message: `Cannot create URL from the redirect link ${url}. ${error.message}`,
				},
			],
		});
		return null;
	}
}

async function getAccessToken(code) {
	const tokenUrl = "https://github.com/login/oauth/access_token";
	const data = {
		client_id: process.env.GITHUB_CLIENT_ID,
		client_secret: process.env.GITHUB_CLIENT_SECRET,
		code: code,
		redirect_uri: process.env.GITHUB_CALLBACK_URL,
	};

	try {
		const response = await axios.post(tokenUrl, data, {
			headers: {
				Accept: "application/json",
			},
		});

		console.log("Access token response:", response.data);

		return response.data.access_token; // The response.data will contain the access_token
	} catch (error) {
		console.error("Failed to retrieve access token:", error);
		return null;
	}
}

export default endpointHandler;
