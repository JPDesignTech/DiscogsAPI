const logger = require("../../modules/logger");
const axios = require("axios");
const Firebase = require("firebase-admin");
const firebase = Firebase.firestore();

const env = process.env.NODE_ENV;
let config;

switch (env) {
  case "production":
    config = require("../../modules/config/prod");
    break;

  case "beta":
    config = require("../../modules/config/beta");
    break;

  case "development":
    config = require("../../modules/config/dev");
    break;

  default:
    config = require("../../modules/config/prod");
    break;
}

const getVinylWantList = async (req, res) => {
  const discogsToken = config.discogs.token;
  const wantListRequest = await axios.get(
    `https://api.discogs.com/users/jeanp3/wants?token=${discogsToken}`
  );

  const wantListData = wantListRequest.data.wants;

  // Compare Discogs WantList from Notion Vinyl Collection with Status 'Want'.
  // If there is a diff, add the new vinyl to the Notion Vinyl Collection.
  // If there is no diff, do nothing.
  const notionVinylCollection = await axios.get("/api/notion/vinyls");
  const notionVinylCollectionData = notionVinylCollection.data;

  return res.status(200).send(wantListnotionVinylCollectionDataData);
};

const getVinylCollection = async (req, res) => {};

const addVinylToWantList = async (req, res) => {};

module.exports = {
  getVinylWantList,
  addVinylToWantList,
};
