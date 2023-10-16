import { useParams } from "@solidjs/router";
import axios from "axios";
import { createEffect, createSignal } from "solid-js";
import { ClipLoader } from "react-spinners";

import "./main.scss";

function drawing() {
  const [drawingDetail, setDrawingDetails] = createSignal(null);
  const [token, setToken] = createSignal("");
  const [projectPin, setProjectPin] = createSignal("");
  const [loading, setLoading] = createSignal(true);
  let [color, setColor] = createSignal("#c22525");
  const params = useParams();
  const override = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };

  createEffect(async () => {
    await axios
      .post(
        `https://api.bimx.avinashi.com/getDrawingDetails/${params.drawingId}`,
        {
          pin: 12345,
        }
      )
      .then((res) => {
        if (res.data.message === "PIN is wrong!") {
          setLoading(false);
        } else {
          setToken(res.data.token);
          setDrawingDetails(res.data);
          setLoading(false);
        }
      });
  }, []);
  createEffect(() => {
    if (token() && drawingDetail()?.drawing) {
      const options = {
        env: "AutodeskProduction",
        api: "derivativeV2",
        getAccessToken: (onGetAccessToken) => {
          // Replace with your access token retrieval logic
          const accessToken = token();
          const expireTimeSeconds = 60 * 30; // Token expiration time in seconds
          onGetAccessToken(accessToken, expireTimeSeconds);
        },
      };

      Autodesk.Viewing.Initializer(options, () => {
        const viewerDiv = document.getElementById("forgeViewerContainer");
        const viewer = new Autodesk.Viewing.GuiViewer3D(viewerDiv);

        viewer.start();

        drawingDetail() &&
          Autodesk.Viewing.Document.load(
            "urn:" + drawingDetail().drawing.config,
            (doc) => {
              viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry());

              // Load the image as an overlay
              const imageOverlay = document.createElement("img");
              imageOverlay.src = drawingDetail()?.organization?.logo_url;
              imageOverlay.classList.add("overlay-image");
              document.body.appendChild(imageOverlay);

              const itemContainer = document.createElement("div");
              itemContainer.classList.add("item-container");

              // Create a title element
              const titleElement = document.createElement("h2");
              titleElement.textContent = drawingDetail()?.drawing?.name;

              // // Create a details element
              // const options = {
              //   year: "numeric",
              //   month: "long",
              //   day: "numeric",
              // };
              // const formattedDate = new Date(
              //   drawingDetail()?.organization?.created_at
              // ).toLocaleDateString("en-US", options);

              // const dateElement = document.createElement("p");
              // dateElement.textContent = formattedDate;
              const revisionElement = document.createElement("p");
              revisionElement.textContent = drawingDetail()?.drawing_code;
              const versionElement = document.createElement("p");
              versionElement.textContent = `-${drawingDetail()?.version_text}`;

              // Append the title and details to the item container
              itemContainer.appendChild(titleElement);
              itemContainer.appendChild(revisionElement);
              itemContainer.appendChild(versionElement);

              // Append the item container to the items container
              document.body.appendChild(itemContainer);
              const container = document.querySelector(".forge-spinner");

              const customLoader = document.createElement("div");
              customLoader.className = "loader"; // You can style this class with CSS
              if (container) {
                container.appendChild(customLoader);
              }
            },

            (code, message, errors) => {
              console.error(code, message, errors);
              alert("Could not load model. See console for more details.");
            }
          );
      });
    }
  }, [drawing]);

  return (
    <>
      {loading() ? (
        <div style={{ margin: "350px  45% ", fontSize: "larger" }}>
          <span style={{ fontSize: "larger" }}>Loading...</span>
        </div>
      ) : (
        <div id="forgeViewerContainer" style={{ height: "100%" }}></div>
      )}
    </>
  );
}

export default drawing;
