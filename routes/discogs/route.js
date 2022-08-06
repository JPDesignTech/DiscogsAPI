"use strict";

const express = require("express");
const router = express.Router();

const verify = require("../../modules/verify");
const controller = require("./controller");

router.get("/discogs", controller.getVinylWantList);
router.post("/discogs", controller.addVinylToWantList);

module.exports = router;
