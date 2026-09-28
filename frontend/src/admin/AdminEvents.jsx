import EntityManager from "./EntityManager";

const STATUS = ["Upcoming", "Ongoing", "Completed", "Archived"];

const fields = [
  { key: "title", label: "Event Title", type: "text", required: true },
  { key: "event_date", label: "Event Date", type: "date" },
  { key: "start_time", label: "Start Time", type: "time" },
  { key: "end_time", label: "End Time", type: "time" },
  { key: "location", label: "Location", type: "text" },
  { key: "category", label: "Category", type: "text" },
  { key: "status", label: "Status", type: "select", options: STATUS },
  { key: "description", label: "Description", type: "textarea", rows: 5 },
  { key: "cover", label: "Cover Image", type: "image" },
  { key: "photos", label: "Event Photos", type: "images" },
  { key: "video_url", label: "Video URL (optional)", type: "text" },
];

export default function AdminEvents() {
  return (
    <EntityManager
      collectionName="events"
      title="Event"
      fields={fields}
      newDefaults={{ status: "Upcoming" }}
      getSubtitle={(e) => [e.status, e.event_date].filter(Boolean).join(" · ")}
    />
  );
}
