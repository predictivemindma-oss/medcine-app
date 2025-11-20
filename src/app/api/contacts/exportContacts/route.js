import connectDB from "../../../lib/mongoose";
import Contact from "../../../models/contact";

export async function GET(req) {
  try {
    await connectDB();

    // 🔥 TRI NUMÉRIQUE pour contactId même s'il est string
    const contacts = await Contact.find()
      .collation({ locale: "en", numericOrdering: true })
      .sort({ contactId: 1 });

    const header = [
      "ID",
      "Prénom",
      "Nom",
      "Email",
      "Numéro",
      "Service",
      "Message",
      "Date",
      "Présence"
    ];

    const rows = contacts.map(c => [
      c.contactId,
      c.prenom,
      c.nom,
      c.email,
      c.numero,
      c.service,
      `"${c.message.replace(/"/g, '""')}"`,
      c.createdAt ? new Date(c.createdAt).toLocaleString("fr-FR") : "",
      c.presence || "En cours"
    ]);

    const csv = [header.join(","), ...rows.map(r => r.join(","))].join("\n");

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=contacts.csv`
      }
    });

  } catch (err) {
    console.error("Erreur export CSV:", err);
    return new Response(
      JSON.stringify({ message: "Erreur serveur", error: err.message }),
      { status: 500 }
    );
  }
}
