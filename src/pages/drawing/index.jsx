import axios from "axios";
import { createEffect, createSignal } from "solid-js";

function drawing() {
  const [drawing, setDrawing] = createSignal(null);
  const [drawingPin, setDrawingPin] = createSignal("");
  const [token, setToken] = createSignal("");
  const [loading, setLoading] = createSignal(true);

  createEffect(async () => {
    await axios
      .post(`https://api.bimx.avinashi.com/getDrawingDetails/${146345}`, {
        pin: 12345,
      })
      .then((res) => {
        if (res.data.message === "PIN is wrong!") {
          setLoading(false);
        } else {
          setToken(res.data.token);
          setDrawing(res.data.drawing);
          setLoading(false);
        }
      });
  }, []);
  createEffect(() => {
    if (token() && drawing()) {
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

        drawing() &&
          Autodesk.Viewing.Document.load(
            "urn:" + drawing().config,
            (doc) => {
              viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry());

              // Load the image as an overlay
              const imageOverlay = document.createElement("img");
              imageOverlay.src = "/vite.svg";
              imageOverlay.style.position = "absolute";
              imageOverlay.style.left = "10px";
              imageOverlay.style.top = "10px";
              imageOverlay.style.zIndex = "1";
              imageOverlay.style.height = "40px";
              document.body.appendChild(imageOverlay);
            },

            (code, message, errors) => {
              console.error(code, message, errors);
              alert("Could not load model. See console for more details.");
            }
          );
      });
    }
  }, [drawing]);
  // const modelStructurePanel = document.getElementById(
  //   "ViewerModelStructurePanel"
  // );
  // if (modelStructurePanel) {
  //   // Update the style of the panel
  //   modelStructurePanel.style.top = "70px"; // Set the width to 300px
  //   modelStructurePanel.style.backgroundColor = "lightgray"; // Change the background color

  //   // You can apply more styles as needed
  // } else {
  //   console.log(
  //     "ViewerMowwdelStructurePanel not found or not yet initialized."
  //   );
  // }
  return <div id="forgeViewerContainer" style={{ height: "100%" }}></div>;
}

export default drawing;
