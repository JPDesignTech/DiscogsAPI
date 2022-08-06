"use strict";

const express = require("express");
const router = express.Router();

const verify = require("../../modules/verify");
const controller = require("./controller");

router.get("/vinyls", controller.getVinyls);
router.post("/vinyls", controller.addVinyl);

module.exports = router;
