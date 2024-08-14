const middlewareHandler = async (req, res, next) => {
	let providerName = req.params.providerType;
	if (!providerName) {
		return res
			.status(400)
			.json(
				createErrorMessage(
					"client_error",
					"noOAuthProvider",
					"An OAuth provider needs to be specified in request URL."
				)
			);
	}

	// Convert provider name to lowercase letters
	providerName = providerName.toLowerCase();
	if (!getSupportedProviders().includes(providerName)) {
		return res
			.status(400)
			.json(
				createErrorMessage(
					"client_error",
					"unsupportedOAuthProvider",
					`The specified OAuth provider (${req.params.providerType}) is not supported.`
				)
			);
	}

	// Set the provider information
	req.provider = providerName;
	next();
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

function getSupportedProviders() {
	return ["github", "gitlab", "bitbucket"];
}

export default middlewareHandler;
