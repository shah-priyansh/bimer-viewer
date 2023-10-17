import { Router, Route, Routes } from "@solidjs/router";
import Drawing from "./pages/drawing";
import "./styles/main.scss";
import Dashboard from "./pages/dashboard";
import toast, { Toaster } from "solid-toast";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="" component={Dashboard} />
          <Route path="/:drawingId" component={Drawing} />
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
