import React, { useEffect, useState } from "react";
import useContract from "../hooks/useContract";

export default function VotePage() {
    const { contract, account } = useContract();
    const [elections, setElections] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [selectedElection, setSelectedElection] = useState(null);

    useEffect(() => {
        async function loadElections() {
            if (!contract) return;
            const count = await contract.electionCount();
            const total = parseInt(count.toString());
            const list = [];
            for (let i = 1; i <= total; i++) {
                const e = await contract.getElection(i);
                list.push({
                    id: e[0].toString(),
                    title: e[1],
                    description: e[2],
                    start: e[3].toString(),
                    end: e[4].toString(),
                });
            }
            setElections(list);
        }
        loadElections();
    }, [contract]);

    async function viewCandidates(id) {
        const list = await contract.getCandidates(id);
        setCandidates(list.map(c => ({
            id: c.id.toString(),
            name: c.name,
            votes: c.voteCount.toString(),
        })));
        setSelectedElection(id);
    }

    async function vote(candidateId) {
        const tx = await contract.vote(selectedElection, candidateId);
        await tx.wait();
        alert("Vote cast successfully ✅");
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Elections</h1>
            {elections.map(e => (
                <div key={e.id} className="border p-3 mb-3 rounded">
                    <div className="font-semibold">{e.title}</div>
                    <button
                        onClick={() => viewCandidates(e.id)}
                        className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded"
                    >
                        View Candidates
                    </button>
                </div>
            ))}

            {selectedElection && (
                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-2">Candidates</h2>
                    {candidates.map(c => (
                        <div key={c.id} className="flex justify-between border p-2 rounded mb-2">
                            <span>{c.name}</span>
                            <button
                                onClick={() => vote(c.id)}
                                className="px-3 py-1 bg-green-600 text-white rounded"
                            >
                                Vote
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <footer className="mt-6 text-sm text-slate-500">
                Connected Wallet: {account || "Not connected"}
            </footer>
        </div>
    );
}
