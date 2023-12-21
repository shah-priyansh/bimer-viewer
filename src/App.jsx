import { Route, Router, Routes } from "@solidjs/router";
import { Toaster } from "solid-toast";
import Dashboard from "./pages/dashboard";
import Drawing from "./pages/drawing";
import ProjectDetail from "./pages/projectdetail";

import "./styles/main.scss";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="" component={Dashboard} />
          <Route path="/:drawingId" component={Drawing} />
          <Route path='p/:projectId' component={ProjectDetail} />
        </Routes>
      </Router>
      <Toaster
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          className: "",
          duration: 3000,
          style: {
            background: "#fffff",
            color: "black",
          },
        }}
      />
    </>
  );
}

export default App;
