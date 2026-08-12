> ## Documentation Index
> Fetch the complete documentation index at: https://docs.arc.io/llms.txt
> Use this file to discover all available pages before exploring further.

# Arc Network

> A purpose-built Layer-1 blockchain for stablecoin-native financial applications with USDC as gas, sub-second deterministic finality, and full EVM compatibility.

Arc is a purpose-built Layer-1 blockchain for stablecoin-native financial
applications, with USDC as gas, sub-second deterministic finality, and full EVM
compatibility. It supports payments, lending, FX, treasury management, and
agentic commerce at scale.

Beyond the network, Arc provides [App Kits](/app-kit) for crosschain payment
workflows, [AI tooling](/ai/mcp) for agent-based development, and a growing
[ecosystem of infrastructure partners](/build#developer-tools).

## Key features

<CardGroup cols={2}>
  <Card title="Stablecoin native model" icon="coins" href="/arc/concepts/stablecoin-native-model">
    USDC is the native gas token. EURC and USYC are natively supported. No
    volatile token required.
  </Card>

  <Card title="Stable fee design" icon="dollar-sign" href="/arc/concepts/stable-fee-design">
    Transaction fees are denominated in USDC, so costs stay predictable
    regardless of market volatility.
  </Card>

  <Card title="Deterministic finality" icon="circle-check" href="/arc/concepts/deterministic-finality">
    Transactions finalize in under one second with no risk of chain
    reorganization.
  </Card>

  <Card title="EVM compatibility" icon="ethereum" href="/arc/references/evm-differences">
    Deploy existing Solidity contracts and use standard Ethereum tooling like
    Hardhat, Foundry, and Viem.
  </Card>

  <Card title="Opt-in privacy" icon="eye-slash" href="/arc/concepts/opt-in-privacy">
    Run Solidity contracts confidentially in Arc Privacy Sector (APS), an opt-in
    execution environment that finalizes alongside the public EVM.
  </Card>

  <Card title="Post-quantum security" icon="shield-halved" href="/arc/concepts/post-quantum-security">
    SLH-DSA-SHA2-128s wallet signatures protect accounts against future quantum
    threats.
  </Card>
</CardGroup>

## Stablecoins on Arc

Arc is designed from the ground up around stablecoins. USDC serves as the native
[gas token](/arc/references/gas-and-fees), EURC enables euro-denominated
transfers, and USYC provides onchain yield. There is no volatile native token.
For details on the dual-interface model, native representations, and supported
assets, see [stablecoin native model](/arc/concepts/stablecoin-native-model).

## Network architecture

Arc separates consensus from execution so each layer can optimize independently
while maintaining full compatibility with the Ethereum ecosystem.

* **[Consensus layer](/arc/concepts/consensus-layer):** Built on Malachite BFT,
  delivering sub-second finality and high throughput across a permissioned
  validator set.
* **[Execution layer](/arc/concepts/execution-layer):** Powered by Reth, a Rust
  Ethereum client that runs the EVM so Solidity contracts, development tools,
  and wallet infrastructure work without modification.

For a complete view of how the layers interact, see the
[system overview](/arc/concepts/system-overview).

## Network details

| **Property**            | **Value**                 |
| ----------------------- | ------------------------- |
| Consensus               | Malachite BFT             |
| Execution environment   | EVM (Osaka hard fork)     |
| Gas token               | USDC                      |
| Block time              | \~0.48 s (testnet)        |
| Chain ID                | 5042002                   |
| Finality                | Deterministic, sub-second |
| Validator participation | Permissioned              |
| Developer access        | Permissionless            |

For RPC endpoints and connection details, see
[RPC endpoints](/arc/references/rpc-endpoints). For deployed contract addresses,
see [contract addresses](/arc/references/contract-addresses). For how Arc
validators are selected and how the network is operated, see
[deployment model](/arc/concepts/deployment-model).

## Start building

Ready to build on Arc? Head to the [Build](/build) section for quickstarts and
tutorials covering smart contract deployment, crosschain bridging, App Kits
workflows, and AI agent integration.
