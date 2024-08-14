import { validationResult } from "express-validator";

const middlewareHandler = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({
			error: "Invalid Request Parameters",
			details:
				"The request parameters has failed to pass the validation rules.",
			code: "validationError",
			fields: errors.array(),
		});
	}

	next();
};

export default middlewareHandler;
