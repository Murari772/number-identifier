import React, { useState, useRef } from "react";
import "./App.css";

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  function formatResult(n) {
    if (n === "nan" || n === null || n === undefined) {
      return "Number not detected";
    }
    return n;
  }

  function handleChange(e) {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
    }
  }

  async function upload() {
    if (!file) return;
    setLoading(true);
    setResult(null);

    const fd = new FormData();
    fd.append("image", file);

    try {
      const res = await fetch("http://127.0.0.1:5000/identify", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (res.ok) {
        setResult(formatResult(data.number));
      } else {
        setResult("nan");
      }
    } catch (err) {
      setResult("nan");
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    setFile(null);
    setPreview(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="app">
      <header className="hero fade-in">
        <div className="hero-inner fade-in">
          <div className="headline fade-in">
            <h1>
              Handwritten <span className="muted">Number Identifier</span>
            </h1>
            <p>
              Upload a photo of a handwritten digit and the model will attempt
              to identify it.
            </p>

            <div className="controls">
              <button
                className="btn btn-choose"
                onClick={() => inputRef.current?.click()}
                aria-label="Choose image"
              >
                Choose Image
              </button>

              <button
                onClick={upload}
                disabled={!file || loading}
                className="btn btn-primary"
                aria-label="Identify number"
              >
                {loading ? "Identifying..." : "Identify Number"}
              </button>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="file-input"
            />

            {result !== null && (
              <div
                className={`result-panel fade-in ${
                  result === "Number not detected" ? "no-detect" : "detect"
                }`}
                role="status"
                aria-live="polite"
              >
                <div className="result-left">
                  <div className="result-label">Detected</div>
                  <div className="result-value">{result}</div>
                </div>
              </div>
            )}
          </div>

          <div className="card fade-in">
            <div className="preview-area">
              {preview ? (
                <img src={preview} alt="preview" className="preview-img" />
              ) : (
                <div className="preview-empty">
                  No image selected
                  <div className="tip">Upload a clear handwritten digit</div>
                </div>
              )}
            </div>

            <div className="preview-meta">
              <div className="file-name">{file ? file.name : ""}</div>

              <div className="preview-buttons">
                <button
                  onClick={clearAll}
                  className="small-btn blue"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}