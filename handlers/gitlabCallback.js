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
				"User cannot be authenticated through GitLab OAuth flow.",
		});
	} else {
		const { accessToken, refreshToken, expiresAt } = await getTokens(code);
		if (accessToken) {
			return processRedirect(req, res, req.query.state, {
				access_token: accessToken,
				refresh_token: refreshToken,
				expires_at: expiresAt,
				action: "oauth-authorize",
				status: 200,
			});
		} else {
			return processRedirect(req, res, state, {
				action: "oauth-authorize",
				status: 401,
				code: "accessTokenFailure",
				error: "Failed to retrieve GitLab access token.",
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

async function getTokens(code) {
	const tokenUrl = "https://gitlab.com/oauth/token";
	const data = {
		client_id: process.env.GITLAB_CLIENT_ID,
		client_secret: process.env.GITLAB_CLIENT_SECRET,
		code: code,
		grant_type: "authorization_code",
		redirect_uri: process.env.GITLAB_CALLBACK_URL,
	};

	try {
		const response = await axios.post(tokenUrl, data, {
			headers: {
				Accept: "application/json",
			},
		});

		return {
			accessToken: response.data.access_token,
			refreshToken: response.data.refresh_token,
			expiresAt: response.data.created_at + response.data.expires_in,
		}; // The response.data will contain the access_token
	} catch (error) {
		console.error("Failed to retrieve access token:", error.response?.data);
		return null;
	}
}

export default endpointHandler;
