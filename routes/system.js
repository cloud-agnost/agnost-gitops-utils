import express from "express";

const router = express.Router({ mergeParams: true });

/*
@route      /
@method     GET
@desc       Checks liveliness of utils server
@access     public
*/
router.get("/health", (req, res) => {
	res.status(200).send(`${new Date().toISOString()} - Healthy utils server`);
});

/*
@route      /ping
@method     GET
@desc       Checks liveliness of utils server
@access     public
*/
router.get("/ping", (req, res) => {
	res.status(200).send(`${new Date().toISOString()} - Pong!`);
});

export default router;
