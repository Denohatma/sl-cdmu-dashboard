export async function POST(request: Request) {
  const { password } = await request.json();
  const adminPassword = process.env.ADMIN_PASSWORD || "cdmu-admin-2025";

  if (password === adminPassword) {
    return Response.json({ success: true });
  }

  return Response.json({ error: "Invalid password" }, { status: 401 });
}
