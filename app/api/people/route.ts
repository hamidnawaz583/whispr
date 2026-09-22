import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const search = (searchParams.get("search") || "").trim();

    if (!search) {
      return NextResponse.json({
        success: true,
        users: [],
      });
    }

    const users = db
      .prepare(
        `
        SELECT
          id,
          name,
          username
        FROM users
        WHERE
          (name LIKE ? OR username LIKE ?)
          AND id != ?
        ORDER BY name ASC
        LIMIT 50
        `
      )
      .all(`%${search}%`, `%${search}%`, currentUser.id);

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("People search error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to search people.",
      },
      { status: 500 }
    );
  }
}
