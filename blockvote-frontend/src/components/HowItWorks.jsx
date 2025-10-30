import { UserCheck, Vote, Shield } from "lucide-react";

const HowItWorks = () => {
    const steps = [
        {
            number: "1",
            icon: UserCheck,
            title: "Register & Verify",
            description: "Create your secure voter account with identity verification.",
        },
        {
            number: "2",
            icon: Vote,
            title: "Cast Your Vote",
            description: "Select your candidates in the secure digital voting booth.",
        },
        {
            number: "3",
            icon: Shield,
            title: "Verify & Track",
            description: "Confirm your vote was recorded correctly on the blockchain.",
        },
    ];

    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-4xl text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">How It Works</h2>
                    <p className="text-gray-600 text-lg">
                        Simple, secure, and transparent voting in three easy steps
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {steps.map((step) => {
                        const Icon = step.icon;
                        return (
                            <div
                                key={step.number}
                                className="relative rounded-2xl border bg-white p-8 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50">
                                    <Icon className="w-8 h-8 text-blue-600" />
                                </div>
                                <div className="absolute top-4 right-4 text-5xl font-bold text-blue-100">
                                    {step.number}
                                </div>
                                <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
                                <p className="text-gray-600">{step.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
