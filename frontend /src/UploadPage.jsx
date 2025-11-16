import { useState } from "react";
import axios from "axios";

export default function UploadPage() {
  const [file, setFile] = useState(null);

  const upload = async () => {
    if (!file) return alert("Select a file first!");

    const form = new FormData();
    form.append("file", file);

    const res = await axios.post("http://localhost:8000/upload", form);
    const storeId = res.data.store_id;

    window.location.href = `/chat?store_id=${storeId}`;
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Upload Document</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <br /><br />
      <button onClick={upload}>Upload & Chat</button>
    </div>
  );
}
