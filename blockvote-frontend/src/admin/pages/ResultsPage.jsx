// src/admin/pages/ResultsPage.jsx
import React, {useEffect, useState} from "react";
import {useAdmin} from "../AdminAuth";

export default function ResultsPage() {
    const {contract} = useAdmin();
    const [elections, setElections] = useState([]);
    const [selected, setSelected] = useState("");
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadElections();
    }, [contract]);

    useEffect(() => {
        if (selected) loadCandidates(selected);
    }, [selected]);

    async function loadElections() {
        if (!contract) return;
        setLoading(true);
        try {
            const count = await contract.electionCount();
            const total = parseInt(count.toString());
            const list = [];
            for (let i = 1; i <= total; i++) {
                const e = await contract.getElection(i);
                list.push({id: e[0].toString(), title: e[1]});
            }
            setElections(list);
            if (list.length > 0) setSelected(list[0].id);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    async function loadCandidates(electionId) {
        if (!contract) return;
        setLoading(true);
        try {
            const raw = await contract.getCandidates(electionId);
            const formatted = raw.map((c) => ({
                id: c.id.toString(),
                name: c.name,
                votes: parseInt(c.voteCount.toString()),
            }));
            formatted.sort((a, b) => b.votes - a.votes);
            setCandidates(formatted);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold mb-6">Election Results</h1>

            {/* Election Selector */}
            <div className="mb-5">
                <label className="text-sm font-medium">Select Election:</label>
                <select className="ml-2 p-2 border rounded" value={selected}
                        onChange={(e) => setSelected(e.target.value)}>
                    {elections.map((el) => (
                        <option key={el.id} value={el.id}>
                            {el.title}
                        </option>
                    ))}
                </select>
            </div>

            {/* Results Card */}
            <div className="bg-white p-5 rounded-xl shadow border">
                {loading ? (
                    <p className="text-gray-500">Loading...</p>
                ) : candidates.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No votes yet</p>
                ) : (
                    <>
                        <div className="mb-4">
                            <p className="text-sm font-medium text-green-600">
                                Leading: {candidates[0].name} ({totalVotes > 0
                                ? ((candidates[0].votes / totalVotes) * 100).toFixed(1)
                                : "0"}%)
                            </p>
                        </div>

                        <div className="space-y-4">
                            {candidates.map((c) => {
                                const percent = totalVotes > 0 ? (c.votes / totalVotes) * 100 : 0;
                                return (
                                    <div key={c.id}>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center space-x-3">
                                                {/* Avatar Circle */}
                                                <div
                                                    className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">
                                                    {c.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{c.name}</p>
                                                </div>
                                            </div>
                                            <p className="font-semibold">{c.votes} votes</p>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full"
                                                style={{width: `${percent}%`}}
                                            ></div>
                                        </div>

                                        <p className="text-xs text-gray-500 mt-1">
                                            {percent.toFixed(1)}%
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
