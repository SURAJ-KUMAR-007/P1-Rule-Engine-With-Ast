import React from "react";
import CreateRule from "./CreateRule";
import EvaluateRule from "./EvaluateRule";
import GetAllRules from "./GetAllRules";

function App() {
  const [showAllRules, setShowAllRules] = React.useState(false);

  return (
    <div className="main-Container">
      <button
        className="button"
        onClick={() => {
          setShowAllRules(!showAllRules);
        }}
      >
        {showAllRules ? "Hide All Rules" : "Show All Rules"}
      </button>

      {showAllRules ? (
        <GetAllRules />
      ) : (
        <div className="container">
          {" "}
          <CreateRule />
          <EvaluateRule />
        </div>
      )}
    </div>
  );
}

export default App;
