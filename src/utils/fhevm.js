import { AbiCoder } from 'ethers'
import { initFhevm, createInstance, getPublicKeyCallParams } from 'fhevmjs'

class FhevmInstance {
  /**
   * 构造函数
   * @param {*} provider - 以太坊provider
   * @param {*} contractAddress - 合约地址
   * @param {*} signer - 签名者
   * @returns {Proxy<FhevmInstance>}
   */
  constructor(provider, contractAddress, signer) {
    this.provider = provider
    this.signer = signer
    this.contractAddress = contractAddress
    // 代理实例, 用于实现属性代理, 使得可以直接访问合约实例的属性
    return new Proxy(this, {
      get(target, prop) {
        return prop in target ? target[prop] : target.instance[prop]
      }
    })
  }
  /**
   * 初始化FHEVM实例
   */
  async init() {
    await initFhevm()
    this.instance = await this.createFhevmInstance()
    await this.generatePublicKey()
  }

  /**
   * 创建FHEVM实例
   * @returns {Promise<*>}
   * @private
   */
  async createFhevmInstance() {
    const network = await this.provider.getNetwork()
    const chainId = +network.chainId.toString()
    const ret = await this.provider.call(getPublicKeyCallParams())
    const decoded = AbiCoder.defaultAbiCoder().decode(['bytes'], ret)
    const publicKey = decoded[0]
    return await createInstance({ chainId, publicKey })
  }

  /**
   * 生成公钥
   * @returns {Promise<void>}
   * @private
   */
  async generatePublicKey() {
    if (!this.instance.hasKeypair(this.contractAddress)) {
      const { eip712 } = this.instance.generatePublicKey({
        verifyingContract: this.contractAddress
      })
      const signature = await this.signer.signTypedData(
        eip712.domain,
        { Reencrypt: eip712.types.Reencrypt }, // Need to remove EIP712Domain from types
        eip712.message
      )
      this.instance.setSignature(this.contractAddress, signature)
    }
  }
}

export default FhevmInstance
