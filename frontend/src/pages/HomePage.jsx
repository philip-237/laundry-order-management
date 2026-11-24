import { Link } from 'react-router-dom';
import { services } from '../orders';
import './HomePage.css';

const serviceDescriptions = {
  WASH_ONLY: 'Drop off your laundry for washing.',
  IRON_ONLY: 'Bring clean clothes that need pressing.',
  WASH_AND_IRON: 'Get your laundry washed and pressed in one order.',
};

const shop = {
  address: import.meta.env.VITE_SHOP_ADDRESS?.trim(),
  hours: import.meta.env.VITE_SHOP_HOURS?.trim(),
  phone: import.meta.env.VITE_SHOP_PHONE?.trim(),
};

export default function HomePage() {
  const showVisitDetails = shop.address || shop.hours || shop.phone;

  return (
    <div className="public-home">
      <header className="app-header">
        <div className="shell header-content">
          <Link className="brand" to="/">Laundry Management System</Link>
          <Link className="home-link" to="/login">Employee sign-in</Link>
        </div>
      </header>
      <main className="shell home-content">
        <section className="home-hero" aria-labelledby="home-title">
          <h1 id="home-title">Laundry services</h1>
          <p>Bring your laundry to the shop for washing, ironing, or both.</p>
          <a className="button button--primary home-cta" href="#services">Explore services</a>
        </section>

        <section className="home-section" id="services" aria-labelledby="services-title">
          <h2 id="services-title">Choose a service</h2>
          <ul className="service-list">
            {Object.entries(services).map(([key, name]) => (
              <li className="panel service-card" key={key}>
                <h3>{name}</h3>
                <p>{serviceDescriptions[key]}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="home-section" aria-labelledby="pickup-title">
          <h2 id="pickup-title">Drop-off and pickup</h2>
          <ol className="pickup-steps">
            <li>Bring your clothes and tell the employee which service you need.</li>
            <li>Ask the employee for the price and when to come back.</li>
            <li>Collect your laundry and pay at pickup.</li>
          </ol>
        </section>

        {showVisitDetails && (
          <section className="home-section" aria-labelledby="visit-title">
            <h2 id="visit-title">Visit the shop</h2>
            {shop.address && <p>{shop.address}</p>}
            {shop.hours && <p>Opening hours {shop.hours}</p>}
            {shop.phone && <a className="home-link" href={`tel:${shop.phone.replace(/[^+\\d]/g, '')}`}>{shop.phone}</a>}
          </section>
        )}
      </main>
    </div>
  );
}
