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
  try {
    const status = req.body.status;
    const list = req.body.list;
    const discogsToken = config.discogs.token;
    let listRequest;
    if (list === "wantlist") {
      listRequest = await axios.get(
        `https://api.discogs.com/users/jeanp3/wants?token=${discogsToken}`
      );
    } else {
      if (status === "Preordered" || status === "Owned") {
        const discogsFolders = await axios.get(
          `https://api.discogs.com/users/jeanp3/collection/folders?token=${discogsToken}`
        );

        // Get the folder that relates to the status passed through the request
        let folderID = discogsFolders.data.folders.filter(
          (folder) => folder.name === status
        )[0].id;

        listRequest = await axios.get(
          `https://api.discogs.com/users/jeanp3/collection/folders/${folderID}/releases?token=${discogsToken}`
        );
      } else {
        listRequest = await axios.get(
          `https://api.discogs.com/users/jeanp3/collection/folders/0/releases?token=${discogsToken}`
        );
      }
    }
    // Compare Discogs Folder or Wantlist to Notion Vinyl Collection with the same Status.
    // If there is a diff, add the new vinyl to the Notion Vinyl Collection.
    // If there is no diff, do nothing.
    const notionVinylCollection = await axios.get(
      `${config.notion.url}/api/v1/notion/vinyls?status=${status}`
    );
    const notionVinylCollectionData = await notionVinylCollection.data;
    const listData =
      list === "wantlist" ? listRequest.data.wants : listRequest.data.releases;

    const listPromise = listData.map(async (vinyl) => {
      let artists = [];
      let genres = [];
      let styles = [];

      if (vinyl["basic_information"]["artists"].length > 0) {
        vinyl["basic_information"]["artists"].map((artist) => {
          artists.push(artist.name.replace(/,/g, ""));
        });
      }
      if (vinyl["basic_information"]["genres"].length > 0) {
        vinyl["basic_information"]["genres"].map((genre) => {
          genres.push(genre.replace(/,/g, ""));
        });
      }
      if (vinyl["basic_information"]["styles"].length > 0) {
        vinyl["basic_information"]["styles"].map((style) => {
          styles.push(style.replace(/,/g, ""));
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
          name: `${status}`,
        },
      };
      const isInNotion = await compareVinyls(
        vinylData,
        notionVinylCollectionData
      );

      if (!isInNotion) {
        return setTimeout(() => {
          addVinylToNotion(vinylData);
        }, 2000);
      } else {
        return;
      }
    });

    await Promise.all(listPromise);

    return res.status(200).send("OK");
  } catch (error) {
    logger.error(error);
    return res.status(500).send(error);
  }
};

const getVinylCollection = async (req, res) => {
  const discogsToken = config.discogs.token;
  const collectionRequest = await axios.get(
    `https://api.discogs.com/users/jeanp3/collection/folders/0/releases?token=${discogsToken}`
  );

  const collectionRequestData = collectionRequest.data.releases;
  return res.status(200).send(collectionRequestData);
};

const addVinylToWantList = async (req, res) => {};

const compareVinyls = async (discogsVinyl, notionVinyls) => {
  const isInNotion = Object.keys(notionVinyls).some(
    (notionVinyl) => notionVinyls[notionVinyl].id === discogsVinyl.id
  );
  return isInNotion;
};

const addVinylToNotion = async (vinyl) => {
  const notionVinyl = await axios.post(
    `${config.notion.url}/api/v1/notion/vinyls`,
    vinyl
  );
  return notionVinyl;
};

module.exports = {
  getVinylWantList,
  getVinylCollection,
  addVinylToWantList,
  checkVinyls,
};
