import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const username = String(body.username || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!name || !email || !username || !password) {
      return NextResponse.json(
        {
          message: "All fields are required.",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          message: "Password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    const existingEmail = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email);

    if (existingEmail) {
      return NextResponse.json(
        {
          message: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    const existingUsername = db
      .prepare("SELECT id FROM users WHERE username = ?")
      .get(username);

    if (existingUsername) {
      return NextResponse.json(
        {
          message: "That username is already taken.",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = db
      .prepare(
        `
          INSERT INTO users (
            name,
            username,
            email,
            password
          )
          VALUES (?, ?, ?, ?)
        `
      )
      .run(
        name,
        username,
        email,
        hashedPassword
      );

    const userId = Number(result.lastInsertRowid);

    await createSession(userId);

    return NextResponse.json(
      {
        message: "Account created successfully.",
        user: {
          id: userId,
          name,
          username,
          email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong while creating the account.",
      },
      { status: 500 }
    );
  }
}