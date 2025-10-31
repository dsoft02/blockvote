//src/pages/VotingPage.jsx
import React, {useEffect, useState} from "react";
import useContract from "../hooks/useContract";
import {Dialog} from "@headlessui/react";
import {Calendar, Users, Info, X, Check, Vote, CheckCircle} from "lucide-react";
import toast from "react-hot-toast";


export default function VotingPage() {
    const {contract, account} = useContract();
    const [elections, setElections] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [selectedElection, setSelectedElection] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        async function loadElections() {
            if (!contract || !account) return;
            const count = await contract.electionCount();
            const total = parseInt(count.toString());
            const list = [];
            for (let i = 1; i <= total; i++) {
                const e = await contract.getElection(i);
                const cand = await contract.getCandidates(i);
                const voted = await contract.hasVotedInElection(i, account);

                list.push({
                    id: e[0].toString(),
                    title: e[1],
                    description: e[2],
                    start: parseInt(e[3].toString()) * 1000,
                    end: parseInt(e[4].toString()) * 1000,
                    candidateCount: cand.length,
                    voted: voted,
                });
            }
            setElections(list);
        }

        loadElections();
    }, [contract, account]);


    function isActive(election) {
        const now = Date.now();
        return now >= election.start && now <= election.end;
    }

    async function openModal(election) {
        const list = await contract.getCandidates(election.id);
        setCandidates(list.map(c => ({
                id: c.id.toString(),
                name: c.name,
                votes: c.voteCount.toString(),
            }))
        );
        setSelectedElection(election.id);
        setShowModal(true);
    }

    async function vote(candidateId) {
        try {
            toast.loading("Submitting vote...");

            const tx = await contract.vote(selectedElection, candidateId);
            await tx.wait();

            toast.dismiss();
            toast.success("Vote cast successfully");

            setShowModal(false);

            const count = await contract.electionCount();
            const total = parseInt(count.toString());
            const list = [];

            for (let i = 1; i <= total; i++) {
                const e = await contract.getElection(i);
                const cand = await contract.getCandidates(i);
                const voted = await contract.hasVotedInElection(i, account);

                list.push({
                    id: e[0].toString(),
                    title: e[1],
                    description: e[2],
                    start: parseInt(e[3].toString()) * 1000,
                    end: parseInt(e[4].toString()) * 1000,
                    candidateCount: cand.length,
                    voted: voted,
                });
            }

            setElections(list);
        } catch (err) {
            toast.dismiss();
            toast.error("Failed to cast vote");
            console.error(err);
        }
    }


    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-2">Voter Dashboard</h1>
            <p className="text-sm text-gray-600 mb-8">View and participate in active elections</p>

            {elections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <Vote className="w-24 h-24 mb-3 text-gray-400"/>
                    <p className="text-lg font-medium">No elections available at the moment</p>
                    <p className="text-sm">Please check back later.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {elections.map((election) => {
                        const active = isActive(election);

                        return (
                            <div key={election.id} className="border rounded-xl p-6 shadow-sm bg-white">
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-lg font-semibold">{election.title}</h2>
                                    <span
                                        className={`text-xs px-3 py-1 rounded-full ${
                                            active ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                        }`}
                                    >
                                      {active ? "Active" : "Upcoming"}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 mb-4">{election.description}</p>

                                <div className="text-sm text-gray-600 space-y-2 mb-5">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4"/>
                                        {new Date(election.start).toLocaleDateString()} -{" "}
                                        {new Date(election.end).toLocaleDateString()}
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                                        <Users className="h-4 w-4"/>
                                        {election.candidateCount} Candidates
                                    </div>
                                </div>

                                {active ? (
                                    election.candidateCount === 0 ? (
                                        <button
                                            disabled
                                            className="w-full py-2 bg-gray-200 text-gray-400 rounded-md cursor-not-allowed"
                                        >
                                            No Candidates
                                        </button>
                                    ) : election.voted ? (
                                        <button
                                            disabled
                                            className="w-full py-2 bg-gray-200 text-gray-500 rounded-md cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4 text-green-600"/>
                                            Voted
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => openModal(election)}
                                            className="w-full py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition"
                                        >
                                            Cast Your Vote
                                        </button>
                                    )
                                ) : (
                                    <button
                                        disabled
                                        className="w-full py-2 bg-gray-200 text-gray-500 rounded-md cursor-not-allowed"
                                    >
                                        Coming Soon
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <Dialog open={showModal} onClose={() => setShowModal(false)} className="relative z-50">
                <div className="fixed inset-0 bg-black/40"></div>
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">

                        <div className="flex items-center justify-between mb-3">
                            <Dialog.Title className="text-xl font-semibold">
                                {elections.find(e => e.id === selectedElection)?.title || "Select Candidate"}
                            </Dialog.Title>

                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700 transition"
                            >
                                <X className="w-5 h-5"/>
                            </button>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center space-x-2 text-blue-800">
                                <Info className="h-5 w-5"/>
                                <span className="font-medium">
                                    Your vote will be encrypted and recorded on the blockchain
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {candidates.map((c) => (
                                <div
                                    key={c.id}
                                    className="flex justify-between items-center border rounded-md p-3"
                                >
                                    <span className="font-medium">{c.name}</span>
                                    <button
                                        onClick={() => vote(c.id)}
                                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
                                    >
                                        <Check className="w-4 h-4"/>
                                        Vote
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowModal(false)}
                            className="mt-5 w-full py-2 text-gray-600 border rounded-md hover:bg-gray-100"
                        >
                            Close
                        </button>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </div>
    );
}
