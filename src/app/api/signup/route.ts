import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create User, default Goal, and default UserPreference in a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      // Initialize default Goals
      await tx.goal.create({
        data: {
          userId: user.id,
          calorieTarget: 2000,
          proteinTarget: 150,
          carbTarget: 250,
          fatTarget: 65,
          dietType: "balanced",
          waterTargetMl: 2500,
        },
      });

      // Initialize default Preferences
      await tx.userPreference.create({
        data: {
          userId: user.id,
          cuisines: "[]",
          allergies: "[]",
          dislikedIngredients: "[]",
          maxPrepTime: 60,
        },
      });

      return user;
    });

    return NextResponse.json({ success: true, userId: newUser.id }, { status: 201 });
  } catch (err: any) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during signup" },
      { status: 500 }
    );
  }
}
