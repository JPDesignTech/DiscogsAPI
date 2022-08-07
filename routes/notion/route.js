"use strict";

const express = require("express");
const router = express.Router();

const verify = require("../../modules/verify");
const controller = require("./controller");

router.get("/wants", controller.getVinylFromNotion);
router.post("/wants", controller.addVinylToNotion);

module.exports = router;
