import { landingContent } from "@/data/landing-content";

type DeliveryItem = {
  title: string;
  text: string;
  list?: string[];
  extraTitle?: string;
  extraText?: string;
};

export function DeliverySection() {
  const c = landingContent.delivery as {
    title: string;
    items: DeliveryItem[];
  };

  return (
    <section className="section" id="delivery">
      <div className="container">
        <h2>{c.title}</h2>
        <div className="delivery-grid">
          {c.items.map((item) => (
            <article className="delivery-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              {item.list?.length ? (
                <ul className="delivery-list">
                  {item.list.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              ) : null}
              {item.extraTitle && item.extraText ? (
                <p className="delivery-extra">
                  <strong>{item.extraTitle}</strong>
                  <span>{item.extraText}</span>
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
