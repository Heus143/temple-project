import EntityManager from "./EntityManager";

const fields = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "role", label: "Relationship / Role (if verified)", type: "text" },
  { key: "description", label: "Description", type: "textarea", rows: 4 },
];

export default function AdminVamshavali() {
  return (
    <EntityManager
      collectionName="vamshavali"
      title="Vamshavali Entry"
      fields={fields}
      getTitle={(v) => v.name}
      getSubtitle={(v) => v.role || ""}
      getImage={() => null}
    />
  );
}
