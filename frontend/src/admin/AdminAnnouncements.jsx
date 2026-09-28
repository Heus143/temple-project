import EntityManager from "./EntityManager";

const fields = [
  { key: "title", label: "Title", type: "text", required: true },
  { key: "message", label: "Message", type: "textarea", rows: 4 },
  { key: "image", label: "Image (optional)", type: "image" },
  { key: "priority", label: "Priority (higher shows first)", type: "number" },
  { key: "start_date", label: "Start Date (optional)", type: "date" },
  { key: "end_date", label: "End Date (auto-hides after)", type: "date" },
];

export default function AdminAnnouncements() {
  return (
    <EntityManager
      collectionName="announcements"
      title="Announcement"
      fields={fields}
      newDefaults={{ priority: 0 }}
      getTitle={(a) => a.title}
      getSubtitle={(a) => [a.start_date, a.end_date].filter(Boolean).join(" → ")}
      getImage={(a) => a.image}
    />
  );
}
