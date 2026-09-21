import ContactSubmissionsClient from "./ContactSubmissionsClient";
import prisma from "@/lib/db";

export const metadata = {
  title: "Contact Submissions",
};

export const dynamic = "force-dynamic";

async function getSubmissions() {
  const submissions = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return JSON.parse(JSON.stringify(submissions));
}

export default async function ContactSubmissionsPage() {
  const submissions = await getSubmissions();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Contact Submissions</h1>
        <p className="text-sm text-gray-500 mt-1">
          Messages from the contact form
        </p>
      </div>

      <ContactSubmissionsClient initialSubmissions={submissions} />
    </div>
  );
}
