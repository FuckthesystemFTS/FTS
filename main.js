import { ethers } from "ethers";
import { EthereumProvider } from "@walletconnect/ethereum-provider";

// CONFIGURAZIONI DEL TOKEN E DELLA RETE
const TOKEN_CONTRACT_ADDRESS = "0xF87993C72C40268FF93989810192e575D17CAfb0";
const TOKEN_ABI = [
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function decimals() public view returns (uint8)",
  "function name() public view returns (string)",
  "function symbol() public view returns (string)"
];

const BNB_CHAIN_ID = 56;
const BNB_RPC_URL = "https://bsc-dataseed.binance.org";
const WALLETCONNECT_PROJECT_ID = "d2dbf72ab740e1656b27eefd66a94298";

// ELEMENTI DEL DOM
const connectBtn = document.getElementById("connectBtn");
const statusEl = document.getElementById("status");
const tokenInfoSection = document.getElementById("tokenInfoSection");
const tokenNameEl = document.getElementById("tokenName");
const tokenSymbolEl = document.getElementById("tokenSymbol");
const balanceSection = document.getElementById("balanceSection");
const getBalanceBtn = document.getElementById("getBalanceBtn");
const balanceDisplay = document.getElementById("balanceDisplay");
const transferSection = document.getElementById("transferSection");
const transferForm = document.getElementById("transferForm");
const transferStatus = document.getElementById("transferStatus");

let wcProvider, ethersProvider, signer, tokenContract;

// FUNZIONE: CONNETTI IL WALLET CON WALLETCONNECT V2
async function connectWallet() {
  try {
    statusEl.textContent = "Connecting with WalletConnect v2...";
    const provider = await EthereumProvider.init({
      projectId: WALLETCONNECT_PROJECT_ID,
      chains: [BNB_CHAIN_ID],
      rpcMap: { [BNB_CHAIN_ID]: BNB_RPC_URL }
    });
    await provider.connect();
    ethersProvider = new ethers.providers.Web3Provider(provider);
    signer = ethersProvider.getSigner();
    const network = await ethersProvider.getNetwork();
    if (network.chainId !== BNB_CHAIN_ID) {
      statusEl.textContent = `Connected on chain ${network.chainId} instead of BNB (56).`;
    } else {
      statusEl.textContent = "Connected on BNB Chain!";
    }
    tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, signer);
    tokenInfoSection.style.display = "block";
    balanceSection.style.display = "block";
    transferSection.style.display = "block";
    const [name, symbol] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol()
    ]);
    tokenNameEl.textContent = "Nome: " + name;
    tokenSymbolEl.textContent = "Simbolo: " + symbol;
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Connection failed: " + err.message;
  }
}

// FUNZIONE: MOSTRA IL SALDO DEL TOKEN
async function showBalance() {
  try {
    if (!tokenContract || !signer) {
      alert("Please connect your wallet first.");
      return;
    }
    const address = await signer.getAddress();
    const decimals = await tokenContract.decimals();
    const balance = await tokenContract.balanceOf(address);
    balanceDisplay.textContent = "Saldo FTS: " + ethers.utils.formatUnits(balance, decimals);
  } catch (err) {
    console.error(err);
    alert("Failed to get balance: " + err.message);
  }
}

// FUNZIONE: TRASFERISCI TOKEN
async function transferTokens(e) {
  e.preventDefault();
  try {
    if (!tokenContract) {
      alert("Please connect your wallet first.");
      return;
    }
    const recipient = document.getElementById("recipient").value;
    const amount = document.getElementById("amount").value;
    if (!ethers.utils.isAddress(recipient)) {
      alert("Invalid recipient address.");
      return;
    }
    const decimals = await tokenContract.decimals();
    const parsedAmount = ethers.utils.parseUnits(amount, decimals);
    const tx = await tokenContract.transfer(recipient, parsedAmount);
    transferStatus.textContent = "Transaction sent: " + tx.hash + ". Waiting for confirmation...";
    await tx.wait();
    transferStatus.textContent = "Transaction confirmed!";
  } catch (err) {
    console.error(err);
    transferStatus.textContent = "Error: " + err.message;
  }
}

// EVENT LISTENERS
connectBtn.addEventListener("click", connectWallet);
getBalanceBtn.addEventListener("click", showBalance);
transferForm.addEventListener("submit", transferTokens);
