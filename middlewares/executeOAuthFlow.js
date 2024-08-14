import axios from "axios";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as GitLabStrategy } from "passport-gitlab2";
import { Strategy as BitbucketStrategy } from "passport-bitbucket-oauth2";

const middlewareHandler = async (req, res, next) => {
	let strategy = createStrategy(req.provider, req);

	let scope = undefined;
	switch (req.provider) {
		case "github":
			scope = ["user", "repo", "admin:repo_hook"];
			break;
		case "gitlab":
			scope = ["api"];
			break;
		case "bitbucket":
			scope = ["account", "email", "repository", "webhook"];
			break;
		default:
			break;
	}

	// If not already set then set the redirect session parameter. Twitter does not support state parameter that is why we need to store it in session
	passport.authenticate(
		strategy,
		{
			scope: scope,
			// We need to store the redirect URL in state
			state: encodeURIComponent(req.query.redirect),
		},
		// Custom error and success handling
		function (err, user, info) {
			if (err || !user) {
				return processRedirect(
					req,
					res,
					encodeURIComponent(req.query.redirect),
					{
						status: err?.status ?? 401,
						code: err?.code ?? "permissionDenied",
						error: `User cannot be authenticated through ${
							req.provider
						} OAuth flow. ${err?.message ?? info?.message ?? ""}`,
					}
				);
			} else {
				next();
			}
		}
	)(req, res, next);
};

function createStrategy(provider, req) {
	switch (provider) {
		case "github":
			return new GitHubStrategy(
				{
					clientID: process.env.GITHUB_CLIENT_ID,
					clientSecret: process.env.GITHUB_CLIENT_SECRET,
					callbackURL: process.env.GITHUB_CALLBACK_URL,
				},
				verifyCallback(req)
			);
		case "gitlab":
			return new GitLabStrategy(
				{
					clientID: process.env.GITLAB_CLIENT_ID,
					clientSecret: process.env.GITLAB_CLIENT_SECRET,
					callbackURL: process.env.GITLAB_CALLBACK_URL,
				},
				verifyCallback(req)
			);
		case "bitbucket":
			return new BitbucketStrategy(
				{
					clientID: process.env.BITBUCKET_CLIENT_ID,
					clientSecret: process.env.BITBUCKET_CLIENT_SECRET,
					callbackURL: process.env.BITBUCKET_CALLBACK_URL,
				},
				verifyCallback(req)
			);
		default:
			return null;
	}
}

const verifyCallback = (req) => {
	return async (accessToken, refreshToken, profile, done) => {
		// Set normalized user data
		req.authResult = await getNormalizedUserData(
			req.provider,
			profile,
			accessToken,
			refreshToken
		);

		return done(null, req.authResult);
	};
};

async function getNormalizedUserData(
	provider,
	profile,
	accessToken,
	refreshToken
) {
	let normlizedProfile = {
		accessToken,
		refreshToken,
	};
	switch (provider) {
		case "github":
		case "gitlab":
		case "bitbucket":
			normlizedProfile.provider = provider;
			normlizedProfile.providerUserId = profile.id;
			normlizedProfile.name = profile.displayName;
			if (profile.emails && profile.emails[0])
				normlizedProfile.email = profile.emails[0].value;
			if (profile.photos && profile.photos[0])
				normlizedProfile.profilePicture = profile.photos[0].value;
			break;
	}

	// If github does not return the email address of the user call the api endpoint to get it
	if (!normlizedProfile.email && provider === "github") {
		try {
			let result = await axios.get("https://api.github.com/user/emails", {
				headers: {
					Accept: "application/vnd.github.v3+json",
					"User-Agent": "OAuth App",
					Authorization: `token ${accessToken}`,
				},
			});

			if (result.data) {
				for (let i = 0; i < result.data.length; i++) {
					const emeilEntry = result.data[i];
					if (emeilEntry && emeilEntry.primary && emeilEntry.email)
						normlizedProfile.email = emeilEntry.email;
				}
			}
		} catch {}
	}

	return normlizedProfile;
}

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

export default middlewareHandler;
