import React from "react";
import Register from "./pages/SignupPage";
// import Home from "./home";
import Login from "./pages/LoginPage";
import {BrowserRouter, Route, Routes} from 'react-router-dom';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Register />}></Route>
        {/* <Route path="/home" element={<Home />}></Route> */}
        <Route path="/login" element={<Login />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;