import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/templates
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const templates = await prisma.mealTemplate.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            recipe: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(templates);
  } catch (err) {
    console.error("Templates GET error:", err);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

// POST /api/templates
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const body = await req.json();
    const { name, label, date, items } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    let templateItemsData: any[] = [];

    if (date) {
      // Fetch meals logged on this date
      const meals = await prisma.meal.findMany({
        where: { userId, date },
        include: { entries: true },
      });

      for (const meal of meals) {
        for (const entry of meal.entries) {
          templateItemsData.push({
            recipeId: entry.recipeId,
            customName: entry.customName,
            mealType: meal.mealType,
            servings: entry.servings,
            calories: entry.calories,
            protein: entry.protein,
            carbs: entry.carbs,
            fat: entry.fat,
          });
        }
      }
    } else if (items && Array.isArray(items)) {
      templateItemsData = items.map((item: any) => ({
        recipeId: item.recipeId || null,
        customName: item.customName || null,
        mealType: item.mealType || "Breakfast",
        servings: Number(item.servings) || 1,
        calories: Number(item.calories) || 0,
        protein: Number(item.protein) || 0,
        carbs: Number(item.carbs) || 0,
        fat: Number(item.fat) || 0,
      }));
    }

    const template = await prisma.mealTemplate.create({
      data: {
        userId,
        name,
        label: label || "custom",
        items: {
          create: templateItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ success: true, template });
  } catch (err) {
    console.error("Templates POST error:", err);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}

// DELETE /api/templates
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing template id" }, { status: 400 });
    }

    const template = await prisma.mealTemplate.findUnique({
      where: { id },
    });

    if (!template || template.userId !== userId) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    await prisma.mealTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Templates DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}
