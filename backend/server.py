from flask import Flask, jsonify, request
from web3 import Web3
import os
from config import POLYGON_RPC, PRIVATE_KEY, DISTRIBUTION_WALLET, FTS_CONTRACT_ADDRESS, ABI_FTS

app = Flask(__name__)

web3 = Web3(Web3.HTTPProvider(POLYGON_RPC))
fts_contract = web3.eth.contract(address=FTS_CONTRACT_ADDRESS, abi=ABI_FTS)

@app.route('/claim', methods=['POST'])
def claim():
    data = request.json
    user_address = data.get("address")
    
    if not user_address:
        return jsonify({"error": "Invalid address"}), 400

    nonce = web3.eth.get_transaction_count(DISTRIBUTION_WALLET)
    txn = fts_contract.functions.claimRewards().build_transaction({
        'from': user_address,
        'gas': 200000,
        'gasPrice': web3.to_wei('50', 'gwei'),
        'nonce': nonce
    })
    
    signed_txn = web3.eth.account.sign_transaction(txn, private_key=PRIVATE_KEY)
    tx_hash = web3.eth.send_raw_transaction(signed_txn.rawTransaction)

    return jsonify({"status": "success", "tx_hash": web3.to_hex(tx_hash)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
