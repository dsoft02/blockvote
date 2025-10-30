// src/admin/pages/ResultsPage.jsx
import React, { useEffect, useState } from "react";
import { useAdmin } from "../AdminAuth";

export default function ResultsPage() {
    const { contract } = useAdmin();
    const [elections, setElections] = useState([]);
    const [selected, setSelected] = useState("");
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadElections();
        // eslint-disable-next-line
    }, [contract]);

    useEffect(() => {
        if (selected) loadCandidates(selected);
        // eslint-disable-next-line
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
                list.push({ id: e[0].toString(), title: e[1] });
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
            // sort by votes desc
            formatted.sort((a, b) => b.votes - a.votes);
            setCandidates(formatted);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Election Results</h2>
            <div className="bg-white p-4 rounded shadow">
                <div className="mb-4">
                    <label className="text-sm">Select election</label>
                    <select className="ml-2 p-2 border rounded" value={selected} onChange={(e) => setSelected(e.target.value)}>
                        {elections.map((el) => (
                            <option key={el.id} value={el.id}>
                                {el.title}
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <div>
                        {candidates.length === 0 ? (
                            <div className="text-sm text-gray-500">No candidates or no votes</div>
                        ) : (
                            <ul className="space-y-3">
                                {candidates.map((c) => (
                                    <li key={c.id} className="p-3 border rounded flex justify-between items-center">
                                        <div>
                                            <div className="font-medium">{c.name}</div>
                                            <div className="text-xs text-gray-500">ID: {c.id}</div>
                                        </div>
                                        <div className="text-lg font-semibold">{c.votes}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
