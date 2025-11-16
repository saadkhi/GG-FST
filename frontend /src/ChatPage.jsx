import { useState } from "react";
import axios from "axios";

export default function ChatPage() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);

  const storeId = new URLSearchParams(window.location.search).get("store_id");

  const ask = async () => {
    const form = new FormData();
    form.append("store_id", storeId);
    form.append("prompt", query);

    const res = await axios.post("http://localhost:8000/chat", form);
    setAnswer(res.data.answer);
    setSources(res.data.sources);
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Chat with Your Document</h2>

      <textarea
        rows="4"
        placeholder="Ask something…"
        onChange={(e) => setQuery(e.target.value)}
      />

      <br /><br />
      <button onClick={ask}>Ask</button>

      <h3>Answer:</h3>
      <p>{answer}</p>

      {sources.length > 0 && (
        <>
          <h4>Sources:</h4>
          <ul>
            {sources.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
