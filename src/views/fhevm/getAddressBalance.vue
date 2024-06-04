<template>
  <el-form label-width="150px" style="width: 800px">
    <el-form-item>
      <el-button @click="getBalance2">查询接收者余额</el-button>
    </el-form-item>
    <el-form-item v-if="balance" label="接收者余额">
      <el-input v-model="balance" disabled></el-input>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: 'GetAddressBalance',
  props: {
    contract2: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      balance: 0
    }
  },
  methods: {
    async getBalance2() {
      // const token = this.contract2.fhevmInstance.getPublicKey(
      //   this.contract2.target
      // )
      const eBalance2 = await this.contract2.balanceOf(
        this.contract2.signer,
        this.contract2.token.publicKey,
        this.contract2.token.signature
      )
      console.log('eBalance2', eBalance2, this.contract2.token)
      this.balance = parseInt(this.contract2.decrypt(eBalance2))
    }
  }
}
</script>

<style></style>
