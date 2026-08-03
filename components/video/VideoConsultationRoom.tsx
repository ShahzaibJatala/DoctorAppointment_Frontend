"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { io, Socket } from "socket.io-client";
import {
  BellRing,
  Camera,
  CameraOff,
  Loader2,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Play,
  RotateCcw,
  Video,
  X,
} from "lucide-react";
import { getToken } from "@/app/actions/token";

type Props = {
  appointmentId: string;
  role: "doctor" | "patient";
  otherPartyName: string;
  consultationMethod?: string;
  ringingAt?: string;
  compact?: boolean;
};

type CallStatus = "scheduled" | "ringing" | "active" | "paused" | "completed";

const RINGING_TIMEOUT_MS = 45_000;

function getRingingDeadline(ringingAt?: string) {
  const parsed = ringingAt ? new Date(ringingAt).getTime() : Number.NaN;
  return (Number.isFinite(parsed) ? parsed : Date.now()) + RINGING_TIMEOUT_MS;
}

export default function VideoConsultationRoom({
  appointmentId,
  role,
  otherPartyName,
  consultationMethod = "platform",
  ringingAt: initialRingingAt,
  compact = false,
}: Props) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<CallStatus>("scheduled");
  const [isOpen, setIsOpen] = useState(false);
  const [isForeground, setIsForeground] = useState(false);
  const [incoming, setIncoming] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [endsAt, setEndsAt] = useState<Date | null>(null);
  const [remaining, setRemaining] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [ringingDeadline, setRingingDeadline] = useState<number | null>(() =>
    initialRingingAt ? getRingingDeadline(initialRingingAt) : null,
  );
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");
  const [endedReason, setEndedReason] = useState("");
  const [pausedBy, setPausedBy] = useState<string | null>(null);
  const [resumeRequested, setResumeRequested] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [error, setError] = useState("");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const statusRef = useRef<CallStatus>("scheduled");
  const timeoutSignalSentRef = useRef(false);
  const startRecordingRef = useRef<() => void>(() => undefined);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingCleanupRef = useRef<(() => Promise<void>) | null>(null);
  const negotiationIdRef = useRef<string | null>(null);
  const offerInProgressRef = useRef(false);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const signalQueueRef = useRef<Promise<void>>(Promise.resolve());

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "";

  const claimForeground = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent("medibook:active-video-call", {
        detail: { appointmentId },
      }),
    );
  }, [appointmentId]);

  useEffect(() => {
    if (role !== "patient") return;
    const handleIncomingCall = (event: Event) => {
      const incomingEvent = event as CustomEvent<{
        appointmentId: string;
        durationMs?: number;
        ringingAt?: string;
      }>;
      if (incomingEvent.detail?.appointmentId !== appointmentId) return;
      incomingEvent.preventDefault();
      claimForeground();
      setIncoming(true);
      statusRef.current = "ringing";
      setStatus("ringing");
      setEndsAt(null);
      const deadline = getRingingDeadline(incomingEvent.detail.ringingAt);
      setRingingDeadline(deadline);
      setRemainingSeconds(
        Math.max(
          0,
          Math.ceil((deadline - Date.now()) / 1000),
        ),
      );
      setIsOpen(true);
    };
    window.addEventListener("medibook:incoming-video-call", handleIncomingCall);
    return () =>
      window.removeEventListener(
        "medibook:incoming-video-call",
        handleIncomingCall,
      );
  }, [appointmentId, claimForeground, role]);

  useEffect(() => {
    const handleForegroundCall = (event: Event) => {
      const activeAppointmentId = (
        event as CustomEvent<{ appointmentId: string }>
      ).detail?.appointmentId;
      setIsForeground(activeAppointmentId === appointmentId);
    };
    window.addEventListener("medibook:active-video-call", handleForegroundCall);
    return () =>
      window.removeEventListener(
        "medibook:active-video-call",
        handleForegroundCall,
      );
  }, [appointmentId]);

  const ensureMedia = useCallback(async () => {
    const existing = localStreamRef.current;
    const hasLiveVideo = existing
      ?.getVideoTracks()
      .some((track) => track.readyState === "live");
    const hasLiveAudio = existing
      ?.getAudioTracks()
      .some((track) => track.readyState === "live");
    if (existing && hasLiveVideo && hasLiveAudio) return existing;

    existing?.getTracks().forEach((track) => track.stop());
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error(
        "Camera and microphone are not supported in this browser.",
      );
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (!stream.getVideoTracks().length || !stream.getAudioTracks().length) {
      stream.getTracks().forEach((track) => track.stop());
      throw new Error("Both camera and microphone access are required.");
    }
    stream.getTracks().forEach((track) => {
      track.enabled = true;
    });
    localStreamRef.current = stream;
    setCameraEnabled(true);
    setMicEnabled(true);
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  }, []);

  const ensurePeer = useCallback(async () => {
    if (peerRef.current) return peerRef.current;
    const stream = await ensureMedia();
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    peer.onicecandidate = (event) => {
      if (event.candidate && negotiationIdRef.current) {
        socketRef.current?.emit("webrtc-signal", {
          appointmentId,
          signal: {
            candidate: event.candidate.toJSON(),
            negotiationId: negotiationIdRef.current,
          },
        });
      }
    };
    peer.ontrack = (event) => {
      const remoteStream = event.streams[0];
      remoteStreamRef.current = remoteStream;
      if (remoteVideoRef.current)
        remoteVideoRef.current.srcObject = remoteStream;
      window.setTimeout(() => startRecordingRef.current(), 500);
    };
    peerRef.current = peer;
    return peer;
  }, [appointmentId, ensureMedia]);

  const resetPeer = useCallback(() => {
    peerRef.current?.close();
    peerRef.current = null;
    negotiationIdRef.current = null;
    offerInProgressRef.current = false;
    pendingCandidatesRef.current = [];
    remoteStreamRef.current = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  }, []);

  const sendOffer = useCallback(async () => {
    if (
      role !== "doctor" ||
      offerInProgressRef.current ||
      negotiationIdRef.current
    )
      return;
    const peer = await ensurePeer();
    if (
      peer.signalingState !== "stable" ||
      peer.connectionState === "connected"
    )
      return;

    offerInProgressRef.current = true;
    const negotiationId =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
    negotiationIdRef.current = negotiationId;
    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socketRef.current?.emit("webrtc-signal", {
        appointmentId,
        signal: { description: peer.localDescription, negotiationId },
      });
    } catch (offerError) {
      negotiationIdRef.current = null;
      throw offerError;
    } finally {
      offerInProgressRef.current = false;
    }
  }, [appointmentId, ensurePeer, role]);

  const uploadRecording = useCallback(
    async (blob: Blob) => {
      if (!blob.size) return;
      setIsUploading(true);
      try {
        const token = await getToken();
        const form = new FormData();
        form.append(
          "file",
          new File([blob], `consultation-${appointmentId}.webm`, {
            type: "video/webm",
          }),
        );
        const response = await fetch(
          `${serverUrl}/doctor/video-recording/${appointmentId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${String(token || "")
                .replace(/"/g, "")
                .trim()}`,
            },
            body: form,
          },
        );
        const result = await response.json().catch(() => null);
        if (!response.ok) {
          const message = Array.isArray(result?.message)
            ? result.message.join(", ")
            : result?.message;
          throw new Error(message || "Could not save consultation recording.");
        }
        window.dispatchEvent(
          new CustomEvent("medibook:recording-saved", {
            detail: { appointmentId, url: result.url },
          }),
        );
        socketRef.current?.emit("recording-ready", {
          appointmentId,
          url: result.url,
        });
      } catch (uploadError: any) {
        setError(uploadError.message);
      } finally {
        setIsUploading(false);
      }
    },
    [appointmentId, serverUrl],
  );

  const startRecording = useCallback(() => {
    if (
      role !== "doctor" ||
      recorderRef.current ||
      !localVideoRef.current ||
      !remoteVideoRef.current ||
      !localStreamRef.current ||
      !remoteStreamRef.current
    )
      return;
    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 720;
    const context = canvas.getContext("2d");
    if (!context) return;
    let animationFrame = 0;
    const draw = () => {
      const remote = remoteVideoRef.current;
      const local = localVideoRef.current;
      context.fillStyle = "#0f172a";
      context.fillRect(0, 0, canvas.width, canvas.height);
      if (remote?.readyState && remote.videoWidth)
        context.drawImage(remote, 0, 0, canvas.width, canvas.height);
      if (local?.readyState && local.videoWidth) {
        context.drawImage(
          local,
          canvas.width - 330,
          canvas.height - 205,
          300,
          175,
        );
      }
      animationFrame = requestAnimationFrame(draw);
    };
    draw();

    const recordedStream = canvas.captureStream(24);
    const audioContext = new AudioContext();
    if (audioContext.state === "suspended")
      void audioContext.resume().catch(() => undefined);
    const destination = audioContext.createMediaStreamDestination();
    [localStreamRef.current, remoteStreamRef.current].forEach((stream) => {
      if (stream?.getAudioTracks().length)
        audioContext.createMediaStreamSource(stream).connect(destination);
    });
    destination.stream
      .getAudioTracks()
      .forEach((track) => recordedStream.addTrack(track));
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
      ? "video/webm;codecs=vp8,opus"
      : "video/webm";
    const recorder = new MediaRecorder(recordedStream, {
      mimeType,
      videoBitsPerSecond: 700_000,
    });
    recordingChunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size) recordingChunksRef.current.push(event.data);
    };
    let resolveStopped: () => void = () => undefined;
    const stoppedAndUploaded = new Promise<void>((resolve) => {
      resolveStopped = resolve;
    });
    recorder.onstop = () => {
      const blob = new Blob(recordingChunksRef.current, { type: mimeType });
      recordingChunksRef.current = [];
      cancelAnimationFrame(animationFrame);
      recordedStream.getTracks().forEach((track) => track.stop());
      void audioContext.close();
      void uploadRecording(blob).finally(resolveStopped);
    };
    recorder.start(1000);
    recorderRef.current = recorder;
    recordingCleanupRef.current = async () => {
      if (recorder.state !== "inactive") {
        try {
          recorder.requestData();
        } catch {
          // The recorder may already be stopping.
        }
        recorder.stop();
      }
      await stoppedAndUploaded;
      if (recorderRef.current === recorder) recorderRef.current = null;
    };
  }, [role, uploadRecording]);

  startRecordingRef.current = startRecording;

  const endLocalMedia = useCallback(async () => {
    const finishRecording = recordingCleanupRef.current?.();
    recordingCleanupRef.current = null;
    peerRef.current?.close();
    peerRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    await finishRecording;
  }, []);

  useEffect(() => {
    let liveSocket: Socket | undefined;
    getToken().then((token) => {
      liveSocket = io(`${serverUrl}/video-calls`, {
        auth: {
          token: String(token || "")
            .replace(/"/g, "")
            .trim(),
        },
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 500,
        reconnectionDelayMax: 5_000,
        transports: ["websocket", "polling"],
        tryAllTransports: true,
      });
      setSocket(liveSocket);
      socketRef.current = liveSocket;
      liveSocket.on("connect", () => {
        liveSocket?.emit("join-call", { appointmentId });
      });
      liveSocket.on("call-state", (state) => {
        const nextStatus = state.status || "scheduled";
        statusRef.current = nextStatus;
        setStatus(nextStatus);
        setRingingDeadline(
          nextStatus === "ringing" ? getRingingDeadline(state.ringingAt) : null,
        );
        setPausedBy(state.pausedBy || null);
        setRemainingSeconds(
          Math.max(0, Math.ceil(Number(state.remainingMs || 0) / 1000)),
        );
        setEndsAt(state.endsAt ? new Date(state.endsAt) : null);

        if (nextStatus === "scheduled") {
          setIncoming(false);
          setIsOpen(false);
          setRemainingSeconds(0);
          setRemaining("");
          void endLocalMedia();
        }

        if (nextStatus === "active" || nextStatus === "paused") {
          claimForeground();
          setIncoming(false);
          setIsOpen(true);
          ensurePeer()
            .then(() => {
              if (nextStatus === "paused" && state.pausedBy === role) {
                localStreamRef.current?.getVideoTracks().forEach((track) => {
                  track.enabled = false;
                });
                setCameraEnabled(false);
              }
              if (role === "doctor") {
                window.setTimeout(() => {
                  sendOffer()
                    .then(() => window.setTimeout(startRecording, 1200))
                    .catch((reconnectError) =>
                      setError(
                        reconnectError.message ||
                          "Could not reconnect the video call.",
                      ),
                    );
                }, 300);
              }
            })
            .catch((mediaError) =>
              setError(
                mediaError.message ||
                  "Camera and microphone permission is required.",
              ),
            );
        }

        if (role === "patient" && nextStatus === "ringing") {
          claimForeground();
          setIncoming(true);
          setIsOpen(true);
          if (
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            new Notification("Incoming video consultation", {
              body: otherPartyName + " is waiting for you to accept the call.",
              tag: "video-call-" + appointmentId,
            });
          }
        }
      });
      liveSocket.on("incoming-call", (payload) => {
        if (payload?.appointmentId !== appointmentId) return;
        claimForeground();
        setIncoming(true);
        statusRef.current = "ringing";
        setStatus("ringing");
        setEndsAt(null);
        const deadline = getRingingDeadline(payload.ringingAt);
        setRingingDeadline(deadline);
        setRemainingSeconds(
          Math.max(0, Math.ceil((deadline - Date.now()) / 1000)),
        );
        if (role === "patient") {
          setIsOpen(true);
          if (
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            new Notification("Incoming video consultation", {
              body: otherPartyName + " is calling. Open MediBook to accept.",
              tag: "video-call-" + appointmentId,
            });
          }
        }
      });
      liveSocket.on("call-accepted", async (payload) => {
        window.dispatchEvent(
          new CustomEvent("medibook:video-call-accepted", {
            detail: { appointmentId },
          }),
        );
        claimForeground();
        setIncoming(false);
        statusRef.current = "active";
        setStatus("active");
        setEndsAt(payload.endsAt ? new Date(payload.endsAt) : null);
        setRemainingSeconds(
          Math.max(0, Math.ceil(Number(payload.remainingMs || 0) / 1000)),
        );
        setIsOpen(true);
        if (role === "doctor") {
          await sendOffer();
          window.setTimeout(startRecording, 1200);
        }
      });
      liveSocket.on("webrtc-signal", ({ signal }) => {
        signalQueueRef.current = signalQueueRef.current
          .then(async () => {
            let peer = await ensurePeer();
            const negotiationId = String(signal.negotiationId || "legacy");

            if (signal.description?.type === "offer") {
              if (role !== "patient") return;

              if (
                negotiationIdRef.current === negotiationId &&
                peer.localDescription?.type === "answer"
              ) {
                liveSocket?.emit("webrtc-signal", {
                  appointmentId,
                  signal: { description: peer.localDescription, negotiationId },
                });
                return;
              }
              if (peer.signalingState !== "stable") {
                resetPeer();
                peer = await ensurePeer();
              }

              negotiationIdRef.current = negotiationId;
              await peer.setRemoteDescription(signal.description);
              const answer = await peer.createAnswer();
              await peer.setLocalDescription(answer);
              for (const candidate of pendingCandidatesRef.current.splice(0)) {
                await peer.addIceCandidate(candidate).catch(() => undefined);
              }
              liveSocket?.emit("webrtc-signal", {
                appointmentId,
                signal: { description: peer.localDescription, negotiationId },
              });
              return;
            }

            if (signal.description?.type === "answer") {
              if (
                role !== "doctor" ||
                negotiationIdRef.current !== negotiationId ||
                peer.signalingState !== "have-local-offer"
              ) {
                return;
              }
              await peer.setRemoteDescription(signal.description);
              for (const candidate of pendingCandidatesRef.current.splice(0)) {
                await peer.addIceCandidate(candidate).catch(() => undefined);
              }
              return;
            }

            if (signal.candidate) {
              if (
                negotiationIdRef.current &&
                negotiationIdRef.current !== negotiationId
              )
                return;
              if (!peer.remoteDescription) {
                pendingCandidatesRef.current.push(signal.candidate);
              } else {
                await peer
                  .addIceCandidate(signal.candidate)
                  .catch(() => undefined);
              }
            }
          })
          .catch((signalError: any) => {
            setError(
              signalError.message || "Could not reconnect the video call.",
            );
          });
      });
      liveSocket.on("participant-disconnected", () => {
        resetPeer();
      });
      liveSocket.on("participant-joined", ({ role: joinedRole }) => {
        if (
          role === "doctor" &&
          joinedRole === "patient" &&
          (statusRef.current === "active" || statusRef.current === "paused")
        ) {
          window.setTimeout(() => {
            sendOffer()
              .then(() => window.setTimeout(startRecording, 1200))
              .catch((reconnectError) =>
                setError(
                  reconnectError.message ||
                    "Could not reconnect the patient video.",
                ),
              );
          }, 300);
        }
      });
      liveSocket.on("call-paused", ({ pausedBy: who, remainingMs }) => {
        statusRef.current = "paused";
        setStatus("paused");
        setPausedBy(who);
        setEndsAt(null);
        setRemainingSeconds(
          Math.max(0, Math.ceil(Number(remainingMs || 0) / 1000)),
        );
        const recorder = recorderRef.current;
        if (role === "doctor" && recorder?.state === "recording") {
          try {
            recorder.requestData();
          } catch {
            // The recorder may already be changing state.
          }
          recorder.pause();
        }
      });
      liveSocket.on("resume-requested", () => setResumeRequested(true));
      liveSocket.on(
        "call-resumed",
        ({ endsAt: resumedEndsAt, remainingMs }) => {
          statusRef.current = "active";
          setStatus("active");
          setEndsAt(resumedEndsAt ? new Date(resumedEndsAt) : null);
          setRemainingSeconds(
            Math.max(0, Math.ceil(Number(remainingMs || 0) / 1000)),
          );
          setPausedBy(null);
          setResumeRequested(false);
          const recorder = recorderRef.current;
          if (role === "doctor" && recorder?.state === "paused")
            recorder.resume();
        },
      );
      liveSocket.on("call-missed", ({ message }) => {
        statusRef.current = "scheduled";
        setStatus("scheduled");
        setIncoming(false);
        setIsOpen(false);
        setEndsAt(null);
        setRemainingSeconds(0);
        setRemaining("");
        setError(
          message ||
            "The call invitation expired. Wait for the doctor to call again.",
        );
        endLocalMedia();
      });
      liveSocket.on("call-ended", async ({ reason }) => {
        claimForeground();
        statusRef.current = "completed";
        setStatus("completed");
        setIncoming(false);
        setEndsAt(null);
        setRemainingSeconds(0);
        setRemaining("00:00");
        setEndedReason(
          reason === "time-completed"
            ? "Consultation time completed."
            : "The doctor ended the consultation.",
        );
        setIsOpen(true);
        if (
          role === "patient" &&
          typeof Notification !== "undefined" &&
          Notification.permission === "granted"
        ) {
          new Notification("Video consultation ended", {
            body:
              reason === "time-completed"
                ? "Your consultation time has completed."
                : "The doctor ended the consultation.",
            tag: "video-call-ended-" + appointmentId,
          });
        }
        await endLocalMedia();
      });
      liveSocket.on(
        "recording-ready",
        ({ appointmentId: recordedAppointmentId, url }) => {
          window.dispatchEvent(
            new CustomEvent("medibook:recording-saved", {
              detail: { appointmentId: recordedAppointmentId, url },
            }),
          );
        },
      );
      liveSocket.on("call-error", (payload) => setError(payload.message));
    });
    return () => {
      liveSocket?.disconnect();
      socketRef.current = null;
      endLocalMedia();
    };
  }, [
    appointmentId,
    claimForeground,
    endLocalMedia,
    ensurePeer,
    resetPeer,
    role,
    sendOffer,
    serverUrl,
    startRecording,
  ]);

  useEffect(() => {
    if (!isOpen || !isForeground) return;
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
      localVideoRef.current.play().catch(() => undefined);
    }
    if (remoteVideoRef.current && remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
      remoteVideoRef.current.play().catch(() => undefined);
    }
  }, [isForeground, isOpen, status]);

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (status !== "ringing" || ringingDeadline === null) return;

    const expire = () => {
      if (statusRef.current !== "ringing") return;
      statusRef.current = "scheduled";
      setStatus("scheduled");
      setIncoming(false);
      setIsOpen(false);
      setRingingDeadline(null);
      setRemainingSeconds(0);
      setRemaining("");
      void endLocalMedia();
    };
    const updateCountdown = () => {
      const seconds = Math.max(
        0,
        Math.ceil((ringingDeadline - Date.now()) / 1000),
      );
      setRemainingSeconds(seconds);
      setRemaining(
        String(Math.floor(seconds / 60)).padStart(2, "0") +
          ":" +
          String(seconds % 60).padStart(2, "0"),
      );
      if (seconds === 0) expire();
    };

    updateCountdown();
    const countdownTimer = window.setInterval(updateCountdown, 250);
    const expiryTimer = window.setTimeout(
      expire,
      Math.max(0, ringingDeadline - Date.now()),
    );
    return () => {
      window.clearInterval(countdownTimer);
      window.clearTimeout(expiryTimer);
    };
  }, [endLocalMedia, ringingDeadline, status]);

  useEffect(() => {
    const formatRemaining = (seconds: number) =>
      String(Math.floor(seconds / 60)).padStart(2, "0") +
      ":" +
      String(seconds % 60).padStart(2, "0");

    if (status === "paused" || status === "ringing") {
      setRemaining(formatRemaining(remainingSeconds));
      return;
    }
    if (status !== "active" || !endsAt) return;

    const update = () => {
      const seconds = Math.max(
        0,
        Math.ceil((endsAt.getTime() - Date.now()) / 1000),
      );
      setRemainingSeconds(seconds);
      setRemaining(formatRemaining(seconds));
      if (seconds > 0) {
        timeoutSignalSentRef.current = false;
      } else if (!timeoutSignalSentRef.current) {
        timeoutSignalSentRef.current = true;
        socketRef.current?.emit("call-time-expired", { appointmentId });
      }
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [appointmentId, endsAt, status]);

  const doctorStart = async () => {
    setIsPreparing(true);
    setError("");
    try {
      await ensureMedia();
      claimForeground();
      setIsOpen(true);
      socket?.emit("doctor-start-call", { appointmentId });
    } catch {
      setError("Camera and microphone permission is required.");
    } finally {
      setIsPreparing(false);
    }
  };

  const patientAccept = async () => {
    setIsPreparing(true);
    setError("");
    try {
      if (
        typeof Notification !== "undefined" &&
        Notification.permission === "default"
      ) {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
      }
      await ensurePeer();
      claimForeground();
      socket?.emit("patient-accept-call", { appointmentId });
    } catch {
      setError("Camera and microphone permission is required.");
    } finally {
      setIsPreparing(false);
    }
  };

  const pause = () => {
    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = false;
    });
    setCameraEnabled(false);
    socket?.emit("pause-call", { appointmentId });
  };

  const resume = () => {
    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = true;
    });
    setCameraEnabled(true);
    socket?.emit("resume-call", { appointmentId });
  };

  if (consultationMethod === "whatsapp") {
    return role === "doctor" ? (
      <span className="text-xs font-bold text-emerald-700">
        Patient selected WhatsApp
      </span>
    ) : null;
  }

  return (
    <>
      {role === "doctor" &&
        (status === "scheduled" || status === "ringing") && (
          <button
            onClick={doctorStart}
            disabled={isPreparing}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            {isPreparing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Video size={16} />
            )}{" "}
            {status === "ringing"
              ? "Call Patient Again"
              : "Start Platform Video"}
          </button>
        )}
      {role === "patient" &&
        notificationPermission !== "granted" &&
        status !== "completed" && (
          <button
            type="button"
            onClick={async () => {
              if (typeof Notification === "undefined") return;
              setNotificationPermission(await Notification.requestPermission());
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-white px-4 py-2 text-sm font-bold text-teal-700"
          >
            <BellRing size={16} /> Enable video-call notifications
          </button>
        )}
      {role === "patient" &&
        status === "active" &&
        (!isOpen || !isForeground) && (
          <button
            onClick={() => {
              claimForeground();
              setIsOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white"
          >
            <Video size={16} /> Open Video Call
          </button>
        )}

      {isOpen &&
        isForeground &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-0 backdrop-blur sm:p-3">
            <div className="relative flex h-[100dvh] w-full max-w-6xl flex-col overflow-hidden bg-slate-900 shadow-2xl sm:max-h-[850px] sm:rounded-3xl">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 text-white">
                <div>
                  <p className="font-bold">{otherPartyName}</p>
                  <p className="text-xs text-slate-400">
                    {status === "ringing"
                      ? "Calling…"
                      : status === "paused"
                        ? "Video paused"
                        : "Secure platform consultation"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-teal-300">
                    {remaining}
                  </span>
                  {status === "completed" && (
                    <button onClick={() => setIsOpen(false)}>
                      <X />
                    </button>
                  )}
                </div>
              </div>
              <div className="relative min-h-0 flex-1 bg-black">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="h-full w-full object-contain"
                />
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="absolute bottom-4 right-4 h-28 w-40 rounded-xl border-2 border-white/30 bg-slate-800 object-cover shadow-xl sm:h-40 sm:w-56"
                />
                {status === "completed" && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/95 px-6 text-center text-white">
                    <PhoneOff size={56} className="text-red-400" />
                    <h2 className="mt-5 text-2xl font-bold">Call ended</h2>
                    <p className="mt-2 text-sm text-slate-300">
                      {endedReason || "The video consultation has ended."}
                    </p>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="mt-6 rounded-xl bg-white px-6 py-2.5 font-bold text-slate-900"
                    >
                      Close
                    </button>
                  </div>
                )}
                {status === "paused" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
                    <CameraOff size={50} />
                    <p className="mt-3 text-xl font-bold">
                      {pausedBy === role
                        ? "Your video is paused"
                        : `${otherPartyName}'s video is paused`}
                    </p>
                    {pausedBy !== role && (
                      <button
                        onClick={() =>
                          socket?.emit("resume-request", { appointmentId })
                        }
                        className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-900"
                      >
                        <BellRing size={15} className="mr-2 inline" />
                        Request Resume
                      </button>
                    )}
                  </div>
                )}
                {resumeRequested && pausedBy === role && (
                  <button
                    onClick={resume}
                    className="absolute left-1/2 top-5 -translate-x-1/2 rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-slate-900 shadow"
                  >
                    <RotateCcw size={15} className="mr-2 inline" />
                    Resume requested
                  </button>
                )}
                {incoming && role === "patient" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-white">
                    <Phone className="animate-pulse text-teal-400" size={55} />
                    <h2 className="mt-5 text-2xl font-bold">
                      Incoming call from {otherPartyName}
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                      Accepting will turn on your camera and microphone.
                    </p>
                    <button
                      onClick={patientAccept}
                      disabled={isPreparing}
                      className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-7 py-3 font-bold"
                    >
                      {isPreparing ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Phone />
                      )}{" "}
                      Accept Video Call
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 border-t border-white/10 bg-slate-950 px-4 py-4">
                {(status === "active" || status === "paused") && (
                  <button
                    onClick={() => {
                      const enabled = !micEnabled;
                      localStreamRef.current
                        ?.getAudioTracks()
                        .forEach((track) => {
                          track.enabled = enabled;
                        });
                      setMicEnabled(enabled);
                    }}
                    className="rounded-full bg-white/10 p-3 text-white"
                  >
                    {micEnabled ? <Mic /> : <MicOff />}
                  </button>
                )}
                {status === "paused" && pausedBy === role ? (
                  <button
                    onClick={resume}
                    className="rounded-full bg-emerald-500 p-3 text-white"
                  >
                    <Play />
                  </button>
                ) : status === "active" ? (
                  <button
                    onClick={pause}
                    className="rounded-full bg-white/10 p-3 text-white"
                  >
                    {cameraEnabled ? <Camera /> : <CameraOff />}
                  </button>
                ) : null}
                {role === "doctor" &&
                  (status === "active" || status === "paused") && (
                    <button
                      onClick={() =>
                        socket?.emit("doctor-end-call", { appointmentId })
                      }
                      className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 font-bold text-white"
                    >
                      <PhoneOff /> End Consultation
                    </button>
                  )}
                {isUploading && (
                  <span className="inline-flex items-center gap-2 text-xs text-slate-300">
                    <Loader2 size={14} className="animate-spin" />
                    Compressing and saving recording…
                  </span>
                )}
              </div>
              {error && (
                <div className="bg-red-600 px-4 py-2 text-center text-sm text-white">
                  {error}
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
