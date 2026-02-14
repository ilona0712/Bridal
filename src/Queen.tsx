import { useState } from "react";

function Queen() {
  const [prompt, setPrompt] = useState("");
  const styles = ["Classic", "Modern", "Princess"];
  return (
    <div className="page">
      <div className="card">
        <h1>BrideMeUp</h1>
        <p>AI Generated Wedding Dresses</p>

        <input
          placeholder="Describe your dress..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
          <div className="chips">
          {styles.map((s) => (
          <button key={s} className="chip" onClick={() => setPrompt((prev) => prev + " " + s)}>
              {s}
          </button>
          ))}
          </div>

        <img src="https://via.placeholder.com/300" alt="placeholder" />

        <div className="actions">
          <button>Start</button>
          <a href="#">Learn more</a>
        </div>
      </div>
    </div>
  );
}

export default Queen;
