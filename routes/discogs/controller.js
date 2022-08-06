const logger = require("../../modules/logger");

const Firebase = require("firebase-admin");
const firebase = Firebase.firestore();

const getVinylWantList = async (req, res) => {};

const getFSVyinls = async (req, res) => {
  const snapshot = await firebase.collection("vinyls").get();
  let datab = [];
  snapshot.docs.map((doc) => {
    datab.push(doc.data());
  });
  return res.status(200).send(datab);
};

const addVinylToWantList = async (req, res) => {};

module.exports = {
  getVinylWantList,
  getFSVyinls,
  addVinylToWantList,
};
