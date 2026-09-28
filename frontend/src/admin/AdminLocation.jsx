import SingletonEditor from "./SingletonEditor";

export default function AdminLocation() {
  return (
    <SingletonEditor
      contentKey="location_info"
      title="Location"
      fields={[
        { key: "address", label: "Address", type: "textarea", rows: 3 },
        { key: "maps_link", label: "Google Maps Link" },
        { key: "embed_link", label: "Map Embed URL (optional)" },
        { key: "directions", label: "Directions / Notes", type: "textarea", rows: 3 },
      ]}
    />
  );
}
