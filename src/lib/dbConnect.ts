import mongoose from "mongoose";
import { DB_NAME } from "@/constants";
import dns from "node:dns";

type connectionObject = {
  isConnected?: number;
};

const connection: connectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("Already connected to DB");
    return;
  }
  try {
    const dnsServers = process.env.MONGODB_DNS_SERVERS?.split(",")
      .map((server) => server.trim())
      .filter(Boolean);

    if (dnsServers?.length) {
      dns.setServers(dnsServers);
    }

    console.log("connecting");
    const dbConnection = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`,
    );
    connection.isConnected = dbConnection.connections[0].readyState;

    console.log("Database connected successfully");
  } catch (error) {
    console.log("Database connection failed", error);
  }
}

export default dbConnect;
