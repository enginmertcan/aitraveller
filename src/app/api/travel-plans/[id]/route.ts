import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const travelPlan = await prisma.travelPlan.findUnique({
      where: {
        id: params.id,
        userId,
      },
      include: {
        activities: true,
      },
    });

    if (!travelPlan) {
      return new NextResponse("Travel plan not found", { status: 404 });
    }

    // Format the data to match the TravelPlan type
    const formattedPlan = {
      ...travelPlan,
      activities: travelPlan.activities.map(a => a.name),
    };

    return NextResponse.json(formattedPlan);
  } catch (error) {
    console.error("[TRAVEL_PLAN_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 