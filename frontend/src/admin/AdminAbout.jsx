import SingletonEditor from "./SingletonEditor";

export default function AdminAbout() {
  return (
    <SingletonEditor
      contentKey="about_content"
      title="About Temple"
      fields={[
        { key: "title", label: "Page Title" },
        { key: "description", label: "Description / Overview", type: "textarea", rows: 6 },
        { key: "history", label: "History", type: "textarea", rows: 6 },
        { key: "important_info", label: "Important Information", type: "textarea", rows: 4 },
        { key: "images", label: "Images", type: "images" },
      ]}
    />
  );
}
