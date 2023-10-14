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

              // Add an image overlay
              // const imageOverlay = document.getElementById("imageOverlay");
              // imageOverlay.innerHTML =
              //   ' <img src="https://media.geeksforgeeks.org/wp-content/uploads/20190506164011/logo3.png" height="52" alt="GeeksforGeeks logo">';

              // // Position the image overlay within the viewer
              // const viewerContainer = viewerDiv.getElementsByClassName(
              //   "adsk-viewing-viewer"
              // )[0];
              // console.log("viewerContainer3", viewerContainer);

              // imageOverlay.style.position = "absolute";
              // imageOverlay.style.left = "10px"; // Adjust the left position as needed
              // imageOverlay.style.top = "10px"; // Adjust the top position as needed
              // imageOverlay.style.zIndex = "1"; // Ensure it appears above the viewer

              // viewerContainer.appendChild(imageOverlay);
              const imageSrc =
                "https://media.geeksforgeeks.org/wp-content/uploads/20190506164011/logo3.png";
              const position = { x: 10, y: 10 }; // Adjust position as needed

              // const addImageOverlay = () => {
              //   const img = document.createElement("img");
              //   img.src = imageSrc;
              //   img.width = 52;
              //   img.alt = "GeeksforGeeks logo";
              //   viewer.add2DOverlay(img, position);
              // };

              // addImageOverlay();
            },
            (code, message, errors) => {
              console.error(code, message, errors);
              alert("Could not load model. See console for more details.");
            }
          );
      });
    }
  }, [drawing]);
  return <div id="forgeViewerContainer" style={{ height: "100%" }}></div>;
}

export default drawing;
