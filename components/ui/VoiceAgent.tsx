"use client";

import { CloseIcon } from "@/components/CloseIcon";
import { NoAgentNotification } from "@/components/NoAgentNotification";
import TranscriptionView from "@/components/TranscriptionView";
import {
  BarVisualizer,
  DisconnectButton,
  RoomAudioRenderer,
  RoomContext,
  VideoTrack,
  VoiceAssistantControlBar,
  useVoiceAssistant,
} from "@livekit/components-react";
import { AnimatePresence, motion } from "framer-motion";
import { Room, RoomEvent } from "livekit-client";
import { useCallback, useEffect, useState } from "react";
import { fetchApi } from "@/lib/api-client";
import { RpcError, RpcInvocationData } from "livekit-client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Mic } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export default function VoiceAgent() {
  const [room] = useState(new Room());

  const router = useRouter();

  const { user } = useAuth();

  const role = user?.role;

  console.log("role", role);

  const onConnectButtonClicked = useCallback(async () => {
    // Generate room connection details, including:
    //   - A random Room name
    //   - A random Participant name
    //   - An Access Token to permit the participant to join the room
    //   - The URL of the LiveKit server to connect to
    //
    // In real-world application, you would likely allow the user to specify their
    // own participant name, and possibly to choose from existing rooms to join.

    const connectionDetailsData = await fetchApi("/api/v1/livekit/token", {
      method: "POST",
      body: {
        room: uuidv4(),
        participant: user?.full_name || "user",
      },
    });
    // const connectionDetailsData: ConnectionDetails = await response.json();

    await room.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, connectionDetailsData.token);
    await room.localParticipant.setMicrophoneEnabled(true);

    room.localParticipant.registerRpcMethod("navigate_to_page", (data: RpcInvocationData) => {
      const payload = JSON.parse(data.payload);

      console.log("payload", payload);

      if (payload.page_name === "home") {
        if (role === "merchant") {
          router.push("/merchant/dashboard");
        } else if (role === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else if (payload.page_name === "products") {
        console.log("products", role, role === "admin");
        if (role === "merchant") {
          router.push("/merchant/products");
        } else if (role === "admin") {
          router.push("/admin/products");
        } else {
          router.push("/products");
        }
      } else if (payload.page_name === "cart") {
        if (role === "user") {
          router.push("/cart");
        } else {
          throw new RpcError(1, "Only customer can access cart");
        }
      } else if (payload.page_name === "wishlist") {
        if (role === "user") {
          router.push("/wishlist");
        } else {
          throw new RpcError(1, "Only customer can access wishlist");
        }
      } else if (payload.page_name === "orders") {
        if (role === "merchant") {
          router.push("/merchant/orders");
        } else if (role === "admin") {
          router.push("/admin/orders");
        } else {
          console.log("orders");
          router.push("/orders");
        }
      }
      return Promise.resolve("successfull navigation");
    });

    room.localParticipant.registerRpcMethod("search_product", (data: RpcInvocationData) => {
      const payload = JSON.parse(data.payload);

      console.log("payload", payload);

      router.replace(`/products?search=${payload.product_name}`);

      return Promise.resolve("successfull search");
    });
  }, [room, router, user?.full_name, role]);

  useEffect(() => {
    room.on(RoomEvent.MediaDevicesError, onDeviceFailure);

    return () => {
      room.off(RoomEvent.MediaDevicesError, onDeviceFailure);
    };
  }, [room]);

  return (
    <RoomContext.Provider value={room}>
      <div className=" fixed bottom-8 right-8 z-[9999]">
        <SimpleVoiceAssistant onConnectButtonClicked={onConnectButtonClicked} />
      </div>
    </RoomContext.Provider>
  );
}

function SimpleVoiceAssistant(props: { onConnectButtonClicked: () => void }) {
  const { state: agentState } = useVoiceAssistant();

  return (
    <>
      <AnimatePresence mode="wait">
        {agentState === "disconnected" ? (
          <motion.div
            key="disconnected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="grid items-center justify-center h-full"
          >
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="uppercase  p-3  bg-black text-white rounded-full"
              onClick={() => props.onConnectButtonClicked()}
            >
              <Mic size={24} />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="connected"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="flex flex-col items-center gap-4 h-full bg-white max-w-[512px] w-[90vw] mx-auto  max-h-[90vh] rounded-lg shadow"
          >
            {/* <AgentVisualizer /> */}
            <div className="flex-1 w-full">
              <TranscriptionView />
            </div>
            <div className="w-full">
              <ControlBar onConnectButtonClicked={props.onConnectButtonClicked} />
            </div>
            <RoomAudioRenderer />
            <NoAgentNotification state={agentState} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function AgentVisualizer() {
  const { state: agentState, videoTrack, audioTrack } = useVoiceAssistant();

  if (videoTrack) {
    return (
      <div className="h-[512px] w-[512px] rounded-lg overflow-hidden">
        <VideoTrack trackRef={videoTrack} />
      </div>
    );
  }
  return (
    <div className="h-[100px] w-full">
      <BarVisualizer
        state={agentState}
        barCount={5}
        trackRef={audioTrack}
        className="agent-visualizer"
        options={{ minHeight: 24 }}
      />
    </div>
  );
}

function ControlBar(props: { onConnectButtonClicked: () => void }) {
  const { state: agentState } = useVoiceAssistant();

  return (
    <div className="relative h-[60px]">
      <AnimatePresence>
        {agentState === "disconnected" && (
          <motion.button
            initial={{ opacity: 0, top: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, top: "-10px" }}
            transition={{ duration: 1, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="uppercase absolute left-1/2 -translate-x-1/2 px-4 py-2 bg-white text-black rounded-md"
            onClick={() => props.onConnectButtonClicked()}
          >
            Start a conversation
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {agentState !== "disconnected" && agentState !== "connecting" && (
          <motion.div
            initial={{ opacity: 0, top: "10px" }}
            animate={{ opacity: 1, top: 0 }}
            exit={{ opacity: 0, top: "-10px" }}
            transition={{ duration: 0.4, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="flex h-8 absolute left-1/2 -translate-x-1/2  justify-center"
          >
            <VoiceAssistantControlBar controls={{ leave: false }} />
            <DisconnectButton>
              <CloseIcon />
            </DisconnectButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function onDeviceFailure(error: Error) {
  console.error(error);
  alert(
    "Error acquiring camera or microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab"
  );
}
