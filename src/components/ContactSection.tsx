import type { VenueSettings } from "@/lib/types";

export function ContactSection({ venue }: { venue: VenueSettings }) {
  return (
    <section className="py-16 sm:py-24">
      <h2 className="luxury-title text-center text-3xl text-yele-charcoal sm:text-4xl">
        Nous trouver
      </h2>
      <div className="mx-auto mt-10 max-w-lg space-y-6 text-center text-gray-700 leading-relaxed">
        <div>
          <p className="luxury-label mb-2">Adresse</p>
          <p>{venue.address}</p>
          <p className="text-gray-500">{venue.landmark}</p>
        </div>
        <div>
          <p className="luxury-label mb-2">Téléphone</p>
          <a
            href={`tel:${venue.phone}`}
            className="text-yele-orange hover:underline"
          >
            +225 07 10 42 06 70
          </a>
        </div>
        <div>
          <p className="luxury-label mb-2">E-mail</p>
          <a
            href={`mailto:${venue.email}`}
            className="break-all text-yele-orange hover:underline"
          >
            {venue.email}
          </a>
        </div>
      </div>
    </section>
  );
}
