import SingletonEditor from "./SingletonEditor";

export default function AdminTemple() {
  return (
    <SingletonEditor
      contentKey="temple_info"
      title="Temple Information"
      description="Featured temple information shown on the home page."
      fields={[
        { key: "title", label: "Title" },
        { key: "description", label: "Description", type: "textarea", rows: 6 },
        { key: "info", label: "Additional Info", type: "textarea", rows: 4 },
      ]}
    />
  );
}
