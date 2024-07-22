import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbiItem,
} from 'viem'
import { mnemonicToAccount } from 'viem/accounts'
import { polygon } from 'viem/chains'
import { logger } from './utils/logger'

const CONTRACT_ADDRESS = '0x3a1f862d8323138f14494f9fb50c537906b12b81'
const CLAIM_ABI = 'function requestTokens() external' as const

// Mnemonic
const MNEMONIC = process.env.MNEMONIC || ''
// Polygon RPC
const POLYGON_RPC = process.env.POLYGON_RPC || ''
// Mint amount default is 10,000
const AMOUNT = parseInt(process.env.AMOUNT || '') || 10000

const main = async () => {
  if (!MNEMONIC) {
    throw new Error(
      `Please enter your mnemonic in \`.env.local\`/\`.env.prod\` file`
    )
  }
  const publicClient = createPublicClient({
    chain: polygon,
    transport: http(POLYGON_RPC),
  })
  for (let i = 0; i < AMOUNT; i++) {
    const account = mnemonicToAccount(MNEMONIC, {
      accountIndex: 0,
      addressIndex: 0,
    })
    const walletClient = createWalletClient({
      account,
      chain: polygon,
      transport: http(POLYGON_RPC),
    })
    const { request } = await publicClient.simulateContract({
      account,
      address: CONTRACT_ADDRESS,
      abi: [parseAbiItem(CLAIM_ABI)],
      functionName: 'requestTokens',
    })
    try {
      logger.info(`Claiming account ${i + 1}`)
      const hash = await walletClient.writeContract(request)
      logger.info(`Claiming account ${i + 1} successful!`)
      logger.info(`Transaction Hash: https://polygonscan.com/tx/${hash}`)
    } catch (error) {
      logger.error(
        `Claiming account ${i + 1} failed, error: ${(error as Error).message}`
      )
    }
  }
}

main()
  .then(() => {
    logger.info('Finished')
  })
  .catch((error) => logger.error((error as Error).message))
