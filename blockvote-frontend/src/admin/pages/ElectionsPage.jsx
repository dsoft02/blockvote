// src/admin/pages/ElectionsPage.jsx
import React, {useEffect, useState} from "react";
import {useAdmin} from "../AdminAuth";

export default function ElectionsPage() {
    const {contract, account, isOwner} = useAdmin();
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: "",
        description: "",
        start: "",
        end: "",
    });
    const [status, setStatus] = useState("");

    useEffect(() => {
        loadElections();
        // eslint-disable-next-line
    }, [contract]);

    async function loadElections() {
        if (!contract) return;
        setLoading(true);
        try {
            const countBN = await contract.electionCount();
            const total = parseInt(countBN.toString());
            const promises = [];
            for (let i = 1; i <= total; i++) promises.push(contract.getElection(i));
            const raw = await Promise.all(promises);

            const list = raw.map((e) => ({
                id: e[0].toString(),
                title: e[1],
                description: e[2],
                start: Number(e[3].toString()),
                end: Number(e[4].toString()),
                candidateCount: e[5] ? parseInt(e[5].toString()) : 0,
            }));
            setElections(list);
        } catch (err) {
            console.error("loadElections", err);
            setStatus(err.message);
        }
        setLoading(false);
    }

    async function handleCreate(e) {
        e.preventDefault();
        if (!contract) return setStatus("No contract connected");
        try {
            const startTs = Math.floor(new Date(form.start).getTime() / 1000);
            const endTs = Math.floor(new Date(form.end).getTime() / 1000);
            const tx = await contract.createElection(form.title, form.description, startTs, endTs);
            setStatus("Creating... waiting for confirmation ⏳");
            await tx.wait();
            setStatus("✅ Election created!");
            setForm({title: "", description: "", start: "", end: ""});
            await loadElections();
        } catch (err) {
            console.error(err);
            setStatus(`❌ ${err.message}`);
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Manage Elections</h2>
            </div>

            {!isOwner ? (
                <div className="p-4 bg-yellow-100 text-yellow-700 rounded">
                    You must be the contract owner to create or manage elections.
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Create Election Form */}
                    <form className="bg-white p-4 rounded shadow" onSubmit={handleCreate}>
                        <h3 className="font-medium mb-3">Create New Election</h3>
                        <input
                            className="w-full p-2 mb-2 border rounded"
                            placeholder="Title"
                            value={form.title}
                            onChange={(e) => setForm({...form, title: e.target.value})}
                            required
                        />
                        <textarea
                            className="w-full p-2 mb-2 border rounded"
                            placeholder="Description"
                            value={form.description}
                            onChange={(e) => setForm({...form, description: e.target.value})}
                            required
                        />
                        <label className="text-sm text-gray-600">Start</label>
                        <input
                            type="datetime-local"
                            className="w-full p-2 mb-2 border rounded"
                            value={form.start}
                            onChange={(e) => setForm({...form, start: e.target.value})}
                            required
                        />
                        <label className="text-sm text-gray-600">End</label>
                        <input
                            type="datetime-local"
                            className="w-full p-2 mb-2 border rounded"
                            value={form.end}
                            onChange={(e) => setForm({...form, end: e.target.value})}
                            required
                        />
                        <button className="w-full bg-indigo-600 text-white py-2 rounded">
                            Create Election
                        </button>
                        {status && <p className="text-sm mt-2">{status}</p>}
                    </form>

                    {/* Existing Elections List */}
                    <div className="bg-white p-4 rounded shadow">
                        <h3 className="font-medium mb-3">Existing Elections</h3>
                        {loading ? (
                            <div>Loading...</div>
                        ) : elections.length === 0 ? (
                            <div className="text-sm text-gray-500">No elections yet</div>
                        ) : (
                            <ul className="space-y-3">
                                {elections.map((el) => (
                                    <li key={el.id} className="p-3 border rounded">
                                        <div className="font-semibold">{el.title}</div>
                                        <div className="text-xs text-gray-500">{el.description}</div>
                                        <div className="text-xs mt-1">
                                            🗳 {el.candidateCount} candidates <br/>
                                            🕒 {new Date(el.start * 1000).toLocaleString()} →{" "}
                                            {new Date(el.end * 1000).toLocaleString()}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
