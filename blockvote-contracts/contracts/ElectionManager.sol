//contracts/ElectionManager.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ElectionManager {
    address public admin;
    uint public electionCount;
    uint public voterCount;

    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    struct Election {
        uint id;
        string title;
        string description;
        uint startTime;
        uint endTime;
        uint candidateCount;
        mapping(uint => Candidate) candidates;
        mapping(address => bool) hasVoted;
    }

    struct Voter {
        string name;
        string matricNo;
        address wallet;
        bool isVerified;
        bool hasVoted;
    }

    struct ElectionSummary {
        uint id;
        string title;
        string description;
        uint startTime;
        uint endTime;
        uint candidateCount;
    }

    mapping(uint => Election) public elections;
    mapping(address => Voter) public voters;
    mapping(string => address) public matricToWallet;
    address[] private voterAddresses;

    event ElectionCreated(uint electionId, string title);
    event CandidateAdded(uint electionId, uint candidateId, string name);
    event VoterRegistered(address voter, string matricNo);
    event VoterVerified(address voter);
    event VoteCasted(uint electionId, address voter, uint candidateId);
    event ElectionEnded(uint electionId, uint endTime);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only authorized user can perform this action");
        _;
    }

    modifier onlyVerified() {
        require(voters[msg.sender].isVerified, "You are not a verified voter");
        _;
    }

    modifier electionExists(uint _electionId) {
        require(_electionId > 0 && _electionId <= electionCount, "Election does not exist");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // ========================
    // ADMIN FUNCTIONS
    // ========================
    function createElection(
        string memory _title,
        string memory _description,
        uint _startTime,
        uint _endTime
    ) public onlyAdmin {
        require(bytes(_title).length > 0, "Title required");
        require(_endTime > _startTime, "Invalid time range");

        electionCount++;
        Election storage e = elections[electionCount];
        e.id = electionCount;
        e.title = _title;
        e.description = _description;
        e.startTime = _startTime;
        e.endTime = _endTime;

        emit ElectionCreated(electionCount, _title);
    }

    function updateElection(
        uint _electionId,
        string memory _title,
        string memory _description,
        uint _startTime,
        uint _endTime
    ) public onlyAdmin electionExists(_electionId) {
        Election storage e = elections[_electionId];
        require(block.timestamp < e.startTime, "Election already started");
        require(_endTime > _startTime, "Invalid time range");

        e.title = _title;
        e.description = _description;
        e.startTime = _startTime;
        e.endTime = _endTime;
    }

    function deleteElection(uint _electionId) public onlyAdmin electionExists(_electionId) {
        Election storage e = elections[_electionId];
        require(block.timestamp < e.startTime, "Election already started");
        require(e.candidateCount == 0, "Election already has candidates");

        delete elections[_electionId];
    }

    function addCandidate(uint _electionId, string memory _name) public onlyAdmin electionExists(_electionId) {
        require(bytes(_name).length > 0, "Candidate name required");
        Election storage e = elections[_electionId];
        e.candidateCount++;
        e.candidates[e.candidateCount] = Candidate({
            id: e.candidateCount,
            name: _name,
            voteCount: 0
        });

        emit CandidateAdded(_electionId, e.candidateCount, _name);
    }

    function updateCandidate(
        uint _electionId,
        uint _candidateId,
        string memory _name
    ) public onlyAdmin electionExists(_electionId) {
        require(bytes(_name).length > 0, "Candidate name required");

        Election storage e = elections[_electionId];
        require(block.timestamp < e.startTime, "Cannot edit election already started");
        require(_candidateId > 0 && _candidateId <= e.candidateCount, "Invalid candidate");

        e.candidates[_candidateId].name = _name;
    }

    function deleteCandidate(uint _electionId, uint _candidateId) public onlyAdmin electionExists(_electionId) {
        Election storage e = elections[_electionId];
        require(block.timestamp < e.startTime, "Cannot delete election already started");
        require(_candidateId > 0 && _candidateId <= e.candidateCount, "Invalid candidate");

        // shift candidates down to maintain contiguous IDs
        for (uint i = _candidateId; i < e.candidateCount; i++) {
            e.candidates[i] = e.candidates[i + 1];
            e.candidates[i].id = i; // update id
        }

        delete e.candidates[e.candidateCount];
        e.candidateCount--;
    }

    function verifyVoter(address _voterAddr) public onlyAdmin {
        Voter storage v = voters[_voterAddr];
        require(bytes(v.matricNo).length > 0, "Voter not registered");
        v.isVerified = true;
        emit VoterVerified(_voterAddr);
    }

    function endElectionEarly(uint _electionId)
    public
    onlyAdmin
    electionExists(_electionId)
    {
        Election storage e = elections[_electionId];
        require(block.timestamp < e.endTime, "Election already ended");
        e.endTime = block.timestamp;
        emit ElectionEnded(_electionId, e.endTime);
    }

    // ========================
    // VOTER FUNCTIONS
    // ========================
    function registerVoter(string memory _name, string memory _matricNo) public {
        require(bytes(_name).length > 0, "Name required");
        require(bytes(_matricNo).length > 0, "Matric number required");
        require(matricToWallet[_matricNo] == address(0), "Matric number already registered");
        require(bytes(voters[msg.sender].matricNo).length == 0, "Already registered");

        voters[msg.sender] = Voter({
            name: _name,
            matricNo: _matricNo,
            wallet: msg.sender,
            isVerified: false,
            hasVoted: false
        });
        matricToWallet[_matricNo] = msg.sender;
        voterAddresses.push(msg.sender);
        voterCount++;

        emit VoterRegistered(msg.sender, _matricNo);
    }

    function vote(uint _electionId, uint _candidateId)
    public
    electionExists(_electionId)
    {
        Election storage e = elections[_electionId];
        Voter storage v = voters[msg.sender];

        require(v.isVerified, "Voter not verified");
        require(block.timestamp >= e.startTime, "Election has not started");
        require(block.timestamp <= e.endTime, "Election has ended");
        require(!e.hasVoted[msg.sender], "You already voted in this election");
        require(_candidateId > 0 && _candidateId <= e.candidateCount, "Invalid candidate");

        e.candidates[_candidateId].voteCount++;
        e.hasVoted[msg.sender] = true;
        v.hasVoted = true;

        emit VoteCasted(_electionId, msg.sender, _candidateId);
    }

    // ========================
    // VIEW FUNCTIONS
    // ========================
    function getElection(uint _id)
    public
    view
    electionExists(_id)
    returns (
        uint id,
        string memory title,
        string memory description,
        uint startTime,
        uint endTime,
        uint candidateCount
    )
    {
        Election storage e = elections[_id];
        return (e.id, e.title, e.description, e.startTime, e.endTime, e.candidateCount);
    }

    function getCandidate(uint _electionId, uint _candidateId)
    public
    view
    electionExists(_electionId)
    returns (uint, string memory, uint)
    {
        Candidate storage c = elections[_electionId].candidates[_candidateId];
        return (c.id, c.name, c.voteCount);
    }

    function getCandidates(uint _electionId)
    public
    view
    electionExists(_electionId)
    returns (Candidate[] memory)
    {
        Election storage e = elections[_electionId];
        Candidate[] memory list = new Candidate[](e.candidateCount);
        for (uint i = 1; i <= e.candidateCount; i++) {
            Candidate storage c = e.candidates[i];
            list[i - 1] = c;
        }
        return list;
    }

    function getCandidatesWithLock(uint _electionId)
    public
    view
    electionExists(_electionId)
    returns (Candidate[] memory, bool electionLocked)
    {
        Election storage e = elections[_electionId];
        Candidate[] memory list = new Candidate[](e.candidateCount);
        for (uint i = 1; i <= e.candidateCount; i++) {
            list[i - 1] = e.candidates[i];
        }
        bool locked = block.timestamp >= e.startTime && block.timestamp <= e.endTime || block.timestamp > e.endTime;
        return (list, locked);
    }

    function getResults(uint _electionId)
    public
    view
    electionExists(_electionId)
    returns (Candidate[] memory)
    {
        Election storage e = elections[_electionId];
        Candidate[] memory results = new Candidate[](e.candidateCount);
        for (uint i = 1; i <= e.candidateCount; i++) {
            results[i - 1] = e.candidates[i];
        }
        return results;
    }

    function getAllElections()
    public
    view
    returns (ElectionSummary[] memory)
    {
        ElectionSummary[] memory list = new ElectionSummary[](electionCount);
        for (uint i = 1; i <= electionCount; i++) {
            Election storage e = elections[i];
            list[i - 1] = ElectionSummary({
                id: e.id,
                title: e.title,
                description: e.description,
                startTime: e.startTime,
                endTime: e.endTime,
                candidateCount: e.candidateCount
            });
        }
        return list;
    }

    function getVoter(address _wallet)
    public
    view
    returns (string memory name, string memory matricNo, address wallet, bool isVerified, bool hasVoted)
    {
        Voter storage v = voters[_wallet];
        return (v.name, v.matricNo, v.wallet, v.isVerified, v.hasVoted);
    }

    function getAllVoters()
    public
    view
    returns (Voter[] memory)
    {
        Voter[] memory list = new Voter[](voterAddresses.length);
        for (uint i = 0; i < voterAddresses.length; i++) {
            list[i] = voters[voterAddresses[i]];
        }
        return list;
    }

    function isVoterVerified(address _wallet) public view returns (bool) {
        return voters[_wallet].isVerified;
    }

    function hasVoterVoted(address _wallet) public view returns (bool) {
        return voters[_wallet].hasVoted;
    }

    function hasVotedInElection(uint _electionId, address _wallet)
    public
    view
    returns (bool)
    {
        return elections[_electionId].hasVoted[_wallet];
    }

}
