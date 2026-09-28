import SingletonEditor from "./SingletonEditor";

export default function AdminSettings() {
  return (
    <SingletonEditor
      contentKey="website_settings"
      title="Website Settings"
      fields={[
        { key: "website_title", label: "Website Title" },
        { key: "temple_name_en", label: "Temple Name (English)" },
        { key: "temple_name_te", label: "Temple Name (Telugu)" },
        { key: "mantra", label: "Mantra Ticker Text (Telugu)" },
        { key: "address", label: "Address", type: "textarea", rows: 2 },
        { key: "footer_text", label: "Footer Text", type: "textarea", rows: 2 },
        { key: "seo_title", label: "SEO Title" },
        { key: "seo_description", label: "SEO Description", type: "textarea", rows: 2 },
      ]}
    />
  );
}
