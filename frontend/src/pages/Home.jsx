import React from 'react';

import HeroSection from '../components/HeroSection';
import ServicesSection from '../components/ServicesSection';
import GrocerySection from '../components/GrocerySection';
import FeaturesSection from '../components/FeaturesSection';
import HowItWorksSection from '../components/HowItWorksSection';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';

const Home = () => {
    return (
        <div className="min-h-screen bg-white">
            <HeroSection />
            <ServicesSection />
            <GrocerySection />
            <FeaturesSection />
            <HowItWorksSection />
            <CTASection />
            <Footer />
        </div>
    );
};

export default Home;
