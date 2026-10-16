import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import User from "@/model/user";

export async function POST(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "User not authenticated",
      },
      {
        status: 401,
      },
    );
  }

  const userId = user?._id;
  if (!userId) {
    return Response.json(
      { success: false, message: "User ID not found" },
      { status: 401 },
    );
  }

  try {
    const { acceptMessages } = await request.json();
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isAcceptingMessages: acceptMessages },
      { new: true },
    );

    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "Failed to update user status to accept message",
        },
        { status: 401 },
      );
    }
    return Response.json(
      {
        success: true,
        message: "User accept status updated",
        updatedUser,
      },
      { status: 201 },
    );
  } catch {
    return Response.json(
      {
        success: false,
        message: "Failed to update user status to accept messages",
      },
      {
        status: 500,
      },
    );
  }
}

export async function GET(request: Request) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!session || !session.user) {
      return Response.json(
        {
          success: false,
          message: "User not authenticated",
        },
        {
          status: 401,
        },
      );
    }

    const userId = user?._id;
    const foundUser = await User.findById(userId);

    if (!foundUser) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    return Response.json(
      {
        success: true,
        isAcceptingMessages: foundUser.isAcceptingMessages,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log("Status fetching error", error);
    return Response.json(
      {
        success: false,
        message: "Error in getting in message accepting status",
      },
      {
        status: 500,
      },
    );
  }
}
