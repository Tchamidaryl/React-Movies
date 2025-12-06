import React, { useState } from "react";
import Search from "./components/search";

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  return (
    <main className="">
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1 className="">Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
        </header>
      </div>

      <Search searchTerm={ searchTerm } setSearchTerm={ setSearchTerm } />
      <h1 className="text-white">{ searchTerm }</h1>
    </main>
  );
};

export default App;
