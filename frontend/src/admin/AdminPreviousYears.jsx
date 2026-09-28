import EntityManager from "./EntityManager";

const fields = [
  { key: "year", label: "Year", type: "number", required: true },
  { key: "title", label: "Title", type: "text" },
  { key: "date", label: "Date (optional)", type: "date" },
  { key: "description", label: "Description", type: "textarea", rows: 5 },
  { key: "cover", label: "Cover Image", type: "image" },
  { key: "photos", label: "Photos", type: "images" },
];

export default function AdminPreviousYears() {
  return (
    <EntityManager
      collectionName="previous_years"
      title="Previous Year"
      fields={fields}
      getTitle={(y) => `${y.year}${y.title ? " — " + y.title : ""}`}
      getSubtitle={(y) => (y.photos ? `${y.photos.length} photo(s)` : "")}
    />
  );
}
