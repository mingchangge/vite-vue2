<template>
  <div>
    <el-form ref="form" label-width="150px" style="width: 800px">
      <el-form-item>
        <div>
          <h1>Fhevmjs Vue Examples</h1>
          <el-button @click="chosen = 0">EncryptedERC20</el-button>
          <el-button @click="chosen = 1">AccessControl</el-button>
        </div>
        <h2>Step 1: Connect Account</h2>
        <el-button :loading="connectedLoading" @click="connect">连接</el-button>
      </el-form-item>
      <div v-if="connected">
        <el-form-item label="已连接账户">
          <el-input v-model="wallet1Invoker.signerAddress" disabled></el-input>
        </el-form-item>
        <el-form-item>
          <h2>Step 2: Deploy Contract</h2>
          <p>The deployment will take a few seconds.</p>
          <el-button :loading="deployedLoading" @click="deploy()"
            >部署合约</el-button
          >
        </el-form-item>

        <div v-if="deployed">
          <el-form-item label="已部署合约地址">
            <el-input v-model="deployedContractAddress" disabled></el-input>
          </el-form-item>
        </div>
      </div>

      <div v-if="chosen === 0">
        <div v-if="deployed">
          <el-form-item label="铸币数量">
            <el-input v-model="supply" type="number" />
          </el-form-item>
          <el-form-item>
            <el-button :loading="mintedLoading" @click="mint(supply)"
              >铸币</el-button
            >
          </el-form-item>
        </div>
        <div v-if="minted">
          <el-form-item label="总供应量">
            <el-input v-model="totalSupply" disabled>
              <template slot="append">RMB</template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <h2>Step 4: Deposit</h2>
            <p>The deposit will take a few seconds.</p>
          </el-form-item>
          <el-form-item label="Deposit">
            <el-col :span="8">
              <el-input
                v-model="amount"
                type="number"
                placeholder="Amount(RMB)"
              />
            </el-col>

            <el-col class="line" :span="4">
              <p style="text-align: center">to</p>
            </el-col>
            <el-col :span="12">
              <el-input
                v-model="wallet2Invoker.signerAddress"
                type="text"
                placeholder="Address"
              />
            </el-col>
          </el-form-item>
          <el-form-item>
            <el-button
              :loading="depositLoading"
              @click="deposit(amount, wallet2Invoker.signerAddress)"
              >Deposit</el-button
            >
          </el-form-item>
          <el-form-item label="余量">
            <el-input v-model="rmb" disabled>
              <template slot="append">RMB</template>
            </el-input>
          </el-form-item>
          <get-address-balance
            :contract2="wallet2Invoker"
          ></get-address-balance>
        </div>
      </div>
      <div v-if="chosen === 1">
        <div v-if="deployed">
          <el-form-item>
            <h2>Step 3: Grant Access</h2>
            <p>
              `function set(uint16) restricted` will be accessible only to the
              role
              <el-input v-model="role" type="number" placeholder="Role ID" />
            </p>
            <p>
              The signer will be assigned to role {{ role }}. The grant will
              take a few seconds.
            </p>
            <el-button @click="grantAccess(role)">Grant</el-button
            ><el-button v-if="granted" @click="revokeAccess()"
              >Revoke</el-button
            >
            <p>
              Let us set the value to
              <el-input
                v-model="val"
                type="number"
                placeholder="Value"
              />.<el-button @click="setValue(val)"> Set </el-button>
            </p>
            <p>The current value is: {{ value }}</p>
          </el-form-item>
        </div>
        <div v-if="granted">
          <el-form-item>
            <h2>Step 4: Revoke Access</h2>
            <p>
              Try to click the `Revoke` el-button and reset the value. You
              should've received the `without permision` notification.
            </p>
          </el-form-item>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script>
import { FunctionFragment, HDNodeWallet, Mnemonic } from "ethers";
import EncryptedERC20 from "@/contracts/EncryptedERC20.json";
import AccessManager from "@/contracts/AccessManager.json";
import AccessControl from "@/contracts/AccessControl.json";
import getAddressBalance from "./getAddressBalance.vue";
import ContractInvoker from "@/utils/ContractInvoker";

export default {
  components: {
    getAddressBalance,
  },
  data() {
    return {
      connected: false,
      deployed: false,
      wallet1Invoker: null,
      wallet2Invoker: null,
      provider: null,
      chosen: 0,
      minted: false,
      connectedLoading: false,
      deployedLoading: false,
      mintedLoading: false,
      depositLoading: false,
      granted: false,
      supply: 1000,
      rmb: 0,
      totalSupply: 0,
      amount: 100,
      role: 0,
      val: 0,
      value: 0,
      fhevmInstance: null,
      fhevmInstance2: null,
      deployedContractAddress: null,
      JSON_RPC_URL: "https://zama.webterren.com",
    };
  },
  computed: {},
  mounted() {
    // 登录后的getInfo接口获取区块链调用地址
    // 目前此页面无需登录，所以使用默认地址
    this.JSON_RPC_URL = "https://zama.webterren.com";
    this.deployedContractAddress = localStorage.getItem("contractTarget");
    if (!this.deployedContractAddress) return;
    this.connect();
    console.log("deployedContractAddress", this.deployedContractAddress);
  },
  methods: {
    async connect() {
      this.connectedLoading = true;
      // 定义JSON-RPC提供者的URL。
      // const JSON_RPC_URL = 'https://zama.webterren.com'
      // 创建一个新的JSON-RPC提供者。
      // this.provider = new JsonRpcProvider(this.JSON_RPC_URL)
      // 从助记词创建一个新的HDNodeWallet实例。
      const mnemonic = Mnemonic.fromPhrase(
        "adapt mosquito move limb mobile illegal tree voyage juice mosquito burger raise father hope layer"
      );
      // 使用提供者连接到钱包。并连接到提供者。
      this.wallet1 = HDNodeWallet.fromMnemonic(mnemonic);
      console.log("HDNodeWallet", this.wallet1);
      this.wallet1Invoker = new ContractInvoker(
        this.JSON_RPC_URL,
        EncryptedERC20,
        this.wallet1
      );

      const mnemonic2 = Mnemonic.fromPhrase(
        "assume table sponsor during chaos road burden comfort great cabin year throw"
      );
      this.wallet2 = HDNodeWallet.fromMnemonic(mnemonic2);
      this.wallet2Invoker = new ContractInvoker(
        this.JSON_RPC_URL,
        EncryptedERC20,
        this.wallet2
      );
      this.connected = true;
      this.deployed = false;
      this.minted = false;
      this.granted = false;
      this.connectedLoading = false;
      // 从本地存储中获取已部署合约地址
      if (this.deployedContractAddress) {
        this.wallet1Invoker.connect(this.deployedContractAddress);
        this.wallet2Invoker.connect(this.deployedContractAddress);
        this.deployed = true;
      }
    },
    // 部署合约
    async deploy() {
      this.deployedLoading = true;
      try {
        if (this.chosen === 0) {
          await this.wallet1Invoker.deploy("Deposit", "RMB");
          this.deployedContractAddress = this.wallet1Invoker.target;
        } else {
          const accessManagerInvoker = new ContractInvoker(
            this.JSON_RPC_URL,
            AccessManager,
            this.wallet1
          );
          await accessManagerInvoker.deploy("Deposit", "RMB");
          this.manager = accessManagerInvoker.instance;
          const accessControlInvoker = new ContractInvoker(
            this.JSON_RPC_URL,
            AccessControl,
            this.manager.target
          );
          await accessControlInvoker.deploy("Deposit", "RMB");
        }
        this.deployedLoading = false;
        this.deployed = true;
        this.minted = false;
        // 连接到合约
        this.wallet2Invoker.connect(this.wallet1Invoker.target);
        localStorage.setItem("contractTarget", this.wallet1Invoker.target);
      } catch (e) {
        alert(e);
        this.deployedLoading = false;
      }
    },

    async mint(amount) {
      this.mintedLoading = true;
      const tx = await this.wallet1Invoker.mint(amount);
      await tx.wait();
      this.totalSupply = parseInt(await this.wallet1Invoker.totalSupply());
      this.minted = true;
      this.mintedLoading = false;
    },

    async getBalance() {
      const eBalance = await this.wallet1Invoker.balanceOf(
        this.wallet1Invoker.signer,
        this.wallet1Invoker.token.publicKey,
        this.wallet1Invoker.token.signature
      );
      this.rmb = parseInt(this.wallet1Invoker.decrypt(eBalance));
    },

    async deposit(amount, address) {
      this.depositLoading = true;
      const eAmount = this.wallet1Invoker.encrypt64(amount);
      // abi中存在transfer(address,bytes)方法和transfer(address,uint256)方法
      // js中没有重载，所以需要使用['transfer(address,bytes)']来调用
      const tx = await this.wallet1Invoker["transfer(address,bytes)"](
        address,
        eAmount
      );
      await tx.wait();
      await this.getBalance();
      this.deposited = true;
      this.depositLoading = false;
    },

    async grantAccess(roleId) {
      await (
        await this.manager.setTargetFunctionRole(
          this.wallet1Invoker.target,
          [FunctionFragment.getSelector("set", ["uint16"])],
          roleId
        )
      ).wait();
      await (
        await this.manager.grantRole(
          roleId,
          this.wallet1Invoker.signer.address,
          0
        )
      ).wait();
      this.granted = true;
    },

    async setValue(val) {
      try {
        await (await this.wallet1Invoker.set(val)).wait();
        this.value = await this.wallet1Invoker.value();
      } catch (e) {
        alert(e);
      }
    },

    async revokeAccess() {
      await (
        await this.manager.revokeRole(
          this.role,
          this.wallet1Invoker.signer.address
        )
      ).wait();
      this.value = await this.wallet1Invoker.value();
      this.granted = false;
    },
  },
};
</script>

<style></style>
