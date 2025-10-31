// src/admin/pages/CandidatesPage.jsx
import React, {useEffect, useState} from "react";
import {useAdmin} from "../AdminAuth";
import {toast} from "react-hot-toast";
import {handleError} from "../../utils/handleError";
import {Plus, Pencil, Trash2, X} from "lucide-react";
import Swal from "sweetalert2";

export default function CandidatesPage() {
    const {contract} = useAdmin();
    const [elections, setElections] = useState([]);
    const [selectedElectionFilter, setSelectedElectionFilter] = useState("");
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCandidate, setEditingCandidate] = useState(null);
    const [form, setForm] = useState({name: "", electionId: ""});

    const now = Math.floor(Date.now() / 1000);

    useEffect(() => {
        loadElections();
    }, [contract]);

    useEffect(() => {
        if (selectedElectionFilter) loadCandidates(selectedElectionFilter);
        else loadAllCandidates();
    }, [selectedElectionFilter, contract]);

    async function loadElections() {
        if (!contract) return;
        setLoading(true);
        try {
            const rawElections = await contract.getAllElections();
            const formatted = rawElections.map((e) => ({
                id: e.id.toString(),
                title: e.title,
                start: Number(e.startTime.toString()),
                end: Number(e.endTime.toString()),
            }));
            setElections(formatted);
            if (!selectedElectionFilter && formatted.length > 0)
                setSelectedElectionFilter(formatted[0].id);
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
            const [raw, isLocked] = await contract.getCandidatesWithLock(parseInt(electionId));
            const election = elections.find((e) => e.id === electionId);
            const formatted = raw.map((c) => ({
                id: c.id.toString(),
                name: c.name,
                votes: c.voteCount.toString(),
                electionId,
                electionTitle: election?.title || "",
                electionStart: election?.start || 0,
                electionEnd: election?.end || 0,
                isLocked,
            }));
            setCandidates(formatted);
        } catch (err) {
            console.error(err);
            toast.error(handleError(err));
        }
        setLoading(false);
    }

    async function loadAllCandidates() {
        if (!contract) return;
        setLoading(true);
        try {
            const allCandidates = [];
            for (const e of elections) {
                const [raw, isLocked] = await contract.getCandidatesWithLock(parseInt(e.id));
                const formatted = raw.map((c) => ({
                    id: c.id.toString(),
                    name: c.name,
                    votes: c.voteCount.toString(),
                    electionId: e.id,
                    electionTitle: e.title,
                    electionStart: e.start,
                    electionEnd: e.end,
                    isLocked,
                }));
                allCandidates.push(...formatted);
            }
            setCandidates(allCandidates);
        } catch (err) {
            console.error(err);
            toast.error(handleError(err));
        }
        setLoading(false);
    }

    const openAddModal = () => {
        setEditingCandidate(null);
        setForm({name: "", electionId: selectedElectionFilter || ""});
        setModalOpen(true);
    };

    const openEditModal = (candidate) => {
        setEditingCandidate(candidate);
        setForm({name: candidate.name, electionId: candidate.electionId});
        setModalOpen(true);
    };

    async function handleSaveCandidate(e) {
        e.preventDefault();
        if (!contract) return toast.error("No contract connected");
        if (!form.name.trim()) return toast.error("Enter candidate name");
        if (!form.electionId) return toast.error("Select an election");

        try {
            if (editingCandidate) {
                const tx = await contract.updateCandidate(
                    parseInt(form.electionId),
                    parseInt(editingCandidate.id),
                    form.name
                );
                toast.loading("Updating candidate...");
                await tx.wait();
                toast.dismiss();
                toast.success("✅ Candidate updated successfully!");
            } else {
                const tx = await contract.addCandidate(parseInt(form.electionId), form.name);
                toast.loading("Adding candidate...");
                await tx.wait();
                toast.dismiss();
                toast.success("✅ Candidate added successfully!");
            }
            setModalOpen(false);
            setForm({name: "", electionId: ""});
            await loadCandidates(form.electionId);
        } catch (err) {
            console.error(err);
            toast.error(handleError(err));
        }
    }

    async function handleDeleteCandidate(candidate) {
        if (!contract) return toast.error("No contract connected");
        if (candidate.isLocked) return;

        const result = await Swal.fire({
            title: "Delete Candidate?",
            text: `Are you sure you want to delete "${candidate.name}"? This action cannot be undone.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete it",
            cancelButtonText: "Cancel",
            customClass: {
                popup: "rounded-lg shadow-lg",
                title: "text-lg font-semibold",
                confirmButton:
                    "bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-md",
                cancelButton:
                    "bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-md ml-2",
            },
            buttonsStyling: false,
        });

        if (!result.isConfirmed) return;

        try {
            const tx = await contract.deleteCandidate(
                parseInt(candidate.electionId),
                parseInt(candidate.id)
            );
            Swal.fire({
                title: "Deleting...",
                text: "Please wait while the candidate is being deleted.",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });
            await tx.wait();
            Swal.close();
            await Swal.fire("Deleted!", "The candidate was successfully deleted.", "success");
            await loadCandidates(candidate.electionId);
        } catch (err) {
            console.error(err);
            Swal.fire("Error", handleError(err), "error");
        }
    }

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-3 md:space-y-0">
                <div>
                    <h1 className="text-2xl font-bold">Candidate Management</h1>
                    <p className="text-sm text-gray-500">Manage election candidates</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full md:w-auto justify-center"
                >
                    <Plus size={18}/> Add Candidate
                </button>
            </div>

            {/* Card */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <div
                    className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-3 md:space-y-0">
                    <div className="flex flex-col">
                        <h3 className="text-2xl font-semibold leading-none tracking-tight">All Candidates</h3>
                        <p className="text-sm text-muted-foreground">View and manage all candidates</p>
                    </div>

                    <div className="w-full md:w-auto">
                        <select
                            value={selectedElectionFilter}
                            onChange={(e) => setSelectedElectionFilter(e.target.value)}
                            className="p-2 border rounded-md w-full md:w-auto"
                        >
                            <option value="">All Elections</option>
                            {elections.map((e) => (
                                <option key={e.id} value={e.id}>
                                    {e.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Candidate table */}
                {loading ? (
                    <div className="text-gray-500">Loading candidates...</div>
                ) : candidates.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No candidates found</div>
                ) : (
                    <div className="relative w-full overflow-auto">
                        <table className="min-w-full text-sm border-t border-gray-100">
                            <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th className="px-4 py-2 text-left">Candidate Name</th>
                                <th className="px-4 py-2 text-left">Election</th>
                                <th className="px-4 py-2 text-left">Votes</th>
                                <th className="px-4 py-2 text-left">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {candidates.map((c) => {
                                return (
                                    <tr key={`${c.electionId}-${c.id}`} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-2 font-medium">{c.name}</td>
                                        <td className="px-4 py-2">{c.electionTitle}</td>
                                        <td className="px-4 py-2">{c.votes}</td>
                                        <td className="px-4 py-2 flex gap-2">
                                            <button
                                                onClick={() => openEditModal(c)}
                                                disabled={c.isLocked}
                                                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 rounded-md px-3 ${
                                                    c.isLocked
                                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                        : "text-blue-600 hover:bg-blue-600 hover:text-white"
                                                }`}
                                            >
                                                <Pencil size={16}/>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCandidate(c)}
                                                disabled={c.isLocked}
                                                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 rounded-md px-3 ${
                                                    c.isLocked
                                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                        : "text-red-600 hover:bg-red-600 hover:text-white"
                                                }`}
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 relative">
                        <button
                            onClick={() => setModalOpen(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                        >
                            <X size={18}/>
                        </button>

                        <h3 className="text-lg font-semibold mb-1">
                            {editingCandidate ? "Edit Candidate" : "Add Candidate"}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            {editingCandidate ? "Update candidate details below" : "Fill in the details to add a new candidate"}
                        </p>

                        <form onSubmit={handleSaveCandidate} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-600">Election</label>
                                <select
                                    value={form.electionId}
                                    onChange={(e) => setForm({...form, electionId: e.target.value})}
                                    className="w-full p-2 border rounded-md"
                                    required
                                >
                                    <option value="">Select Election</option>
                                    {elections.map((e) => (
                                        <option key={e.id} value={e.id}>
                                            {e.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-gray-600">Candidate Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter candidate name"
                                    value={form.name}
                                    onChange={(e) => setForm({...form, name: e.target.value})}
                                    className="w-full p-2 border rounded-md"
                                    required
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                                >
                                    {editingCandidate ? "Update Candidate" : "Add Candidate"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
