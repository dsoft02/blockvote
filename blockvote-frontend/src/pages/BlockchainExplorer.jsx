import { useEffect, useState } from "react";
import { Blocks, ExternalLink, RefreshCcw } from "lucide-react";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";

const BlockchainExplorer = () => {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadBlocks = async () => {
        try {
            setLoading(true);
            if (!window.ethereum) throw new Error("No wallet detected");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const latestBlock = await provider.getBlockNumber();

            const recentBlocks = await Promise.all(
                Array.from({ length: 5 }).map((_, i) =>
                    provider.getBlock(latestBlock - i)
                )
            );

            setBlocks(recentBlocks);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load blockchain data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBlocks();
    }, []);

    return (
        <div className="container mx-auto px-4 py-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <Blocks className="w-6 h-6 text-indigo-600" />
                    <h1 className="text-3xl font-bold text-gray-800">Blockchain Explorer</h1>
                </div>
                <button
                    onClick={loadBlocks}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
                >
                    <RefreshCcw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <p className="text-center text-gray-500">Loading recent blocks...</p>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blocks.map((block) => (
                        <div
                            key={block.number}
                            className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition"
                        >
                            <div className="p-4 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Block #{block.number}
                                </h2>
                            </div>
                            <div className="p-4 text-sm text-gray-600 space-y-2">
                                <p>
                                    <span className="font-medium text-gray-800">Timestamp:</span>{" "}
                                    {new Date(block.timestamp * 1000).toLocaleString()}
                                </p>
                                <p>
                                    <span className="font-medium text-gray-800">Miner:</span>{" "}
                                    {block.miner?.slice(0, 10)}...
                                </p>
                                <p>
                                    <span className="font-medium text-gray-800">Transactions:</span>{" "}
                                    {block.transactions.length}
                                </p>
                                <a
                                    href={`https://sepolia.etherscan.io/block/${block.number}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                                >
                                    View on Etherscan <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BlockchainExplorer;
