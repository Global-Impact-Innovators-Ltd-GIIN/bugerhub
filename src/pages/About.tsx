import React from 'react';
import { Heart, Target, Smile, Users, TrendingUp } from 'lucide-react';
import '../styles/pages/About.css';

export const About: React.FC = () => {
  return (
    <div className="about-page animate-fade-in">
      {/* Header / Intro */}
      <section className="about-header container text-center">
        <div className="heart-icon-box">
          <Heart size={28} className="heart-icon-svg" fill="currentColor" />
        </div>
        <h1>OUR <span className="orange-text">STORY</span></h1>
        <p className="about-intro-text">
          From a humble food truck to the city's favorite burger joint, we've been serving smiles one burger at a time since 2015.
        </p>
      </section>

      {/* Cards Section */}
      <section className="about-cards-section container">
        <div className="about-cards-grid">
          {/* Card 1 */}
          <div className="about-value-card card">
            <div className="value-icon-box bg-red-dim">
              <Target size={22} className="color-red" />
            </div>
            <h3>OUR MISSION</h3>
            <p>To redefine fast food by serving premium, freshly-made burgers that don't compromise on quality, taste, or experience.</p>
          </div>

          {/* Card 2 */}
          <div className="about-value-card card">
            <div className="value-icon-box bg-orange-dim">
              <Smile size={22} className="color-orange" />
            </div>
            <h3>OUR PASSION</h3>
            <p>We're passionate about creating memorable dining experiences and building a community around great food and good times.</p>
          </div>

          {/* Card 3 (Highlighted community card from screenshot) */}
          <div className="about-value-card card highlight-orange-card">
            <div className="value-icon-box bg-white-dim">
              <Users size={22} className="color-white" />
            </div>
            <h3>OUR COMMUNITY</h3>
            <p>Serving over 15,000 happy customers and counting. Your support fuels our growth and inspires our creativity.</p>
          </div>
        </div>
      </section>

      {/* Timeline Journey */}
      <section className="journey-timeline-section">
        <div className="container">
          <div className="journey-header text-center">
            <h2>
              <TrendingUp size={24} className="timeline-trend-icon" /> OUR <span className="orange-text">JOURNEY</span>
            </h2>
            <p>Milestones that define our history</p>
          </div>

          {/* Vertical Timeline */}
          <div className="timeline-container">
            <div className="timeline-line"></div>

            {/* Event 1 */}
            <div className="timeline-item left">
              <div className="timeline-dot"></div>
              <div className="timeline-card card">
                <span className="timeline-year">2015</span>
                <h4>First BurgerHub Opens</h4>
                <p>Started as a food truck in the downtown financial district, focusing on custom handmade cheeseburgers.</p>
              </div>
            </div>

            {/* Event 2 */}
            <div className="timeline-item right">
              <div className="timeline-dot"></div>
              <div className="timeline-card card">
                <span className="timeline-year">2017</span>
                <h4>Expanded to 3 Locations</h4>
                <p>Due to popular demand, we opened our first brick-and-mortar flagship store and expanded to Northside and Westgate Mall.</p>
              </div>
            </div>

            {/* Event 3 */}
            <div className="timeline-item left">
              <div className="timeline-dot"></div>
              <div className="timeline-card card">
                <span className="timeline-year">2020</span>
                <h4>Launched Delivery & App</h4>
                <p>Adapted to provide safe, contactless deliveries, building our own mobile application and partner integrations.</p>
              </div>
            </div>

            {/* Event 4 */}
            <div className="timeline-item right">
              <div className="timeline-dot"></div>
              <div className="timeline-card card">
                <span className="timeline-year">2023</span>
                <h4>Named Best Burger in Town</h4>
                <p>Honored with the city's Culinary Excellence Award for our signature Triple Threat Burger recipe.</p>
              </div>
            </div>

            {/* Event 5 */}
            <div className="timeline-item left">
              <div className="timeline-dot"></div>
              <div className="timeline-card card">
                <span className="timeline-year">2026</span>
                <h4>Going Fully Green</h4>
                <p>Committed to sustainability by transitioning to 100% biodegradable and compostable takeout packaging.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
