import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/grocery (fetch all lists with items)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const lists = await prisma.groceryList.findMany({
      where: { userId },
      include: {
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(lists);
  } catch (err) {
    console.error("Grocery GET error:", err);
    return NextResponse.json({ error: "Failed to fetch grocery lists" }, { status: 500 });
  }
}

// POST /api/grocery (generate list from planner range)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { startDate, endDate } = await req.json();

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Missing date range" }, { status: 400 });
    }

    // 1. Fetch planned meals in date range
    const planned = await prisma.plannedMeal.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      include: {
        recipe: {
          include: {
            ingredients: {
              include: {
                ingredient: true,
              },
            },
          },
        },
      },
    });

    // 2. Aggregate ingredients
    const itemsMap: Record<
      string,
      { name: string; amount: number; unit: string; aisle: string }
    > = {};

    planned.forEach((pm) => {
      if (pm.recipe && pm.recipe.ingredients) {
        pm.recipe.ingredients.forEach((ri) => {
          const key = `${ri.ingredient.name.trim().toLowerCase()}-${ri.unit.trim().toLowerCase()}`;
          if (itemsMap[key]) {
            itemsMap[key].amount += ri.amount * pm.servings;
          } else {
            itemsMap[key] = {
              name: ri.ingredient.name,
              amount: ri.amount * pm.servings,
              unit: ri.unit,
              aisle: ri.ingredient.aisle || "Other",
            };
          }
        });
      }
    });

    const listItems = Object.values(itemsMap);

    if (listItems.length === 0) {
      return NextResponse.json(
        { error: "No ingredients to generate. Please add meals to your planner first." },
        { status: 400 }
      );
    }

    // 3. Create GroceryList & GroceryItems in transaction
    const newList = await prisma.$transaction(async (tx) => {
      const gl = await tx.groceryList.create({
        data: {
          userId,
          name: `Grocery List (${startDate} to ${endDate})`,
          startDate,
          endDate,
        },
      });

      for (const item of listItems) {
        await tx.groceryItem.create({
          data: {
            listId: gl.id,
            name: item.name,
            amount: Number(item.amount.toFixed(1)) || 1,
            unit: item.unit,
            aisle: item.aisle,
            checked: false,
          },
        });
      }

      return tx.groceryList.findUnique({
        where: { id: gl.id },
        include: { items: true },
      });
    });

    return NextResponse.json(newList, { status: 201 });
  } catch (err) {
    console.error("Grocery POST error:", err);
    return NextResponse.json({ error: "Failed to generate grocery list" }, { status: 500 });
  }
}

// PUT /api/grocery (toggle item checked)
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { itemId } = await req.json();

    if (!itemId) {
      return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
    }

    // Verify item belongs to user
    const item = await prisma.groceryItem.findUnique({
      where: { id: itemId },
      include: { list: true },
    });

    if (!item || item.list.userId !== userId) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const updated = await prisma.groceryItem.update({
      where: { id: itemId },
      data: {
        checked: !item.checked,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Grocery PUT error:", err);
    return NextResponse.json({ error: "Failed to toggle grocery item" }, { status: 500 });
  }
}

// DELETE /api/grocery?listId=
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(req.url);
    const listId = searchParams.get("listId");

    if (!listId) {
      return NextResponse.json({ error: "Missing listId" }, { status: 400 });
    }

    const list = await prisma.groceryList.findUnique({
      where: { id: listId },
    });

    if (!list || list.userId !== userId) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    // Delete list (cascade deletes items)
    await prisma.groceryList.delete({
      where: { id: listId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Grocery DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete grocery list" }, { status: 500 });
  }
}
