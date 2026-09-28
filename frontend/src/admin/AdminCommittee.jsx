import EntityManager from "./EntityManager";

const fields = [
  { key: "name", label: "Member Name", type: "text" },
  { key: "position", label: "Committee Position", type: "text" },
  { key: "description", label: "Description (optional)", type: "textarea", rows: 3 },
  { key: "photo", label: "Photo (replace with HD original)", type: "image" },
];

export default function AdminCommittee() {
  return (
    <div>
      <p className="font-body mb-4 rounded-lg p-4" style={{ background: "var(--cream)", border: "1px solid var(--antique-gold)", color: "var(--text-muted)" }}>
        17 members were extracted from the committee banner. Please enter each verified name and position, and replace photos with genuine HD originals where available.
      </p>
      <EntityManager
        collectionName="committee_members"
        title="Committee Member"
        fields={fields}
        getTitle={(m) => m.name || "(name to be added)"}
        getSubtitle={(m) => m.position || ""}
        getImage={(m) => m.photo}
      />
    </div>
  );
}
