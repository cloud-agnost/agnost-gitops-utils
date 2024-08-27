import express from "express";
import addTXTRecord from "../handlers/addTXTRecord.js";
import deleteTXTRecord from "../handlers/deleteTXTRecord.js";
import checkContentType from "../middlewares/checkContentType.js";

const router = express.Router({ mergeParams: true });

/*
@route      /domains/records/add
@method     POST
@desc       Adds the TXT record to the domain for DNS01 validation
@access     public
*/
router.post("/add", checkContentType, addTXTRecord);

/*
@route      /domains/records/remove
@method     POST
@desc       Deletes the TXT record from the domain which is used for DNS01 validation
@access     public
*/
router.post("/remove", checkContentType, deleteTXTRecord);

export default router;
