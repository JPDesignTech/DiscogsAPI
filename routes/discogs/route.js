"use strict";

const express = require("express");
const router = express.Router();

const verify = require("../../modules/verify");
const controller = require("./controller");

router.get("/wantlist", controller.getVinylWantList);
router.get("/wantlist/check", controller.checkVinyls);
router.get("/collection", controller.getVinylWantList);

router.post("/discogs", controller.addVinylToWantList);

module.exports = router;
