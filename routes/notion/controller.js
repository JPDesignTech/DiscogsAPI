const logger = require("../../modules/logger");

const Firebase = require("firebase-admin");
const firebase = Firebase.firestore();

const getVinyls = async (req, res) => {
  const snapshot = await firebase.collection("readingList").get();
  let datab = [];
  snapshot.docs.map((doc) => {
    datab.push(doc.data());
  });
  return res.status(200).send(datab);
};

const addVinyl = async (req, res) => {};

module.exports = {
  getVinyls,
  addVinyl,
};
