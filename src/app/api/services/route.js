import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

import { NextResponse } from "next/server";
import connectionToDatabase from "@/lib/mongoose";
import Service from "@/models/Service";
import fs from "fs/promises";
import path from "path";

// Role check helper
async function requireDoctor(request) {
  const session = await getServerSession({ req: request, ...authOptions });

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (session.user.role !== "doctor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null; // allowed
}

// CREATE (POST) - doctor only
export async function POST(request) {
  const authError = await requireDoctor(request);
  if (authError) return authError;

  try {
    await connectionToDatabase();
    const formData = await request.formData();
    const file = formData.get("image");
    const title = formData.get("title");
    const desc = formData.get("desc");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public/uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadDir, file.name);
    await fs.writeFile(filePath, buffer);

    const newService = new Service({
      image: `/uploads/${file.name}`,
      title,
      desc,
    });

    await newService.save();

    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}

// READ (GET) - public
export async function GET() {
  await connectionToDatabase();
  const services = await Service.find().sort({ order: 1 });
  return NextResponse.json({ services });
}

// UPDATE (PATCH) - doctor only
export async function PATCH(request) {
  const authError = await requireDoctor(request);
  if (authError) return authError

  try {
    await connectionToDatabase();

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const id = formData.get("id");
      const title = formData.get("title");
      const desc = formData.get("desc");
      const file = formData.get("image");

      if (!id) return NextResponse.json({ error: "Missing service ID" }, { status: 400 });

      const updateData = { title, desc };

      if (file && typeof file !== "string") {
        // Save new image
        const uploadDir = path.join(process.cwd(), "public/uploads");
        await fs.mkdir(uploadDir, { recursive: true });
        const buffer = Buffer.from(await file.arrayBuffer());
        const filePath = path.join(uploadDir, file.name);
        await fs.writeFile(filePath, buffer);
        updateData.image = `/uploads/${file.name}`;

        // Delete old image
        const service = await Service.findById(id);
        if (service && service.image) {
          try {
            await fs.unlink(path.join(process.cwd(), "public", service.image));
          } catch {}
        }
      }

      const updatedService = await Service.findByIdAndUpdate(id, updateData, { new: true });
      return NextResponse.json({ message: "Service updated", service: updatedService });
    }

    // fallback if JSON
    const body = await request.json();
    const { id, title, desc } = body;
    if (!id) return NextResponse.json({ error: "Missing service ID" }, { status: 400 });

    const updatedService = await Service.findByIdAndUpdate(id, { title, desc }, { new: true });
    return NextResponse.json({ message: "Service updated", service: updatedService });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}


// DELETE - doctor only
export async function DELETE(request) {
  const authError = await requireDoctor(request);
  if (authError) return authError;

  try {
    await connectionToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing service ID" }, { status: 400 });
    }

    // Find the service in the DB
    const service = await Service.findById(id);
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Delete the image file if it exists
    const imagePath = path.join(process.cwd(), "public", service.image);
    try {
      await fs.unlink(imagePath);
      console.log("Deleted image:", imagePath);
    } catch (err) {
      console.warn("Image not found or already deleted:", err.message);
    }

    // Delete the service document
    await Service.findByIdAndDelete(id);

    return NextResponse.json({ message: "Service deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
