import { writeFile } from "fs/promises";
import { join } from "path";

const ALLOWED_FILES = ["kpis", "pillars", "investments", "projects", "metrics"];

export async function POST(request: Request) {
  const { password, file, content } = await request.json();
  const adminPassword = process.env.ADMIN_PASSWORD || "cdmu-admin-2025";

  if (password !== adminPassword) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ALLOWED_FILES.includes(file)) {
    return Response.json({ error: "Invalid file" }, { status: 400 });
  }

  try {
    const parsed = JSON.parse(content);
    const prettyJson = JSON.stringify(parsed, null, 2);

    const dataPath = join(process.cwd(), "data", `${file}.json`);
    const publicPath = join(process.cwd(), "public", "data", `${file}.json`);

    await writeFile(dataPath, prettyJson, "utf-8");
    await writeFile(publicPath, prettyJson, "utf-8");

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Invalid JSON content" }, { status: 400 });
  }
}
