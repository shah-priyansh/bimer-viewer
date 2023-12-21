import { useNavigate, useParams } from "@solidjs/router";
import axios from "axios";
import { createEffect, createSignal } from "solid-js";
import "./main.scss";

function ProjectDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const [projectId, setProjectId] = createSignal(params.projectId);
  const [project, setProject] = createSignal(null);
  const [projectPin, setProjectPin] = createSignal("");
  const [error, setError] = createSignal(null);
  const [drawings, setDrawings] = createSignal([]);
  const [loading, setLoading] = createSignal(false);

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
          } else {
            setProject(res.data.project);
            setDrawings(res.data.drawings);
            setLoading(false);
            setProjectPin(pin);
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
    navigate(`/${drawingId}`)
  }

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
          <div className={`mb-5 mb-xl-10 project_info cursor-pointer`}>
            <div className="card-body p-9 pb-4">
              <div className="d-flex flex-wrap flex-sm-nowrap mb-3">
                <div className="me-7 mb-4">
                  <div className="symbol symbol-100px symbol-lg-160px symbol-fixed position-relative">
                    <img src={getImageSrc(project())} alt={project()?.name} />
                  </div>
                </div>

                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start flex-wrap mb-2">
                    <div className="d-flex flex-column">
                      <div className="d-flex align-items-center mb-2">
                        <div className="text-gray-800 text-hover-primary fs-2 fw-bolder me-1">
                          {project()?.name}
                        </div>
                      </div>

                      <div className="d-flex flex-wrap fw-bold fs-6 mb-4 pe-2">
                        {project()?.tags &&
                          project()?.tags?.map((tag) => (
                            <span className="badge badge-light-danger fw-semibold me-1">
                              {tag}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap flex-stack">
                    <div className="d-flex flex-column flex-grow-1 pe-8">
                      <div className="d-flex flex-wrap">
                        <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                          <div className="d-flex align-items-center">
                            <div className="fs-2 fw-bolder">
                              {drawings().length}
                            </div>
                          </div>

                          <div className="fw-bold fs-6 text-gray-400">
                            {drawings().length === 1 ? "Drawing" : "Drawings"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="d-flex justify-content-between align-items-center h-55px">
            <div className="card-header border-0 pt-5">
              <h3 className="card-title align-items-start flex-column">
                <span className="card-label fw-bold fs-3 mb-1">Drawings</span>
              </h3>
            </div>
          </div>
          <div className="row">
            {drawings().map((drawing) => (
              <div
                className="col-md-6 col-xl-4 cursor-pointer"
                key={drawing.id}
                onClick={() => go_to_drawing(drawing?.code)}
              >
                {" "}
                <div
                  className={`border border-2 border-gray-300 border-hover card2_wrapp`}
                  style={{ maxHeight: "300px", maxWidth: "580px" }}
                >
                  <div className="card-header border-0 pt-9">
                    <div className="card-title m-0">
                      <div className="symbol symbol-50px w-50px bg-light ms-7">
                        <img src="/plurk.svg" alt="card2" className="p-3" />
                      </div>
                    </div>

                    <div className="card-toolbar">
                      <span className={`badge  fw-bolder me-auto px-4 py-3`}>
                        {drawing?.status}
                      </span>
                    </div>
                  </div>

                  <div className="card-body p-9">
                    <div className="fs-3 fw-bolder text-dark">
                      {drawing?.title}
                    </div>

                    <p className="text-gray-400 fw-bold fs-5 mt-1 mb-7">
                      {drawing?.description}
                    </p>

                    <div className="d-flex flex-wrap mb-5">
                      <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-7 mb-3">
                        <div className="fs-6 text-gray-800 fw-bolder">
                          {drawing?.date}
                        </div>
                        <div className="fw-bold text-gray-400">Due Date</div>
                      </div>

                      <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 mb-3">
                        <div className="fs-6 text-gray-800 fw-bolder">
                          {drawing?.budget}
                        </div>
                        <div className="fw-bold text-gray-400">Budget</div>
                      </div>
                    </div>

                    <div
                      className="h-4px w-100 bg-light mb-5"
                      data-bs-toggle="tooltip"
                      title="This project completed"
                    >
                      <div
                        className={` rounded h-4px`}
                        role="progressbar"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {" "}
          <div class="flex justify-center items-center h-screen">
            <div class="bg-white shadow-md rounded-md p-8">
              <h2 class="text-2xl font-semibold mb-4">
                {params.projectId === ":projectId"
                  ? "Enter Project ID"
                  : "Enter PIN"}
              </h2>
              <form onSubmit={handleSubmit}>
                {params.projectId === ":projectId" ? (
                  <input
                    class="w-full border-black-300 rounded-md py-2 px-4 mb-4"
                    type="text"
                    placeholder="Enter Project ID"
                    onChange={(e) => setProjectId(e.target.value)}
                  />
                ) : (
                  <input
                    class="w-full border-black-300 rounded-md py-2 px-4 mb-4"
                    type="text"
                    placeholder="Enter PIN"
                    value={projectPin()}
                    onInput={(e) => setProjectPin(e.target.value)}
                  />
                )}
                <button
                  type="submit"
                  class="w-full bg-blue-500 text-white py-2 rounded-md transition duration-300 hover:bg-blue-600"
                  disabled={loading()}
                >
                  {loading() ? "Loading..." : "Submit"}
                </button>

                {error() && <p class="text-red-500 mt-2">{error()}</p>}
              </form>
            </div>
          </div>
        </>
      )}
      )
    </>
  );
}

export default ProjectDetail;
