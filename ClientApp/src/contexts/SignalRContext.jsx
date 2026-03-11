import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

const SignalRContext = createContext(null);

const HUB_URL = `${process.env.REACT_APP_API_BASE_URL || "https://localhost:7107"}/chatHub`;

export const SignalRProvider = ({ children }) => {
  const connectionRef = useRef(null);
  const [connectionState, setConnectionState] = useState("Disconnected");

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => localStorage.getItem("token") || "",
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.onreconnecting(() => setConnectionState("Reconnecting"));
    connection.onreconnected(() => setConnectionState("Connected"));
    connection.onclose(() => setConnectionState("Disconnected"));

    const start = async () => {
      try {
        await connection.start();
        setConnectionState("Connected");
      } catch (err) {
        setConnectionState("Disconnected");
        // Retry after 5s if initial connection fails
        setTimeout(start, 5000);
      }
    };

    connectionRef.current = connection;
    start();

    return () => {
      connection.stop();
    };
  }, []);

  return (
    <SignalRContext.Provider
      value={{
        connection: connectionRef.current,
        connectionRef,
        connectionState,
        isConnected: connectionState === "Connected",
      }}
    >
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalR = () => {
  const ctx = useContext(SignalRContext);
  if (!ctx) throw new Error("useSignalR must be used within SignalRProvider");
  return ctx;
};
