"use strict";

const express = require("express");
const router = express.Router();

const verify = require("../../modules/verify");
const controller = require("./controller");

router.get("/list", controller.getVinylFromNotion);
router.post("/list", controller.addVinylToNotion);

module.exports = router;
