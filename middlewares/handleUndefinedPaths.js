// Middleware to handle undefined paths or posts
export const handleUndefinedPaths = (req, res) => {
	return res.status(404).json({
		error: "Not Found",
		details: "The server can not find the requested resource.",
		code: "resourceNotFound",
	});
};
