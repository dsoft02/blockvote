// src/admin/pages/CandidatesPage.jsx
import React, {useEffect, useState} from "react";
import {useAdmin} from "../AdminAuth";
import {toast} from "react-hot-toast";
import {handleError} from "../../utils/handleError";

export default function CandidatesPage() {
    const {contract} = useAdmin();
    const [elections, setElections] = useState([]);
    const [selectedElection, setSelectedElection] = useState("");
    const [candidateName, setCandidateName] = useState("");
    const [candidates, setCandidates] = useState([]);
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
            toast.error(handleError(err));
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
            toast.error(handleError(err));
        }
        setLoading(false);
    }

    async function handleAddCandidate(e) {
        e.preventDefault();
        if (!contract) return toast.error("No contract connected");
        if (!selectedElection) return toast.error("Please select an election");
        if (!candidateName.trim()) return toast.error("Enter candidate name");

        try {
            const tx = await contract.addCandidate(parseInt(selectedElection), candidateName);
            toast.loading("Adding candidate...");
            await tx.wait();
            toast.dismiss();
            toast.success("✅ Candidate added successfully!");
            setCandidateName("");
            await loadCandidates(selectedElection);
        } catch (err) {
            console.error(err);
            toast.error(handleError(err));
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Candidates</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Add Candidate Form */}
                <form
                    className="bg-white p-6 rounded-lg border shadow-sm space-y-4"
                    onSubmit={handleAddCandidate}
                >
                    <h3 className="text-lg font-medium">Add Candidate</h3>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Election</label>
                        <select
                            value={selectedElection}
                            onChange={(e) => setSelectedElection(e.target.value)}
                            className="w-full p-2 border rounded-md"
                        >
                            {elections.map((el) => (
                                <option key={el.id} value={el.id}>
                                    {el.title} (id:{el.id})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Candidate Name</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded-md"
                            placeholder="Enter candidate name"
                            value={candidateName}
                            onChange={(e) => setCandidateName(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md"
                    >
                        Add Candidate
                    </button>
                </form>

                {/* Candidate List */}
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h3 className="text-lg font-medium mb-4">Candidates for Selected Election</h3>
                    {loading ? (
                        <div className="text-gray-500">Loading candidates...</div>
                    ) : candidates.length === 0 ? (
                        <div className="text-sm text-gray-500">No candidates yet</div>
                    ) : (
                        <ul className="space-y-2">
                            {candidates.map((c) => (
                                <li
                                    key={c.id}
                                    className="flex justify-between items-center p-3 border rounded-md hover:bg-gray-50"
                                >
                                    <div>
                                        <div className="font-medium">{c.name}</div>
                                        <div className="text-xs text-gray-500">ID: {c.id}</div>
                                    </div>
                                    <div className="text-sm font-semibold text-gray-700">{c.votes} votes</div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
