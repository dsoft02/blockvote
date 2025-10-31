//src/utils/handleError.js
export function handleError(err) {
    console.error("⚠️ Ethers Error:", err);

    if (err.code === 4001 || err.code === "ACTION_REJECTED") {
        return "User rejected the wallet request";
    }

    if (err.info?.error?.message?.includes("ethers-user-denied")) {
        return "User rejected the request";
    }

    if (
        err.message?.includes("Execution prevented because the circuit breaker is open") ||
        err.data?.cause?.isBrokenCircuitError
    ) {
        return "⚡ MetaMask temporarily blocked RPC requests. Please wait a few seconds and try again.";
    }

    if (err.code === -32002) {
        return "⚙️ A wallet connection request is already pending. Open MetaMask to continue.";
    }

    if (err.reason) {
        return err.reason;
    }

    if (err.error?.message?.includes("execution reverted")) {
        return err.error.message.split("execution reverted: ")[1] || "Transaction reverted";
    }

    if (err.message?.includes("execution reverted")) {
        return "Transaction failed: contract conditions not met";
    }

    if (err.message?.includes("network changed")) {
        return "Network changed. Please reconnect your wallet";
    }

    if (err.message?.includes("failed to fetch")) {
        return "Unable to reach blockchain RPC. Check your Hardhat node or internet connection";
    }

    if (err.message?.includes("insufficient funds")) {
        return "Insufficient funds in your wallet";
    }

    if (typeof err === "string") {
        return err;
    }

    if (err.data?.message) {
        return err.data.message;
    }

    return err.message || "An unexpected error occurred";
}
