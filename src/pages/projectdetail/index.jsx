import { useNavigate, useParams } from "@solidjs/router";
import axios from "axios";
import { createEffect, createSignal } from "solid-js";
import "./main.scss";
import toast from "solid-toast";


function ProjectDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const [projectId, setProjectId] = createSignal(params.projectId);
  const [project, setProject] = createSignal(null);
  const [projectPin, setProjectPin] = createSignal("");
  const [error, setError] = createSignal(null);
  const [drawings, setDrawings] = createSignal([]);
  const [loading, setLoading] = createSignal(false);

  createEffect(async () => {
    if (!params.projectId) {
      navigate(`/p/:projectId`); // Call API to fetch project details
    }
  }, []);

  const fetchProjectDetails = async (projectId, pin) => {
    setLoading(true);
    try {
        await axios
          .post(`https://api.bimx.avinashi.com/getProjectDetails/${projectId}`, {
            pin,
          })
          .then((res) => {
            if (res.data.message === "PIN is wrong!") {
              setError(res.data.message);
              setLoading(false);
              setProjectPin("");
              toast.error(res.data.message);
            } else {
              setProject(res.data.project);
              setDrawings(res.data.drawings);
              setLoading(false);
              setProjectPin(pin);
              navigate(`/p/${projectId}`);
              localStorage.setItem("ProjectPin", JSON.stringify({ pin }));
            }
          });
    } catch (error) {
      setError("Error fetching project details", error);
      setLoading(false);
    }
  };
  createEffect(async () => {
    const storedPin = localStorage.getItem("ProjectPin");

    if (params.projectId !== ":projectId") {
      setProjectPin(JSON.parse(storedPin)?.pin);
      setLoading(true);
      await fetchProjectDetails(projectId(), JSON.parse(storedPin)?.pin || ""); // Call API to fetch project details
    }
  }, [params.projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (projectId()) {
        if (params.projectId === ":projectId") {
          navigate(`/p/${projectId()}`);
        } else {
          await fetchProjectDetails(projectId(), projectPin());
        }
        setProjectId(projectId());
      }
      setProjectPin("");
      setLoading(false);
    } catch (error) {
      setError("Error submitting project ID");
      setLoading(false);
    }
  };

  const go_to_drawing = (drawingId) => {
    navigate(`/${drawingId}`);
  };

  const getImageSrc = (project) => {
    const projectName = project.name.trim();
    const firstLetter = projectName[0].toUpperCase();
    return `https://dummyimage.com/200x200/000/eee&text=${firstLetter}`;
  };

  return (
    <>
      {loading() ? (
        <div style={{ margin: "450px  45% ", fontSize: "larger" }}>
          <div>Loading...</div>
          <div className="bar-loader"></div>
        </div>
      ) : params.projectId !== ":projectId" &&
        project() &&
        error() !== "PIN is wrong!" ? (
        <>
          <div className="app-content">
            <div>
              <div className="card-demo">
                <div className="flex flex-sm-nowrap gap-6 card-contents">
                  <div>
                    <div className="inline-block card-img">
                      <img
                        className="rounded inline-block"
                        src={getImageSrc(project())}
                        alt={project()?.name}
                      />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="font-bold card_title ">
                      {project()?.name}
                    </div>
                    <div className="border border-dashed mt-7 drawing_box">
                      <div className="flex items-center gap-2">
                        <div></div>
                        <h5 className=" font-bold">{drawings().length}</h5>
                      </div>
                      <span className="text-sm font-semibold ">
                        {drawings().length === 1 ? "Drawing" : "Drawings"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <h3 className="sub-title font-semibold">Drawings</h3>
              <div className="grid xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 mt-1">
                {drawings().map((drawing) => (
                  <div
                    key={drawing.id}
                    onClick={() => go_to_drawing(drawing?.code)}
                  >
                    {/* card Start */}
                    <div className="drawing-card">
                      <div className="img-box inline-block">
                        <img src="/plurk.svg" alt="card2" />
                      </div>
                      <div className="drawing-content">
                        <h5 className=" font-bold drawing-title">
                          {drawing?.description}
                        </h5>
                        <div className="font-semibold drawing-subtitle">
                          {drawing?.description}
                        </div>
                        <div className="mt-6 flex items-center gap-6">
                          <div className="py-3 px-4 btns">
                            <div className="">{drawing?.date}</div>
                            <p className="font-semibold">Due Date</p>
                          </div>

                          <div className="py-3 px-4 btns">
                            <div className="">{drawing?.budget}</div>
                            <p className="font-semibold">Budget</p>
                          </div>
                        </div>
                        <div className="mt-6 mb-4 drawing-border"></div>
                      </div>
                    </div>
                    {/* card End */}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="app-content">
            <div class="flex justify-center items-center h-screen">
              <div class="bg-white border rounded-md px-8 py-6 login_box">
                <h2 class="text-2xl font-semibold mb-4">
                  {params.projectId === ":projectId" ||
                  error() === "Error fetching project details"
                    ? "Enter Project ID"
                    : "Enter PIN"}
                </h2>
                <form onSubmit={handleSubmit}>
                  {params.projectId === ":projectId" ||
                  error() === "Error fetching project details" ? (
                    <input
                      class="w-full border-black-300 rounded-md py-2 px-4 mt-4"
                      type="text"
                      placeholder="Enter Project ID"
                      onChange={(e) => setProjectId(e.target.value)}
                    />
                  ) : (
                    <input
                      class="w-full border border-black-300 rounded-md py-2 px-4 mt-4"
                      type="text"
                      placeholder="Enter PIN"
                      value={projectPin()}
                      onInput={(e) => setProjectPin(e.target.value)}
                    />
                  )}
                  <button
                    type="submit"
                    class="w-full bg-blue-500 mt-4 text-white py-2 rounded-md transition duration-300 hover:bg-blue-600"
                    disabled={loading()}
                  >
                    {loading() ? "Loading..." : "Submit"}
                  </button>

                  {error() && <p class="text-red-500 mt-2">{error()}</p>}
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default ProjectDetail;