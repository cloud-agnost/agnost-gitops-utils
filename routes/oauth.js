import express from "express";
import checkOAuthProvider from "../middlewares/checkOAuthProvider.js";
import checkAuthQueryParams from "../middlewares/checkAuthQueryParams.js";
import validateInput from "../middlewares/validateInput.js";
import executeOAuthFlow from "../middlewares/executeOAuthFlow.js";
import refreshAccessToken from "../handlers/refreshAccessToken.js";
import revokeAccessToken from "../handlers/revokeAccessToken.js";

const router = express.Router({ mergeParams: true });

/*
@route      /oauth/:providerType
@method     GET
@desc       Authenticates the user using the specified provider
@access     public
*/
router.get(
	"/",
	checkOAuthProvider,
	checkAuthQueryParams,
	validateInput,
	executeOAuthFlow
);

/*
@route      /oauth/:providerType/refresh
@method     POST
@desc       Refreshes the access token using the specified provider
@access     public
*/
router.post("/refresh", checkOAuthProvider, refreshAccessToken);

/*
@route      /oauth/:providerType/revoke
@method     POST
@desc       Revokes the access token using the specified provider
@access     public
*/
router.post("/revoke", checkOAuthProvider, revokeAccessToken);

export default router;
