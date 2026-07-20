import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DJVisualizer from "./components/DJVisualizer";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DJVisualizer />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
