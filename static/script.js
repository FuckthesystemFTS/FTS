const CONTRACT_ADDRESS = "0x1D0e9d68D068d6A6761c72Ebf5f96E993EBE39e6"; 
const ABI = [ /* ABI del contratto NFTS */ ];

let web3;
let account;

async function connectWallet() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            account = accounts[0];
            document.getElementById("wallet-address").innerText = `Connected: ${account}`;
        } catch (error) {
            console.error("Wallet connection failed:", error);
        }
    } else {
        alert("Metamask not detected!");
    }
}

async function buyNFT(tier) {
    if (!account) {
        alert("Connect your wallet first!");
        return;
    }

    const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
    const prices = [0, "20000000000000000000", "50000000000000000000", "100000000000000000000", "500000000000000000000"];
    
    try {
        const tx = await contract.methods.mineNFT(tier, "https://metadata-url.com").send({
            from: account,
            value: prices[tier]
        });
        document.getElementById("status").innerText = "NFT purchased successfully!";
    } catch (error) {
        console.error("Transaction failed:", error);
        document.getElementById("status").innerText = "Transaction failed!";
    }
}
