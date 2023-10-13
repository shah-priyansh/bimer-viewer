import { Router, Route, Routes } from "@solidjs/router";
import Drawing from "./pages/drawing";
import "./styles/main.scss"; 
import Dashboard from "./pages/dashboard";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/:drawingId" component={Drawing} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
