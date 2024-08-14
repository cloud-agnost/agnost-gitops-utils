import { query } from "express-validator";

const middlewareHandler = [
	query("redirect")
		.trim()
		.notEmpty()
		.withMessage("Required field, cannot be left empty.")
		.bail()
		.isURL({ require_tld: false, require_protocol: true })
		.withMessage(
			"Not a valid rediret URL. Redirect URL needs to be in 'http(s)://domain.com/path' format"
		),
];

export default middlewareHandler;
