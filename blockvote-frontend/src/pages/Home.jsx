import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";

const Home = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            <Hero />
            <Features />
            <HowItWorks />
        </div>
    );
};

export default Home;
