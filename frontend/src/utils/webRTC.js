export class WebRTCConnection {
  constructor(sessionId, onLocalStream, onRemoteStream, onSignalToSend) {
    this.sessionId = sessionId;
    this.onLocalStream = onLocalStream;
    this.onRemoteStream = onRemoteStream;
    this.onSignalToSend = onSignalToSend;
    this.peerConnection = null;
    this.localStream = null;

    this.configuration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ]
    };
  }

  async initialize(video = true, audio = true) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: video,
        audio: audio
      });

      if (this.onLocalStream) {
        this.onLocalStream(this.localStream);
      }

      this.peerConnection = new RTCPeerConnection(this.configuration);

      // Add local stream tracks to connection
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.onSignalToSend({
            type: "candidate",
            candidate: event.candidate
          });
        }
      };

      // Handle remote stream tracks
      this.peerConnection.ontrack = (event) => {
        if (this.onRemoteStream && event.streams && event.streams[0]) {
          this.onRemoteStream(event.streams[0]);
        }
      };
    } catch (err) {
      console.error("Failed to initialize WebRTC streams:", err);
      throw err;
    }
  }

  async startCall() {
    if (!this.peerConnection) return;
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      this.onSignalToSend({
        type: "offer",
        sdp: this.peerConnection.localDescription
      });
    } catch (err) {
      console.error("Failed to create WebRTC offer:", err);
    }
  }

  async handleSignal(signal) {
    if (!this.peerConnection) return;

    try {
      if (signal.type === "offer") {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        this.onSignalToSend({
          type: "answer",
          sdp: this.peerConnection.localDescription
        });
      } else if (signal.type === "answer") {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
      } else if (signal.type === "candidate") {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
      }
    } catch (err) {
      console.error("Failed to handle WebRTC signal:", err);
    }
  }

  async toggleVideo(enabled) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  async toggleAudio(enabled) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  async shareScreen(onEnded) {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];

      if (this.peerConnection) {
        const senders = this.peerConnection.getSenders();
        const videoSender = senders.find((s) => s.track && s.track.kind === "video");
        if (videoSender) {
          videoSender.replaceTrack(screenTrack);
        }
      }

      screenTrack.onended = () => {
        if (this.localStream) {
          const senders = this.peerConnection.getSenders();
          const videoSender = senders.find((s) => s.track && s.track.kind === "video");
          if (videoSender) {
            videoSender.replaceTrack(this.localStream.getVideoTracks()[0]);
          }
        }
        if (onEnded) onEnded();
      };

      return screenStream;
    } catch (err) {
      console.error("Failed to start screen sharing:", err);
      throw err;
    }
  }

  close() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
    }
    if (this.peerConnection) {
      this.peerConnection.close();
    }
    this.localStream = null;
    this.peerConnection = null;
  }
}
