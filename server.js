import express from "express";
import cors from "cors";
import helmet from "helmet";
import nocache from "nocache";
import process from "process";
import config from "config";
import responseTime from "response-time";
import { createRateLimiter } from "./middlewares/rateLimiter.js";
import { handleUndefinedPaths } from "./middlewares/handleUndefinedPaths.js";
import { logRequest } from "./middlewares/logRequest.js";
import { connectToRedisCache, disconnectFromRedisCache } from "./init/cache.js";

if (process.env.NODE_ENV === "development") {
	const dotenv = (await import("dotenv")).default;
	// Load environment variables from .env file
	dotenv.config();
}

(function () {
	console.info(`Process ${process.pid} is running`);
	// Connect to cache server(s)
	connectToRedisCache();
	const server = initExpress();
	// Gracefull handle process exist
	handleProcessExit(server);
})();

async function initExpress() {
	var app = express();
	// Add rate limiter middlewares
	let rateLimiters = config.get("rateLimiters");
	rateLimiters.forEach((entry) => app.use(createRateLimiter(entry)));
	//Secure express app by setting various HTTP headers
	app.use(helmet());
	//Enable cross-origin resource sharing
	app.use(
		cors({
			exposedHeaders: ["Access-Token", "Refresh-Token"],
		})
	);
	//Disable client side caching
	app.use(nocache());
	app.set("etag", false);
	app.use(responseTime(logRequest));
	app.use("/", (await import("./routes/system.js")).default);
	app.use("/domains/records", (await import("./routes/domains.js")).default);
	app.use("/provider", (await import("./routes/callbacks.js")).default);
	app.use("/oauth/:providerType", (await import("./routes/oauth.js")).default);

	// Middleware to handle undefined paths or posts
	app.use(handleUndefinedPaths);

	// Spin up the http server
	const HOST = config.get("server.host");
	const PORT = config.get("server.port");
	var server = app.listen(PORT, () => {
		console.info(`Http server started @ ${HOST}:${PORT}`);
	});

	server.timeout = config.get("server.timeout");
	return server;
}

function handleProcessExit(server) {
	//Gracefully exit if we force quit through cntr+C
	process.on("SIGINT", () => {
		// Close connection to cache server(s)
		disconnectFromRedisCache();
		//Close Http server
		server.close(() => {
			console.info("Http server closed");
		});
	});
}
