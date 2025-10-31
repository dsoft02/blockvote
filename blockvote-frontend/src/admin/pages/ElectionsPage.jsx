//src/admin/pages/ElectionsPage.jsx
import React, {useEffect, useState} from "react";
import {useAdmin} from "../AdminAuth";
import {format} from "date-fns";
import {Plus, Edit2, Trash2, X, Users} from "lucide-react";
import {toast} from "react-hot-toast";
import Swal from "sweetalert2";
import {handleError} from "../../utils/handleError";

export default function ElectionsPage() {
    const {contract, isOwner} = useAdmin();
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingElection, setEditingElection] = useState(null);
    const [form, setForm] = useState({title: "", description: "", start: "", end: ""});
    const [status, setStatus] = useState("");

    const now = Math.floor(Date.now() / 1000);

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
            }));

            setElections(list);
        } catch (err) {
            console.error("loadElections", err);
            toast.error(handleError(err));
        }
        setLoading(false);
    }

    async function handleCreateOrEdit(e) {
        e.preventDefault();
        if (!contract) return toast.error("No contract connected");

        try {
            const startTs = Math.floor(new Date(form.start).getTime() / 1000);
            const endTs = Math.floor(new Date(form.end).getTime() / 1000);

            if (editingElection) {
                const tx = await contract.updateElection(
                    editingElection.id,
                    form.title,
                    form.description,
                    startTs,
                    endTs
                );
                setStatus("Updating election...");
                await tx.wait();
                toast.success("✏️ Election updated successfully!");
            } else {
                const tx = await contract.createElection(form.title, form.description, startTs, endTs);
                setStatus("Creating election...");
                await tx.wait();
                toast.success("Election created successfully!");
            }

            setModalOpen(false);
            setEditingElection(null);
            setForm({title: "", description: "", start: "", end: ""});
            await loadElections();
        } catch (err) {
            console.error(err);
            toast.error(handleError(err));
        }
    }

    async function handleEdit(election) {
        const now = Math.floor(Date.now() / 1000);

        if (election.start <= now && election.end >= now) {
            return toast.error("Cannot edit — election has already started.");
        }

        if (election.end < now) {
            return toast.error("Cannot edit — election is already completed.");
        }

        setEditingElection(election);
        setForm({
            title: election.title,
            description: election.description,
            start: new Date(election.start * 1000).toISOString().slice(0, 16),
            end: new Date(election.end * 1000).toISOString().slice(0, 16),
        });
        setModalOpen(true);
    }

    async function handleDelete(election) {
        const now = Math.floor(Date.now() / 1000);

        if (!isOwner) return toast.error("Unauthorized");

        if (election.start <= now && election.end >= now) {
            return toast.error("Cannot delete — election has already started.");
        }

        if (election.end < now) {
            return toast.error("Cannot delete — election is already completed.");
        }

        if (election.candidateCount > 0) {
            return toast.error("Cannot delete — candidates already added.");
        }

        const result = await Swal.fire({
            title: "Delete Election?",
            text: `Are you sure you want to delete "${election.title}"? This action cannot be undone.`,
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
            const tx = await contract.deleteElection(election.id);
            Swal.fire({
                title: "Deleting...",
                text: "Please wait while the election is being deleted.",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            await tx.wait();
            Swal.close();
            await Swal.fire("Deleted!", "The election was successfully deleted.", "success");
            await loadElections();
        } catch (err) {
            console.error(err);
            Swal.fire("Error", handleError(err), "error");
        }
    }


    const totalElections = elections.length;
    const activeElections = elections.filter((e) => e.start <= now && e.end >= now).length;
    const completedElections = elections.filter((e) => e.end < now).length;

    return (
        <>
            <div className="space-y-6">
                <div className="grid sm:grid-cols-3 gap-4">
                    <SummaryCard title="Total Elections" value={totalElections} subtitle="All time"/>
                    <SummaryCard title="Active Elections" value={activeElections} subtitle="Currently running"/>
                    <SummaryCard title="Completed Elections" value={completedElections} subtitle="Finished"/>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div
                        className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-3 md:space-y-0">
                        <div>
                            <h2 className="text-2xl font-semibold leading-none tracking-tight">Manage Elections</h2>
                            <p className="text-sm text-muted-foreground">Create and manage voting elections</p>
                        </div>
                        {isOwner && (
                            <button
                                onClick={() => {
                                    setEditingElection(null);
                                    setForm({title: "", description: "", start: "", end: ""});
                                    setModalOpen(true);
                                }}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full md:w-auto justify-center"
                            >
                                <Plus size={18}/> Create Election
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="text-gray-500">Loading elections...</div>
                    ) : elections.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No elections created yet. Create your
                            first
                            election to get started.</div>
                    ) : (
                        <div className="relative w-full overflow-auto">
                            <table className="min-w-full text-sm border-t border-gray-100">
                                <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-4 py-2 text-left">Title</th>
                                    <th className="px-4 py-2 text-left">Status</th>
                                    <th className="px-4 py-2 text-left">Start Date</th>
                                    <th className="px-4 py-2 text-left">End Date</th>
                                    <th className="px-4 py-2 text-left">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {elections.map((el) => {
                                    const status =
                                        el.start > now
                                            ? "Pending"
                                            : el.end < now
                                                ? "Completed"
                                                : "Active";
                                    return (
                                        <tr key={el.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-2 font-medium">{el.title}</td>
                                            <td className="px-4 py-2">
                                                <span
                                                    className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                                                        status === "Active"
                                                            ? "bg-green-100 text-green-700"
                                                            : status === "Completed"
                                                                ? "bg-gray-200 text-gray-700"
                                                                : "bg-orange-100 text-orange-700"
                                                    }`}
                                                >
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                {format(new Date(el.start * 1000), "MM/dd/yyyy")}
                                            </td>
                                            <td className="px-4 py-2">
                                                {format(new Date(el.end * 1000), "MM/dd/yyyy")}
                                            </td>
                                            <td className="px-4 py-2 flex items-center gap-3">
                                                {isOwner && (el.start > now || el.candidateCount === 0) && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(el)}
                                                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 rounded-md px-3 mr-2 text-blue-600 hover:bg-blue-600 hover:text-white"
                                                        >
                                                            <Edit2 size={16}/>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(el)}
                                                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 rounded-md px-3 text-red-600 hover:bg-red-600 hover:text-white"
                                                        >
                                                            <Trash2 size={16}/>
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {modalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 relative">
                        <button
                            onClick={() => setModalOpen(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                        >
                            <X size={18}/>
                        </button>

                        <h3 className="text-lg font-semibold mb-1">
                            {editingElection ? "Edit Election" : "Create New Election"}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            {editingElection ? "Update the election details below" : "Fill in the details to create a new election"}
                        </p>

                        <form onSubmit={handleCreateOrEdit} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="title" className="text-sm text-gray-600">
                                    Election Title
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    placeholder="e.g., Departmental President"
                                    className="w-full p-2 border rounded-lg"
                                    value={form.title}
                                    onChange={(e) => setForm({...form, title: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="description" className="text-sm text-gray-600">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    placeholder="Describe the election purpose and positions"
                                    className="w-full p-2 border rounded-lg"
                                    rows="3"
                                    value={form.description}
                                    onChange={(e) => setForm({...form, description: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label htmlFor="startDate" className="text-sm text-gray-600">
                                        Start Date
                                    </label>
                                    <input
                                        id="startDate"
                                        type="datetime-local"
                                        className="w-full p-2 border rounded-lg"
                                        value={form.start}
                                        onChange={(e) => setForm({...form, start: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="endDate" className="text-sm text-gray-600">
                                        End Date
                                    </label>
                                    <input
                                        id="endDate"
                                        type="datetime-local"
                                        className="w-full p-2 border rounded-lg"
                                        value={form.end}
                                        onChange={(e) => setForm({...form, end: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                >
                                    {editingElection ? "Update Election" : "Create Election"}
                                </button>
                            </div>
                        </form>

                        {status && <p className="text-sm mt-3 text-gray-600">{status}</p>}
                    </div>
                </div>
            )}
        </>
    );
}

function SummaryCard({title, value, subtitle}) {
    return (
        <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm text-gray-500">{title}</h3>
                <Users className="h-4 w-4 text-muted-foreground"/>
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground">{subtitle}</div>
        </div>
    );
}