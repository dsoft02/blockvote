import { Shield, Eye, FileCheck, Lock } from "lucide-react";

const Features = () => {
    const features = [
        {
            icon: Shield,
            title: "Secure",
            text: "Military-grade encryption and blockchain technology ensure your vote is protected.",
        },
        {
            icon: Eye,
            title: "Transparent",
            text: "All votes are publicly verifiable while maintaining voter privacy.",
        },
        {
            icon: FileCheck,
            title: "Immutable",
            text: "Once cast, votes cannot be altered or deleted from the blockchain.",
        },
        {
            icon: Lock,
            title: "Private",
            text: "Your vote remains anonymous while being cryptographically verified.",
        },
    ];

    return (
        <section className="py-16 px-6 bg-white">
            <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-6">
                {features.map((feature, i) => {
                    const Icon = feature.icon;
                    return (
                        <div
                            key={i}
                            className="flex flex-col items-center text-center p-6 rounded-2xl border bg-gray-50 hover:shadow-md transition-all duration-200"
                        >
                            <Icon className="w-8 h-8 mb-3 text-blue-600" />
                            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                            <p className="text-gray-600 text-sm">{feature.text}</p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default Features;
