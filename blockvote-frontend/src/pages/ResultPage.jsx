import { useEffect, useState } from "react";
import { Trophy, BarChart3 } from "lucide-react";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";

const ResultPage = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                setLoading(true);
                // Replace with your contract setup later
                // const provider = new ethers.providers.Web3Provider(window.ethereum);
                // const contract = new ethers.Contract(contractAddress, abi, provider);
                // const data = await contract.getElectionResults();
                // setResults(data);

                // Mock data for display
                const mockResults = [
                    { id: 1, name: "Alice Johnson", votes: 320 },
                    { id: 2, name: "Bob Smith", votes: 285 },
                    { id: 3, name: "Carol White", votes: 210 },
                ];
                setResults(mockResults);
            } catch (error) {
                console.error(error);
                toast.error("Failed to fetch results");
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, []);

    return (
        <div className="container mx-auto px-4 py-10">
            <div className="flex items-center gap-2 mb-8">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h1 className="text-3xl font-bold">Election Results</h1>
            </div>

            {loading ? (
                <p className="text-center text-muted-foreground">Loading results...</p>
            ) : (
                <div className="grid md:grid-cols-3 gap-6">
                    {results.map((candidate, index) => (
                        <div
                            key={candidate.id}
                            className={`rounded-2xl border bg-card p-6 text-center transition hover:shadow-md ${
                                index === 0 ? "border-yellow-400 shadow-lg" : "border-muted shadow-sm"
                            }`}
                        >
                            <div className="mb-2">
                                <h3 className="text-xl font-semibold">{candidate.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                    Candidate #{candidate.id}
                                </p>
                            </div>

                            <div className="flex justify-center items-center gap-2 text-lg">
                                <BarChart3 className="w-5 h-5 text-primary" />
                                <span>{candidate.votes} votes</span>
                            </div>

                            {index === 0 && (
                                <p className="text-sm text-yellow-600 font-medium mt-2">🏆 Winner</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ResultPage;
