let peerConnection;
const config = {
    iceServers: [{
            "urls": "stun:stun.l.google.com:19302",
        },
        // { 
        //   "urls": "turn:TURN_IP?transport=tcp",
        //   "username": "TURN_USERNAME",
        //   "credential": "TURN_CREDENTIALS"
        // }
    ]
};

const socket = io.connect(window.location.origin);
const video = document.querySelector("video");
const enableAudioButton = document.querySelector("#enable-audio");
let audioMuted = true;
enableAudioButton.addEventListener("click", toggleAudio)

socket.on("offer", (id, description) => {
    peerConnection = new RTCPeerConnection(config);
    peerConnection
        .setRemoteDescription(description)
        .then(() => peerConnection.createAnswer())
        .then(sdp => peerConnection.setLocalDescription(sdp))
        .then(() => {
            socket.emit("answer", id, peerConnection.localDescription);
        });
    peerConnection.ontrack = event => {
        video.srcObject = event.streams[0];
    };
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            socket.emit("candidate", id, event.candidate);
        }
    };
});


socket.on("candidate", (id, candidate) => {
    peerConnection
        .addIceCandidate(new RTCIceCandidate(candidate))
        .catch(e => console.error(e));
});

socket.on("connect", () => {
    socket.emit("watcher");
});

socket.on("broadcaster", () => {
    socket.emit("watcher");
});

window.onunload = window.onbeforeunload = () => {
    socket.close();
    peerConnection.close();
};

function toggleAudio() {
    console.log("Toggling audio");
    if (audioMuted === true) {
        document.querySelector("#enable-audio img").src = "./img/audio.png";
        video.muted = false;
        audioMuted = false;
    } else {
        document.querySelector("#enable-audio img").src = "./img/mute.png";
        video.muted = true;
        audioMuted = true;
    }

}