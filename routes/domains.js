import express from "express";
import addTXTRecord from "../handlers/addTXTRecord.js";
import deleteTXTRecord from "../handlers/deleteTXTRecord.js";

const router = express.Router({ mergeParams: true });

/*
@route      /domains/records/add
@method     POST
@desc       Adds the TXT record to the domain for DNS01 validation
@access     public
*/
router.post("/add", addTXTRecord);

/*
@route      /domains/records/remove
@method     POST
@desc       Deletes the TXT record from the domain which is used for DNS01 validation
@access     public
*/
router.post("/remove", deleteTXTRecord);

export default router;
