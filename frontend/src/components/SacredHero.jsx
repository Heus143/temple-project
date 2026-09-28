import { useFetch } from "../lib/hooks";

export default function SacredHero() {
  const { data } = useFetch("/content/website_settings", []);
  const titleSrc = (data && data.hero_title_image) || "/assets/title_artwork_hd.png";
  const deitySrc = (data && data.hero_deity_image) || "/assets/deity_hd.jpg";

  return (
    <section className="px-4 pt-6 pb-2 fade-up" aria-label="Sri Annapurnamma Ammavari" data-testid="sacred-hero">
      <div className="hero-sacred-composition">
        <img
          src={titleSrc}
          alt="అవ్వారు వంశానికి ఇలవేల్పు — శ్రీ అన్నపూర్ణమ్మ అమ్మ వారి దేవర మందిరము"
          className="title-artwork"
          width="1542"
          height="216"
        />
        <img
          src={deitySrc}
          alt="Sri Annapurnamma Ammavari — original temple photograph"
          className="ammavari-image"
          width="836"
          height="1132"
        />
      </div>
    </section>
  );
}
