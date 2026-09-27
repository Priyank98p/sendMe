import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user";
import bcrypt from "bcryptjs";
import { sendVerification } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();

    const existingUserverifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserverifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 },
      );
    }

    const existingUserByEmail = await UserModel.findOne({ email });

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User already exist with this email",
          },
          { status: 400 },
        );
      } else {
        const hashPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.codeExpiry = new Date(Date.now() + 3600000);

        await existingUserByEmail.save()
      }
    } else {
      const hashPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const user = new UserModel({
        username,
        email,
        password: hashPassword,
        verifyCode,
        codeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessages: true,
        messages: [],
      });

      await user.save();
    }

    const emailResponse = await sendVerification(email, username, verifyCode);

    if (!emailResponse.success) {
      return Response.json({ success: false, message: emailResponse.message });
    }

    return Response.json(
      {
        success: true,
        message: "User registered successfully, Please verify your email",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Registration error!", error);
    return Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      {
        status: 500,
      },
    );
  }
}
