import React, { useEffect, useState } from "react";
import { BarChart3, Users, TrendingUp } from "lucide-react";
import useContract from "../hooks/useContract";
import toast from "react-hot-toast";

export default function ResultsPage() {
    const { contract } = useContract();
    const [elections, setElections] = useState([]);
    const [results, setResults] = useState({});
    const [selected, setSelected] = useState("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadResults();
    }, [contract]);

    async function loadResults() {
        if (!contract) return;
        setLoading(true);
        try {
            const count = await contract.electionCount();
            const total = parseInt(count.toString());

            const electionList = [];
            const electionResults = {};

            for (let i = 1; i <= total; i++) {
                const e = await contract.getElection(i);
                const id = e[0].toString();
                const title = e[1];

                electionList.push({ id, title });

                const rawCandidates = await contract.getCandidates(id);
                const formatted = rawCandidates.map((c) => ({
                    id: c.id.toString(),
                    name: c.name,
                    votes: parseInt(c.voteCount.toString()),
                }));

                formatted.sort((a, b) => b.votes - a.votes);
                electionResults[id] = formatted;
            }

            setElections(electionList);
            setResults(electionResults);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load results");
        }
        setLoading(false);
    }

    const filteredElections =
        selected === "all" ? elections : elections.filter((el) => el.id === selected);

    if (loading) return <p className="text-gray-500">Loading...</p>;

    return (
        <div className="container mx-auto py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-3 md:space-y-0">
                <h1 className="text-3xl font-bold">Live Election Results</h1>

                <div className="w-full md:w-auto flex items-center md:justify-end">
                    <label className="text-sm font-medium mr-2">Filter elections:</label>
                    <select
                        className="p-2 border rounded-md w-full md:w-auto"
                        value={selected}
                        onChange={(e) => setSelected(e.target.value)}
                    >
                        <option value="all">Show All Elections</option>
                        {elections.map((el) => (
                            <option key={el.id} value={el.id}>
                                {el.title}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredElections.map((election) => {
                    const candidates = results[election.id] || [];
                    const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
                    const hasVotes = totalVotes > 0;

                    return (
                        <div key={election.id} className="bg-white rounded-xl shadow border">
                            <div className="p-6 border-b">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                                    <h3 className="text-xl font-semibold text-gray-900">{election.title}</h3>

                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        <div className="flex items-center space-x-1">
                                            <Users className="h-4 w-4" />
                                            <span>{totalVotes} votes</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <BarChart3 className="h-4 w-4" />
                                            <span>Live Results</span>
                                        </div>
                                    </div>
                                </div>

                                {hasVotes && (
                                    <div className="flex items-center space-x-2 text-green-600 mt-1">
                                        <TrendingUp className="h-4 w-4" />
                                        <span className="font-medium">
                                            Leading: {candidates[0].name} (
                                            {((candidates[0].votes / totalVotes) * 100).toFixed(1)}%)
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="p-6">
                                {candidates.map((c) => {
                                    const pct = totalVotes > 0 ? (c.votes / totalVotes) * 100 : 0;
                                    return (
                                        <div key={c.id} className="mb-5">
                                            <div className="flex justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                                                        {c.name
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")
                                                            .toUpperCase()}
                                                    </div>
                                                    <p className="font-medium">{c.name}</p>
                                                </div>

                                                <div className="text-right">
                                                    <p className="font-semibold">{c.votes} votes</p>
                                                    <p className="text-xs text-gray-500">{pct.toFixed(1)}%</p>
                                                </div>
                                            </div>

                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                <div
                                                    className="bg-green-600 h-2 rounded-full"
                                                    style={{ width: `${pct}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {!hasVotes && (
                                    <div className="text-center py-6 text-gray-500">
                                        <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No votes cast yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
