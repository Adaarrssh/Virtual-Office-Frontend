import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const JitsiMeetPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const domain = "meet.jit.si";
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

    api.addListener("videoConferenceLeft", () => {
      navigate("/dashboard");
    });

    return () => {
      api.dispose();
    };
  }, [roomId]);

  return <div id="jitsi-container" />;
};

export default JitsiMeetPage;
