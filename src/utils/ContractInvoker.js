import { JsonRpcProvider, Contract, ContractFactory } from 'ethers'
import FhevmInstance from './fhevm'
class ContractInvoker {
  /**
   *
   * @param {*} url - 以太坊节点地址
   * @param {*} contract - 合约abi和bytecode
   * @param {*} wallet - 钱包地址
   * @returns
   */
  constructor(url, contract, wallet) {
    this.provider = new JsonRpcProvider(url)
    this.contract = contract
    this.wallet = wallet
    this.signerAddress = wallet.address
    // 代理实例, 用于实现属性代理, 使得可以直接访问合约实例的属性
    return new Proxy(this, {
      get(target, prop) {
        if (!target.instance) {
          return target[prop]
        }

        if (prop in target) {
          return target[prop]
        }
        if (target.instance) {
          let f = target.instance[prop]
          if (typeof f === 'function') {
            let wrapper = function () {
              let result = f.apply(target.instance, arguments)
              if (result instanceof Promise) {
                return result
                  .then(r => {
                    console.log('call:', prop, 'result:', r)
                    return r
                  })
                  .catch(er => {
                    throw target.getError(er)
                  })
              }
              return result
            }
            return wrapper
          }

          return f
        }
      }
    })
  }

  /**
   * 连接到已部署的合约
   * @param {*} contractAddress
   */
  async connect(contractAddress) {
    this.contractAddress = contractAddress
    this.signer = await this.wallet.connect(this.provider)
    this.instance = new Contract(
      contractAddress,
      this.contract.abi,
      this.signer
    )
    await this.fhevmInit(contractAddress)
  }
  /**
   * 部署合约
   * @param  {...any} args
   * @returns 部署该智能合约的交易tx
   */
  async deploy(...args) {
    if (this.instance) {
      throw new Error('instance is already deployed')
    }
    this.signer = await this.wallet.connect(this.provider)
    const factory = new ContractFactory(
      this.contract.abi,
      this.contract.bytecode,
      this.signer
    )
    let deploy = await factory.deploy(...args)
    this.instance = await deploy.waitForDeployment()
    this.contractAddress = this.instance.target
    await this.fhevmInit(this.instance.target)
    return this.instance.deploymentTransaction()
  }
  /**
   * fhevmInit
   * @param {*} contractAddress
   */
  async fhevmInit(contractAddress) {
    this.fhevmInstance = new FhevmInstance(
      this.provider,
      contractAddress,
      this.signer
    )
    await this.fhevmInstance.init()
    this.token = this.fhevmInstance.getPublicKey(this.instance.target)
  }

  /**
   * 加密金额
   * @param {*} amount
   * @returns
   */
  encrypt32(amount) {
    return this.fhevmInstance.encrypt32(amount)
  }
  encrypt64(amount) {
    return this.fhevmInstance.encrypt64(amount)
  }
  /**
   * 解密重加密后的金额密文
   * @param {*} eAmount
   * @returns
   */
  decrypt(eAmount) {
    let res = this.fhevmInstance.decrypt(this.contractAddress, eAmount)
    // 返回的结果是一个BigInt, 需要转换为Number，金额/数量不会超过Number的限制
    return Number(res)
  }

  getError(oe) {
    console.log('原始错误:', oe)
    try {
      let err = this.instance.interface.parseError(oe)
      console.log('实际错误:', err)
      return err
    } catch (ex) {
      console.log('解析错误失败', ex)
      return ex
    }
  }
}

export default ContractInvoker
