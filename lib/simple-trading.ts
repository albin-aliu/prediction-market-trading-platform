import { writeContract, readContract } from '@wagmi/core'
import { parseUnits } from 'viem'
import { USDC_ADDRESS, POLYMARKET_EXCHANGE, config } from './web3-config'

// Minimal ERC20 ABI for USDC approval
const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const

/**
 * Check if USDC approval is needed
 */
export async function checkUSDCApproval(
  userAddress: `0x${string}`,
  amount: string
): Promise<boolean> {
  try {
    const amountWei = parseUnits(amount, 6) // USDC has 6 decimals
    
    const allowance = await readContract(config, {
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [userAddress, POLYMARKET_EXCHANGE]
    })

    return allowance >= amountWei
  } catch (error) {
    console.error('Error checking approval:', error)
    return false
  }
}

/**
 * Approve USDC for trading
 */
export async function approveUSDC(amount: string): Promise<`0x${string}`> {
  const amountWei = parseUnits(amount, 6)
  
  const hash = await writeContract(config, {
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [POLYMARKET_EXCHANGE, amountWei]
  })

  return hash
}

/**
 * Simplified order placement
 * In a real implementation, this would interact with Polymarket CLOB
 */
export async function placeOrder(params: {
  marketId: string
  side: 'yes' | 'no'
  amount: string
  price?: string
}): Promise<{ success: boolean; message: string; txHash?: string }> {
  try {
    // For now, just return success
    // In production, this would call Polymarket CLOB API
    return {
      success: true,
      message: `Order placed: ${params.side.toUpperCase()} ${params.amount} shares`,
      txHash: '0x' + '0'.repeat(64) // Mock transaction hash
    }
  } catch (error) {
    console.error('Error placing order:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to place order'
    }
  }
}

