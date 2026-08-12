> ## Documentation Index
> Fetch the complete documentation index at: https://docs.arc.io/llms.txt
> Use this file to discover all available pages before exploring further.

# Gas and fees

> Runtime parameters for Arc gas pricing, including base fee bounds, EWMA smoothing, and best practices for submitting transactions.

Arc denominates all transaction fees in
[USDC](/arc/concepts/stablecoin-native-model), the native gas token. The fee
market uses an [EIP-1559](https://eips.ethereum.org/EIPS/eip-1559) pricing model
combined with exponentially weighted moving average (EWMA) smoothing -- a
technique that calculates the base fee from a weighted running average of recent
block utilization, giving more weight to recent blocks and less to older ones.
This produces stable, predictable gas costs.

For the mechanism design behind these parameters, see
[Stable fee design](/arc/concepts/stable-fee-design).

## Fee parameters

| Parameter                      | Value                                             | Notes                                                  |
| :----------------------------- | :------------------------------------------------ | :----------------------------------------------------- |
| **Gas unit**                   | USDC (18 decimals)                                | Native gas accounting precision                        |
| **Pricing model**              | EIP-1559 + EWMA smoothing                         | Replaces per-block recalculation with a moving average |
| **Base fee target**            | \~\$0.01 per transaction                          | Design-time target under normal load                   |
| **Minimum base fee (testnet)** | 20 Gwei                                           | Floor enforced by the protocol                         |
| **Maximum base fee**           | 20,000 Gwei                                       | Hard ceiling that bounds worst-case cost               |
| **Gas throughput**             | 30M gas/block (\~60M gas/sec at 0.5 s block time) | Protocol-level capacity limit                          |
| **Smoothing method**           | EWMA of block utilization                         | Short spikes do not propagate into sudden fee jumps    |

The EWMA smoothing window calculates each new base fee as a weighted blend of
the previous base fee and the latest block's gas utilization ratio. Because
older blocks carry exponentially decreasing weight, short traffic spikes raise
the fee only slightly, and the base fee returns to its target quickly once
utilization normalizes.

<Info>
  The 18-decimal precision listed above applies to Arc's native gas accounting.
  USDC on Arc also provides a standard [ERC-20 interface with 6
  decimals](/arc/references/evm-differences#usdc-as-the-native-gas-token) for
  application-level transfers and balance display. These are not two separate
  tokens -- they share the same underlying balance. See [Contract
  addresses](/arc/references/contract-addresses#usdc) for the ERC-20 address.
</Info>

## Submitting transactions

Follow these practices to ensure timely transaction inclusion on Arc.

### Set an adequate max fee

Set `maxFeePerGas` to at least **20 Gwei**. Transactions submitted below this
floor may remain pending indefinitely or fail outright.

```typescript theme={null}
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://rpc.testnet.arc.io");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const tx = await wallet.sendTransaction({
  to: recipient,
  value: ethers.parseUnits("1", 6), // 1 USDC via native send
  maxFeePerGas: ethers.parseUnits("20", "gwei"),
});
```

Set `maxPriorityFeePerGas` (the EIP-1559 tip) to incentivize sequencer
inclusion. A value of **0 Gwei** is accepted, but a small tip (for example, **1
Gwei**) can improve inclusion time during high-utilization periods.

### Fetch the current base fee

Query the Arc RPC before submitting to get the latest fee data. Two standard
methods are available:

| Method           | Returns                                              | Use case                                                 |
| :--------------- | :--------------------------------------------------- | :------------------------------------------------------- |
| `eth_gasPrice`   | Suggested gas price as a single value                | Quick estimation for simple transactions                 |
| `eth_feeHistory` | Base fee and priority fee history over recent blocks | Fine-grained estimation when you need historical context |

```typescript theme={null}
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://rpc.testnet.arc.io");

// Fetch current gas price
// Returns: hex string (e.g., "0x4a817c800" = 20 Gwei)
const gasPrice: string = await provider.send("eth_gasPrice", []);

// Fetch fee history for the last 5 blocks
// Returns: { baseFeePerGas: string[], gasUsedRatio: number[], reward: string[][] }
const feeHistory = await provider.send("eth_feeHistory", [
  "0x5", // block count
  "latest", // newest block
  [25, 50, 75], // percentiles
]);
```

### Display fees in USDC

Because Arc denominates gas in USDC, surface fee estimates to users in dollar
terms rather than raw Gwei. This avoids confusion and aligns with the
stablecoin-native model.

## Common errors

| Error                                        | Cause                                                                                   | Resolution                                                                                          |
| :------------------------------------------- | :-------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| `transaction underpriced`                    | `maxFeePerGas` is below the 20 Gwei minimum base fee floor                              | Increase `maxFeePerGas` to at least `ethers.parseUnits("20", "gwei")` and resubmit                  |
| `intrinsic gas too low`                      | Gas limit is lower than the intrinsic cost of the transaction                           | Set the gas limit to at least 21,000 for simple transfers; use `eth_estimateGas` for contract calls |
| `insufficient funds for gas * price + value` | The sending account's USDC balance cannot cover both the transfer value and the gas fee | Fund the account with enough USDC to cover the total cost (value + maxFeePerGas x gasLimit)         |

## Monitoring

View real-time gas metrics and recent averages using the
[Arc Gas Tracker](https://testnet.arcscan.app/gas-tracker). The tracker displays
current base fee, historical trends, and per-block utilization.

<Info>
  The parameters on this page reflect the current Arc Testnet configuration.
  Values such as the minimum base fee, maximum base fee, and throughput limits
  may change before mainnet launch.
</Info>
