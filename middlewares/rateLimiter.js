import { RateLimiterRedis } from "rate-limiter-flexible";
import { getRedisClient } from "../init/cache.js";

// Apply rate limits to utility server endpoints
export const createRateLimiter = (rateLimitConfig) => {
	const rateLimiter = new RateLimiterRedis({
		storeClient: getRedisClient(),
		points: rateLimitConfig.rateLimitMaxHits, // Limit each unique identifier (IP or userId) to N requests per `window`
		duration: rateLimitConfig.rateLimitWindowSec, // Window duration in seconds
	});

	return (req, res, next) => {
		rateLimiter
			.consume(getIP(req))
			.then(() => {
				next();
			})
			.catch(() => {
				return res.status(429).json({
					error: "Rate Limit Exceeded",
					details: "Too many requests, please try again later.",
					code: "rateLimitExceeded",
				});
			});
	};
};

/**
 * Get the IP number of requesting client
 * @param  {object} req HTTP request object
 */
function getIP(req) {
	try {
		var ip;
		if (req.headers["x-forwarded-for"]) {
			ip = req.headers["x-forwarded-for"].split(",")[0];
		} else if (req.connection && req.connection.remoteAddress) {
			ip = req.connection.remoteAddress;
		} else {
			ip = req.ip;
		}

		return ip;
	} catch (err) {
		console.error(err);
		return req.ip ?? null;
	}
}
