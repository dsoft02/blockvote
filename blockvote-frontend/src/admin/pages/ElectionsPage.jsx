// src/admin/pages/ElectionsPage.jsx
import React, {useEffect, useState} from "react";
import {useAdmin} from "../AdminAuth";
import {toast} from "react-hot-toast";

export default function ElectionsPage() {
    const {contract, isOwner} = useAdmin();
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({
        title: "",
        description: "",
        start: "",
        end: "",
    });

    useEffect(() => {
        loadElections();
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
            }))
                .sort((a, b) => b.start - a.start);

            setElections(list);
        } catch (err) {
            console.error("loadElections", err);
            toast.error("Failed to load elections");
        }
        setLoading(false);
    }

    async function handleCreate(e) {
        e.preventDefault();
        if (!contract) return toast.error("No contract connected");

        try {
            setCreating(true);
            const startTs = Math.floor(new Date(form.start).getTime() / 1000);
            const endTs = Math.floor(new Date(form.end).getTime() / 1000);
            const tx = await contract.createElection(
                form.title,
                form.description,
                startTs,
                endTs
            );

            toast.loading("Creating election...");
            await tx.wait();
            toast.dismiss();
            toast.success("✅ Election created successfully");

            setForm({title: "", description: "", start: "", end: ""});
            loadElections();
        } catch (err) {
            console.error(err);
            toast.error(err.reason || err.message || "Transaction failed");
        } finally {
            setCreating(false);
        }
    }

    async function endElectionEarly(id) {
        try {
            const tx = await contract.endElectionEarly(id);
            toast.loading("Ending election...");
            await tx.wait();
            toast.dismiss();
            toast.success(`Election ${id} ended early`);
            loadElections();
        } catch (err) {
            console.error(err);
            toast.error("Failed to end election");
        }
    }

    const now = Date.now() / 1000;

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
                        <label className="text-sm text-gray-600">Start Time</label>
                        <input
                            type="datetime-local"
                            className="w-full p-2 mb-2 border rounded"
                            value={form.start}
                            onChange={(e) => setForm({...form, start: e.target.value})}
                            required
                        />
                        <label className="text-sm text-gray-600">End Time</label>
                        <input
                            type="datetime-local"
                            className="w-full p-2 mb-3 border rounded"
                            value={form.end}
                            onChange={(e) => setForm({...form, end: e.target.value})}
                            required
                        />
                        <button
                            disabled={creating}
                            className={`w-full py-2 rounded text-white ${
                                creating
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-indigo-600 hover:bg-indigo-700"
                            }`}
                        >
                            {creating ? "Creating..." : "Create Election"}
                        </button>
                    </form>

                    {/* Existing Elections */}
                    <div className="bg-white p-4 rounded shadow">
                        <h3 className="font-medium mb-3">Elections List</h3>
                        {loading ? (
                            <div>Loading...</div>
                        ) : elections.length === 0 ? (
                            <div className="text-sm text-gray-500">No elections yet</div>
                        ) : (
                            <ul className="space-y-3">
                                {elections.map((el) => {
                                    const isOngoing = el.start <= now && el.end >= now;
                                    const isUpcoming = el.start > now;
                                    const isEnded = el.end < now;
                                    const badge = isOngoing
                                        ? "bg-green-100 text-green-700"
                                        : isUpcoming
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-gray-100 text-gray-700";

                                    return (
                                        <li key={el.id} className="p-3 border rounded">
                                            <div className="flex items-center justify-between">
                                                <div className="font-semibold">{el.title}</div>
                                                <span
                                                    className={`px-2 py-1 text-xs rounded ${badge}`}
                                                >
                          {isOngoing
                              ? "Ongoing"
                              : isUpcoming
                                  ? "Upcoming"
                                  : "Ended"}
                        </span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {el.description.slice(0, 80)}
                                                {el.description.length > 80 && "..."}
                                            </div>
                                            <div className="text-xs mt-2">
                                                🗳 {el.candidateCount} candidates <br/>
                                                🕒 {new Date(el.start * 1000).toLocaleString()} →{" "}
                                                {new Date(el.end * 1000).toLocaleString()}
                                            </div>

                                            {isOngoing && (
                                                <button
                                                    onClick={() => endElectionEarly(el.id)}
                                                    className="mt-2 text-xs text-red-600 hover:underline"
                                                >
                                                    End Election Early
                                                </button>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
