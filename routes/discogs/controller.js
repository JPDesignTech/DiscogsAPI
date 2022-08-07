const logger = require("../../modules/logger");
const axios = require("axios");
const Firebase = require("firebase-admin");
const firebase = Firebase.firestore();
const notionController = require("../notion/controller");

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
  return res.status(200).send(wantListData);
};

const checkVinyls = async (req, res) => {
  const discogsToken = config.discogs.token;
  const wantListRequest = await axios.get(
    `https://api.discogs.com/users/jeanp3/wants?token=${discogsToken}`
  );
  // Compare Discogs WantList from Notion Vinyl Collection with Status 'Wanted'.
  // If there is a diff, add the new vinyl to the Notion Vinyl Collection.
  // If there is no diff, do nothing.
  const notionVinylCollection = await axios.get(
    `${config.notion.url}/api/v1/notion/vinyls?status=Wanted`
  );
  const notionVinylCollectionData = await notionVinylCollection.data;

  const wantListData = wantListRequest.data.wants;
  const discogsVinyls = [];

  const wantListPromise = wantListData.map((vinyl) => {
    let artists = [];
    let genres = [];
    let styles = [];

    if (vinyl["basic_information"]["artists"].length > 0) {
      vinyl["basic_information"]["artists"].map((artist) => {
        artists.push(artist.name);
      });
    }
    if (vinyl["basic_information"]["genres"].length > 0) {
      vinyl["basic_information"]["genres"].map((genre) => {
        genres.push(genre);
      });
    }
    if (vinyl["basic_information"]["styles"].length > 0) {
      vinyl["basic_information"]["styles"].map((style) => {
        styles.push(style);
      });
    }

    const vinylData = {
      id: vinyl.id.toString(),
      resourceURL: `https://www.discogs.com/release/${vinyl.id}`,
      title: vinyl.basic_information.title,
      year: vinyl.basic_information.year,
      coverImg: vinyl.basic_information.cover_image,
      dateAdded: vinyl.date_added,
      artists,
      genres,
      styles,
      status: {
        name: "Wanted",
      },
    };
    const isInNotion = compareVinyls(vinylData, notionVinylCollectionData);
    if (!isInNotion) {
      addVinylToNotion(vinylData);
    }
    discogsVinyls.push(vinylData);
  });

  await Promise.all(wantListPromise);

  // // Compare Discogs WantList from Notion Vinyl Collection with Status 'Wanted'.
  // // If there is a diff, add the new vinyl to the Notion Vinyl Collection.
  // const vinylsCompared = await compareVinyls(
  //   discogsVinyls,
  //   notionVinylCollectionData
  // );

  return res.status(200).send("Ok");
};;

const getVinylCollection = async (req, res) => {};

const addVinylToWantList = async (req, res) => {};

const compareVinyls = async (discogsVinyl, notionVinyls) => {
  const isInNotion = Object.keys(notionVinyls).some(
    (notionVinyl) => notionVinyls[notionVinyl].id === discogsVinyl.id
  );
  if (isInNotion) {
    return true;
  } else {
    return false;
  }
};

const addVinylToNotion = async (vinyl) => {
  console.log(
    `🐛 🐞 adding vinyl to notion ➡ ${JSON.stringify(vinyl, null, 2)} 🐞 🐛 `
  );
  const notionVinyl = await axios.post(
    `${config.notion.url}/api/v1/notion/vinyls`,
    vinyl
  );
  return notionVinyl;
};

module.exports = {
  getVinylWantList,
  addVinylToWantList,
  checkVinyls,
};
