const logger = require("../../modules/logger");

const Firebase = require("firebase-admin");
const { default: axios } = require("axios");
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

const getVinyls = async (req, res) => {
  const snapshot = await firebase.collection("readingList").get();
  let datab = [];
  snapshot.docs.map((doc) => {
    datab.push(doc.data());
  });
  return res.status(200).send(datab);
};

const addVinylToNotion = async (req, res) => {};

const getVinylFromNotion = async (req, res) => {
  console.log(`🐛 🐞 req ➡ ${JSON.stringify(req.body.status, null, 2)} 🐞 🐛 `);
  const wantlistFromNotion = await axios.get(
    `${config.notion.url}/api/v1/notion/vinyls?status=${req.body.status}`
  );
  const wantlistFromNotionData = await wantlistFromNotion.data;
  res.status(200).send(wantlistFromNotionData);
  return wantlistFromNotionData;
};

module.exports = {
  addVinylToNotion,
  getVinylFromNotion,
};
