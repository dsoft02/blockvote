import {useEffect, useState} from "react";
import {Blocks, ExternalLink, RefreshCcw, Search, X, Hash, Clock, BadgeCheck} from "lucide-react";
import {ethers} from "ethers";
import {toast} from "react-hot-toast";

const BlockchainExplorer = () => {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [searchHash, setSearchHash] = useState("");
    const [txDetails, setTxDetails] = useState(null);

    const provider = new ethers.BrowserProvider(window.ethereum);

    const loadBlocks = async () => {
        try {
            setLoading(true);
            if (!window.ethereum) throw new Error("No wallet detected");

            const latestBlock = await provider.getBlockNumber();

            const recentBlocks = await Promise.all(
                Array.from({length: 12}).map(async (_, i) => {
                    const block = await provider.getBlock(latestBlock - i, true);
                    return {
                        ...block,
                        txCount: block?.transactions?.length || 0,
                    };
                })
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
        if (!autoRefresh) return;

        const interval = setInterval(loadBlocks, 10000);
        return () => clearInterval(interval);
    }, [autoRefresh]);

    const searchTransaction = async () => {
        if (!searchHash.trim()) return;

        try {
            const tx = await provider.getTransaction(searchHash);
            if (!tx) return toast.error("Transaction not found");

            const receipt = await provider.getTransactionReceipt(searchHash);

            setTxDetails({
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: ethers.formatEther(tx.value),
                status: receipt?.status ? "Success" : "Failed",
                blockNumber: tx.blockNumber,
                gasUsed: receipt?.gasUsed?.toString(),
            });
        } catch {
            toast.error("Invalid transaction hash");
        }
    };

    return (
        <div className="container mx-auto px-4 py-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div className="flex items-center gap-2">
                    <Blocks className="w-6 h-6 text-indigo-600"/>
                    <h1 className="text-3xl font-bold text-gray-800">Blockchain Explorer</h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={loadBlocks}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
                    >
                        <RefreshCcw className="w-4 h-4"/> Refresh
                    </button>

                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                            autoRefresh
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-700"
                        }`}
                    >
                        {autoRefresh ? "Auto-Refresh ON" : "Auto-Refresh OFF"}
                    </button>
                </div>
            </div>

            <div className="flex gap-2 mb-6">
                <input
                    type="text"
                    placeholder="Search Transaction Hash..."
                    className="flex-1 px-4 py-2 border rounded-lg"
                    value={searchHash}
                    onChange={(e) => setSearchHash(e.target.value)}
                />
                <button
                    onClick={searchTransaction}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-1 hover:bg-indigo-700"
                >
                    <Search className="w-4 h-4"/>
                    Search
                </button>
            </div>

            {loading ? (
                <p className="text-center text-gray-500">Loading blocks...</p>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blocks.map((block) => (
                        <div
                            key={block.number}
                            className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition"
                        >
                            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                                <Blocks className="w-5 h-5 text-indigo-600"/>
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Block #{block.number}
                                </h2>
                                <span
                                    className="ml-auto text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                                    <BadgeCheck className="w-3 h-3"/> Confirmed
                                </span>
                            </div>

                            <div className="p-4 text-sm text-gray-600 space-y-3">

                                <div className="flex items-start gap-2">
                                    <Hash className="w-4 h-4 text-gray-400 mt-1"/>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Hash</p>
                                        <p className="font-mono break-all">{block.hash}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <Clock className="w-4 h-4 text-gray-400"/>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Timestamp</p>
                                        <p>{new Date(block.timestamp * 1000).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {txDetails && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg overflow-y-auto max-h-[80vh]">

                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Transaction Details</h2>
                            <button
                                onClick={() => setTxDetails(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-5 h-5"/>
                            </button>
                        </div>

                        <div className="space-y-3 text-sm text-gray-700">

                            <div>
                                <p className="font-medium text-gray-500">Hash</p>
                                <p className="font-mono break-all">{txDetails.hash}</p>
                            </div>

                            <div>
                                <p className="font-medium text-gray-500">From</p>
                                <p className="font-mono break-all">{txDetails.from}</p>
                            </div>

                            <div>
                                <p className="font-medium text-gray-500">To</p>
                                <p className="font-mono break-all">{txDetails.to}</p>
                            </div>

                            <p><strong>Value:</strong> {txDetails.value} ETH</p>
                            <p><strong>Status:</strong> {txDetails.status}</p>
                            <p><strong>Block:</strong> {txDetails.blockNumber}</p>
                            <p><strong>Gas Used:</strong> {txDetails.gasUsed}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlockchainExplorer;
