import EntityManager from "./EntityManager";

const catFields = [{ key: "name", label: "Category Name", type: "text", required: true }];
const imgFields = [
  { key: "image", label: "Image", type: "image", required: true },
  { key: "caption", label: "Caption (optional)", type: "text" },
  { key: "category", label: "Category", type: "select", optionsSource: "categories" },
];

export default function AdminGallery() {
  return (
    <div className="space-y-12">
      <EntityManager
        collectionName="gallery_categories"
        title="Gallery Category"
        fields={catFields}
        getTitle={(c) => c.name}
        getImage={() => null}
      />
      <EntityManager
        collectionName="gallery"
        title="Gallery Image"
        fields={imgFields}
        getTitle={(g) => g.caption || "Image"}
        getSubtitle={(g) => g.category || ""}
        getImage={(g) => g.image}
      />
    </div>
  );
}
