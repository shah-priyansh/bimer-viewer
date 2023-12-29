import { useParams } from "@solidjs/router";
import axios from "axios";
import { createEffect, createSignal, onCleanup } from "solid-js";

import "./main.scss";
import toast from "solid-toast";

function drawing() {
  const [drawingDetail, setDrawingDetails] = createSignal(null);
  const [token, setToken] = createSignal("");
  const [projectPin, setProjectPin] = createSignal("");
  const [loading, setLoading] = createSignal(true);
  const params = useParams();
  const storedPin = localStorage.getItem("ProjectPin");

  createEffect(async () => {
    try {
      const response = await axios.post(
        `https://api.bimx.avinashi.com/getDrawingDetails/${params.drawingId}`,
        {
          pin:  JSON.parse(storedPin)?.pin,
        }
      );

      if (
        response.data.message === "PIN is wrong!" ||
        response.data.message === "Drawing not found"
      ) {
        setLoading(false);
        toast.error(response.data.message);
      } else {
        setToken(response.data.token);
        setDrawingDetails(response.data);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      toast.error(error);
    }
  }, [params.drawingId]);
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

              const versionElement = document.createElement("p");
              versionElement.textContent = `${drawingDetail()?.drawing_code}-${
                drawingDetail()?.version_text
              }`;

              // Append the title and details to the item container
              itemContainer.appendChild(titleElement);
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
    onCleanup(() => {
      const imageOverlay = document.querySelector(".overlay-image");
      if (imageOverlay) {
        imageOverlay.remove(); // Remove the image overlay when unmounting
      }

      const itemContainer = document.querySelector(".item-container");
      if (itemContainer) {
        itemContainer.remove(); // Remove the item container when unmounting
      }
      // Any other cleanup tasks can be added here
    });
  }, [drawing]);
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const response = await axios.post(
        `https://api.bimx.avinashi.com/getDrawingDetails/${params.drawingId}`,
        {
          pin: projectPin() || JSON.parse(storedPin)?.pin,
        }
      );

      if (
        response.data.message === "PIN is wrong!" ||
        response.data.message === "Drawing not found"
      ) {
        setLoading(false);
        toast.error(response.data.message);
      } else {
        setToken(response.data.token);
        setDrawingDetails(response.data);
        setLoading(false);
        localStorage.setItem("ProjectPin", JSON.stringify({ pin:projectPin() }));
      }
    } catch (error) {
      setLoading(false);
      toast.error(error);
    }
  };

  return (
    <>
      {loading() ? (
        <div style={{ margin: "450px 45%", fontSize: "larger" }}>
          <div>Loading...</div>
          <div className="bar-loader"></div>
        </div>
      ) : drawingDetail() && drawingDetail().drawing ? (
        <div>
          <div id="forgeViewerContainer" style={{ height: "100%" }}></div>
        </div>
      ) : (
          <div className="app-content">
            <div class="flex justify-center items-center h-screen">
              <div class="bg-white border rounded-md px-8 py-6 login_box">
                <h2 class="text-2xl font-semibold mb-4">Enter PIN</h2>
                <form onSubmit={handleSubmit}>
                  <input
                    class="w-full border border-black-300 rounded-md py-2 px-4 mt-4"
                    type="text"
                    placeholder="Enter PIN"
                    value={projectPin()}
                    onInput={(e) => setProjectPin(e.target.value)}
                  />

                  <button
                    type="submit"
                    class="w-full bg-blue-500 mt-4 text-white py-2 rounded-md transition duration-300 hover:bg-blue-600"
                    disabled={loading()}
                  >
                    {loading() ? "Loading..." : "Submit"}
                  </button>

                </form>
        
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default drawing;
