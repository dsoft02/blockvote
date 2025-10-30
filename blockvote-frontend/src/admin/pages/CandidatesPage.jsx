// src/admin/pages/CandidatesPage.jsx
import React, { useEffect, useState } from "react";
import { useAdmin } from "../AdminAuth";

export default function CandidatesPage() {
    const { contract } = useAdmin();
    const [elections, setElections] = useState([]);
    const [selectedElection, setSelectedElection] = useState("");
    const [candidateName, setCandidateName] = useState("");
    const [candidates, setCandidates] = useState([]);
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadElections();
        // eslint-disable-next-line
    }, [contract]);

    useEffect(() => {
        if (selectedElection) loadCandidates(selectedElection);
        // eslint-disable-next-line
    }, [selectedElection, contract]);

    async function loadElections() {
        if (!contract) return;
        setLoading(true);
        try {
            const countBN = await contract.electionCount();
            const total = parseInt(countBN.toString());
            const list = [];
            for (let i = 1; i <= total; i++) {
                const e = await contract.getElection(i);
                list.push({
                    id: e[0].toString(),
                    title: e[1],
                    candidateCount: e[5] ? parseInt(e[5].toString()) : 0,
                });
            }
            setElections(list);
            if (list.length > 0 && !selectedElection) setSelectedElection(list[0].id);
        } catch (err) {
            console.error(err);
            setStatus(err.message);
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
                votes: c.voteCount.toString(),
            }));
            setCandidates(formatted);
        } catch (err) {
            console.error(err);
            setStatus(err.message);
        }
        setLoading(false);
    }

    async function handleAddCandidate(e) {
        e.preventDefault();
        if (!contract) return setStatus("No contract");
        if (!selectedElection) return setStatus("Select an election");
        if (!candidateName.trim()) return setStatus("Enter candidate name");
        try {
            const tx = await contract.addCandidate(parseInt(selectedElection), candidateName);
            setStatus("Adding candidate...");
            await tx.wait();
            setCandidateName("");
            setStatus("Candidate added");
            await loadCandidates(selectedElection);
        } catch (err) {
            console.error(err);
            setStatus(err.message);
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Candidates</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <form className="bg-white p-4 rounded shadow" onSubmit={handleAddCandidate}>
                    <h3 className="font-medium mb-3">Add Candidate</h3>

                    <label className="text-sm">Election</label>
                    <select
                        value={selectedElection}
                        onChange={(e) => setSelectedElection(e.target.value)}
                        className="w-full p-2 mb-3 border rounded"
                    >
                        {elections.map((el) => (
                            <option key={el.id} value={el.id}>
                                {el.title} (id:{el.id})
                            </option>
                        ))}
                    </select>

                    <input
                        className="w-full p-2 mb-2 border rounded"
                        placeholder="Candidate name"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        required
                    />

                    <button className="w-full bg-indigo-600 text-white py-2 rounded">Add Candidate</button>
                    {status && <p className="text-sm mt-2">{status}</p>}
                </form>

                <div className="bg-white p-4 rounded shadow">
                    <h3 className="font-medium mb-3">Candidates for selected election</h3>
                    {loading ? (
                        <div>Loading...</div>
                    ) : candidates.length === 0 ? (
                        <div className="text-sm text-gray-500">No candidates yet</div>
                    ) : (
                        <ul className="space-y-2">
                            {candidates.map((c) => (
                                <li key={c.id} className="p-2 border rounded flex justify-between items-center">
                                    <div>
                                        <div className="font-medium">{c.name}</div>
                                        <div className="text-xs text-gray-500">ID: {c.id}</div>
                                    </div>
                                    <div className="text-sm">{c.votes} votes</div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
