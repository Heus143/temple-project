import SingletonEditor from "./SingletonEditor";

export default function AdminHome() {
  return (
    <SingletonEditor
      contentKey="home_content"
      title="Home Content"
      description="Welcome & introduction section on the home page. The sacred hero (title artwork + deity photo) is protected and not editable here."
      fields={[
        { key: "welcome_title", label: "Welcome Title" },
        { key: "welcome_text", label: "Welcome Message", type: "textarea", rows: 4 },
        { key: "intro_text", label: "Introduction", type: "textarea", rows: 5 },
        { key: "vamshavali_text", label: "Avvaru Vamshavali / Illavelpu Info (Home feature section)", type: "textarea", rows: 5 },
      ]}
    />
  );
}
