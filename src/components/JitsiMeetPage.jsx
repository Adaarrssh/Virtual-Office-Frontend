import { useEffect } from "react";
import { useParams } from "react-router-dom";

const JitsiMeetPage = () => {
  const { roomId } = useParams();

  useEffect(() => {
    const domain = "meet.jit.si";
    console.log("Room ID:", roomId);
    console.log("Jitsi API:", window.JitsiMeetExternalAPI);
    const options = {
      roomName: roomId,
      width: "100%",
      height: 600,
      parentNode: document.getElementById("jitsi-container"),
    };

    if (!window.JitsiMeetExternalAPI) {
      console.error("Jitsi API failed to load");
      return;
    }

    const api = new window.JitsiMeetExternalAPI(domain, options);

    return () => api.dispose();
  }, [roomId]);

  return <div id="jitsi-container" />;
};

export default JitsiMeetPage;
