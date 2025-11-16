import UploadPage from "./UploadPage";
import ChatPage from "./ChatPage";

export default function App() {
  const page = window.location.pathname;

  if (page === "/chat") return <ChatPage />;
  return <UploadPage />;
}
