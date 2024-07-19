<template>
  <div class="page-container">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item>审核管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{
        orderType == 0 ? "挂牌公告" : "竞价公告"
      }}</el-breadcrumb-item>
      <el-breadcrumb-item>订单区块链流转图</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="main-container">
      <div class="content-container">
        <div style="display: flex; justify-content: space-between">
          <el-button type="primary" size="medium" plain @click="exportImage"
            >导出树图图片</el-button
          >
        </div>
        <Tree
          v-if="treeData"
          ref="treeRef"
          :options="options"
          :tree-data="treeData"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Tree from "@/components/G6/tree.vue";
import { rectStyle } from "@/components/G6/treeStyle.js";
import listingIcon from "@/assets/icons/挂牌订单.svg";
import biddingIcon from "@/assets/icons/竞价订单.svg";

export default {
  components: { Tree },
  data() {
    return {
      orderId: undefined,
      orderType: undefined,
      orderDetailData: undefined,
      options: undefined,
      treeData: undefined,
      maxTreeOptionWidth: 0, //树节点的最大宽度
      maxChildrenLen: 0, //树的做多子节点数
      businessNameMap: {},
    };
  },
  created() {
    this.getDetailData();
  },
  methods: {
    // 获取订单详情
    getDetailData() {
      this.orderDetailData = {
        orderBaseInfo: {
          orderBaseId: 1408099331710976,
          tradeType: 0,
          orderName: "快速订单-广元2",
          varietyId: 1,
          place: "110000,",
          coalTarget:
            '[{"name":"发热量：","value":"7000Kcal/kg"},{"name":"灰分：","value":"≤12.5%"},{"name":"硫分：","value":"≤0.65%"},{"name":"抗碎强度：","value":"＞82%"},{"name":"耐磨强度：","value":"≤7.5%"},{"name":"反应性：","value":"≤28%"},{"name":"反应后强度：","value":"≥62%"},{"name":"挥发分：","value":"≤1.5%"},{"name":"焦末含量：","value":"入库≤5.0   出库≤7.0"}]',
          pickUpMethod: "2",
          transportType: "",
          isSplit: 1,
          unitPurchase: 100,
          deliveryPlace: "120000,120100,",
          detailAddress: "xxx",
          deliveryStartTime: "2024-06-25",
          deliveryEndTime: "2024-06-28",
          validityStartTime: "2024-06-20",
          validityEndTime: "2024-06-23",
          isTransfer: 1,
          totalTransferNum: 0,
          transferedNum: 0,
          bondType: 1,
          bondValue: "1",
          isDeleted: 0,
          createTime: "2024-06-20 16:14:14",
          updateTime: "2024-06-20 16:14:53",
          orderStatus: 1,
          delayedNumber: 0,
          zoneId: "03",
          deliveryMark: 1,
          orderOrder: "001",
        },
        order: {
          orderId: "2024062058454974938",
          orderBaseId: 1408099331710976,
          orderType: 0,
          publishTime: "2024-06-20 16:14:53",
          status: 9,
          publisherSignStatus: 0,
          buyerSignStatus: 0,
          buyOrderStatus: 0,
          publishOrderStatus: 0,
          transfered: 0,
          isBuyOrder: 0,
          buyNum: 300,
          remainNum: 200,
          transferredNum: 0,
          isDeleted: 0,
          createTime: "2024-06-20 16:14:14",
          updateTime: "2024-06-20 16:25:29",
          unitPrice: "100",
          totalNum: 500,
          remark: "",
          createBy: 1390118054912000,
          totalTransferNum: 0,
          transferedNum: 0,
          bidId: -1,
          transactionStatus: 1,
          transferStatus: 2,
          contractName: "Listing",
          contractAddress: "0x2aFE5EdAd7e82d45fE9035C84B6Ae7a51A9CbD78",
          isOriginalOrder: 0,
          pricingMethod: 1,
        },
        announceName:
          "测试企业liuhp原煤挂牌预售订单发售预告（2024062058454974938）",
        createUser: "liuhp",
        businessName: "测试企业liuhp",
        mainBusinessName: "测试企业liuhp",
        varietyName: "原煤",
        publisherInfo: {
          orderMemberId: 1390526150033408,
          userId: 1390118054912000,
          businessName: "测试企业liuhp",
        },
        buyerInfo: {},
        successfulCoVos: [
          {
            businessName: "山东建河商贸有限公司",
            buyNum: 100,
            buyPrice: "100",
            orderId: "2024062058614617471",
            mainShopId: "2024062058454974938",
            shopId: "2024062058454974938",
            confirmTransactioTime: "2024-06-20 16:17:18",
            totalPrice: "10000",
          },
          {
            businessName: "北京四海煤业集团",
            buyNum: 100,
            buyPrice: "100",
            orderId: "2024062058573560374",
            mainShopId: "2024062058454974938",
            shopId: "2024062058454974938",
            confirmTransactioTime: "2024-06-20 16:16:33",
            totalPrice: "10000",
          },
          {
            businessName: "北京四海煤业集团",
            buyNum: 100,
            buyPrice: "100",
            orderId: "2024062058528749814",
            mainShopId: "2024062058454974938",
            shopId: "2024062058454974938",
            confirmTransactioTime: "2024-06-20 16:15:53",
            totalPrice: "10000",
          },
        ],
        publisherWalletAddress: "0xb5975e8294cc49347669dcea994293a37705f22f",
      };
      let { order } = this.orderDetailData;
      this.orderType = order.orderType;
      this.orderId = order.orderId;
      let data = {
        orderId: "2024062058454974938",
        parent: "2024062058454974938",
        owner: "0xB5975e8294Cc49347669dcEa994293a37705F22f",
        portion: 5,
        residue: 2,
        unitPrice: 100,
        listing: true,
        childNum: 3,
        depth: 0,
        timestamp: 1718871284,
        children: [
          {
            orderId: "2024062058528749814",
            parent: "2024062058454974938",
            owner: "0xfE5fE1556F824a445118c9b84CD76cE35aDBFC63",
            portion: 1,
            residue: 1,
            unitPrice: 100,
            listing: false,
            childNum: 0,
            depth: 1,
            timestamp: 1718871344,
          },
          {
            orderId: "2024062058573560374",
            parent: "2024062058454974938",
            owner: "0xfE5fE1556F824a445118c9b84CD76cE35aDBFC63",
            portion: 1,
            residue: 1,
            unitPrice: 100,
            listing: false,
            childNum: 0,
            depth: 1,
            timestamp: 1718871384,
          },
          {
            orderId: "2024062058614617471",
            parent: "2024062058454974938",
            owner: "0x9f548Cb9356Eeac0607647d62142e7aacB0ce70A",
            portion: 1,
            residue: 0,
            unitPrice: 100,
            listing: false,
            childNum: 1,
            depth: 1,
            timestamp: 1718871429,
            children: [
              {
                orderId: "2024062058682806660",
                parent: "2024062058614617471",
                owner: "0x9f548Cb9356Eeac0607647d62142e7aacB0ce70A",
                portion: 1,
                residue: 0,
                unitPrice: 100,
                listing: true,
                childNum: 1,
                depth: 2,
                timestamp: 1718871495,
                children: [
                  {
                    orderId: "2024062058750259229",
                    parent: "2024062058682806660",
                    owner: "0xfE5fE1556F824a445118c9b84CD76cE35aDBFC63",
                    portion: 1,
                    residue: 0,
                    unitPrice: 100,
                    listing: false,
                    childNum: 1,
                    depth: 3,
                    timestamp: 1718871565,
                    children: [
                      {
                        orderId: "2024062059108325246",
                        parent: "2024062058750259229",
                        owner: "0xfE5fE1556F824a445118c9b84CD76cE35aDBFC63",
                        portion: 1,
                        residue: 1,
                        unitPrice: 100,
                        listing: true,
                        childNum: 0,
                        depth: 4,
                        timestamp: 1718871920,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };
      this.rootDataHandle(data);
    },
    // 处理root数据
    rootDataHandle(rootData) {
      let data = this.formatChartsData(rootData);
      // 传递给Tree组件的数据格式--返回数据格式是对象类型
      this.treeData = data;
      this.setOptions();
    },
    //格式化树图数据
    formatChartsData(data) {
      if (!data) return;
      if (!this.orderDetailData)
        return this.$message.error("获取订单详情失败，请刷新页面重试！");
      const { varietyName, orderBaseInfo, order } = this.orderDetailData;
      let obj = {};
      for (let key in data) {
        if (key === "children") {
          this.maxChildrenLen = Math.max(
            this.maxChildrenLen,
            data.children.length
          );
          obj.children = [];
          for (let i = 0; i < data.children.length; i++) {
            obj.children.push(this.formatChartsData(data.children[i]));
          }
          continue;
        }
        //没有children的情况
        // this.getOrderBusinessName(data.owner);
        this.maxChildrenLen = Math.max(this.maxChildrenLen, 1);
        data[key] =
          typeof data[key] === "bigint"
            ? Number(data[key].toString())
            : data[key];

        obj.id = `${data.orderId}-${data.parent}-${data.depth + 1}`;
        // 预购/预售
        obj.isSelling = data.listing;
        // 总量
        obj.totalNum = orderBaseInfo.unitPurchase
          ? data.portion * orderBaseInfo.unitPurchase
          : order.totalNum;
        // 剩余数量
        obj.remainNum = orderBaseInfo.isSplit
          ? data.residue * orderBaseInfo.unitPurchase
          : data.residue * order.totalNum;
        // orderType 0:挂牌公告 1:竞价公告
        obj.orderType = data.orderType;
        // label===>name简化版
        if (obj.orderType == 0) {
          obj.img = listingIcon;
        } else {
          obj.img = biddingIcon;
        }
        obj.labels = `订单代码：${data.orderId}`;
        if (key === "orderId") {
          // 格式不需要调整
          obj.name = `订单代码：${data.orderId}${
            data.depth == 0 ? "\n品种：" + varietyName : ""
          }\n价格：${data.unitPrice} (元/吨)\n数量：${
            obj.totalNum
          } (吨) \n剩余：${obj.remainNum} (吨)
          \n类型：${
            data.orderType && data.orderType == 1
              ? "竞价"
              : data.listing
              ? "挂牌"
              : "摘牌"
          }
          \n持有者：${data.owner}\n时间：${
            data.timestamp ? this.TimeDate(data.timestamp) : order.createTime
          }`;
        }
        if (key === "portion") {
          obj.value = data.portion;
        }
        obj[key] = data[key];
      }
      return obj;
    },
    getOrderBusinessName(address) {
      if (!address) return;
      console.log("getOrderBusinessName:", this.businessNameMap[address]);
      if (this.businessNameMap[address]) return;
      this.businessNameMap[address] = "持有者请求中...";
      order
        .getOrderBusinessName({ address })
        .then((res) => {
          this.businessNameMap[address] = res.data.businessName;
        })
        .catch((err) => {
          console.log("getOrderBusinessNameErr:", err);
          this.businessNameMap[address] = "持有者请求失败";
        });
    },
    // 设置树图配置
    setOptions() {
      const self = this;
      // 自定义节点
      this.$G6.registerNode(
        "tree-node",
        {
          drawShape: (cfg, group) => {
            const rect = group.addShape("rect", {
              attrs: {
                fill: "#f0f2f6",
                stroke:
                  cfg.remainNum / cfg.totalNum == 0
                    ? "#606266"
                    : rectStyle[cfg.depth % 5].stroke,
                x: 0,
                y: 0,
                width: 1,
                height: 1,
              },
              name: "rect-shape",
            });
            const rect2 = group.addShape("rect", {
              attrs: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
              },
              name: "rect-shape",
            });
            const text = group.addShape("text", {
              attrs: {
                text: cfg.labels,
                x: 0,
                y: 0,
                fontSize: 14,
                textAlign: "left",
                lineHeight: 20,
                textBaseline: "middle",
                fill: "#666",
              },
              name: "text-shape",
            });
            const textBox = text.getBBox();
            // 根据订单类型在前两层显示不同的图标
            if (cfg.depth <= 1) {
              group.addShape("image", {
                attrs: {
                  x: -textBox.width / 2,
                  y: -8,
                  width: 16,
                  height: 16,
                  img: cfg.img,
                },
              });
            }
            const hasChildren = cfg.children && cfg.children.length > 0;
            rect.attr({
              x: -textBox.width / 2 - 4,
              y: -textBox.height / 2 - 6,
              width:
                cfg.depth <= 1
                  ? textBox.width + (hasChildren ? 26 : 14) + 20
                  : textBox.width + (hasChildren ? 26 : 14), //12
              height: textBox.height + 12,
            });
            rect2.attr({
              fill:
                cfg.remainNum / cfg.totalNum === 0
                  ? "transparent"
                  : rectStyle[cfg.depth % 5].fill, // 解决rect2渲染问题（为0时有时也会渲染）
              x: -textBox.width / 2 - 4,
              y: -textBox.height / 2 - 6,
              width:
                cfg.depth <= 1
                  ? (textBox.width + (hasChildren ? 26 : 14) + 20) *
                    (cfg.remainNum / cfg.totalNum)
                  : (textBox.width + (hasChildren ? 26 : 14)) *
                    (cfg.remainNum / cfg.totalNum), //12
              height: textBox.height + 12,
            });
            this.maxTreeOptionWidth = Math.max(
              this.maxTreeOptionWidth,
              Math.ceil(rect.attr("width")) + 47
            );
            // 使用不同的形状显示订单的类型 挂牌/摘牌(根据isSelling属性）
            if (cfg.isSelling == true) {
              rect.attr({
                radius: 10,
              });
              rect2.attr({
                radius: 10,
              });
            }
            text.attr({
              x: cfg.depth <= 1 ? -textBox.width / 2 + 20 : -textBox.width / 2,
              y: 0,
            });
            if (hasChildren) {
              group.addShape("marker", {
                attrs: {
                  x:
                    cfg.depth <= 1
                      ? textBox.width / 2 + 32
                      : textBox.width / 2 + 12,
                  y: 0,
                  r: 6,
                  symbol: cfg.collapsed
                    ? this.$G6.Marker.expand
                    : this.$G6.Marker.collapse,
                  stroke: "#666",
                  lineWidth: 2,
                },
                name: "collapse-icon",
              });
            }
            return rect;
          },
          update: undefined,
        },
        "single-shape"
      );
      // 自定义边
      this.$G6.registerEdge(
        "cubic-horizontal-edge",
        {
          afterDraw: (cfg) => {
            let depth = cfg.targetNode._cfg.model.depth;
            cfg.style = {
              stroke: "#A3B1BF",
              lineWidth: 1,
              endArrow:
                depth <= 1
                  ? {
                      path: "M 0,0 L 6,3 L 6,-3 Z",
                      d: 0,
                      fill: "#A3B1BF",
                    }
                  : false,
            };
          },
          update: undefined,
        },
        "cubic-horizontal"
      );
      // tooltip 配置
      const tooltip = new this.$G6.Tooltip({
        offsetX: 10,
        offsetY: 10,
        getContent(e) {
          const outDiv = document.createElement("div");
          outDiv.className = "g6-tooltip";
          let name = e.item.getModel().name;
          let owner = e.item.getModel().owner;
          let ownerName = self.businessNameMap[owner] || "暂无持有者";
          if (name.includes("\n")) {
            let text = "";
            let nameArr = name.split("\n");
            nameArr.forEach((item) => {
              if (item.includes("持有者")) {
                text += `<p>持有者：${ownerName}</p>`;
              } else {
                text += `<p>${item}</p>`;
              }
            });
            outDiv.innerHTML = text;
          } else {
            outDiv.innerHTML = name;
          }
          return outDiv;
        },
        itemTypes: ["node"],
      });
      //树图配置
      this.options = {
        maxZoom: 2,
        minZoom: 0.6,
        fitView: true, //让画布内容适应视口
        fitCenter: true, //将图适配到画布中心
        linkCenter: false, //边的连接点在中心
        plugins: [tooltip],
        modes: {
          default: [
            // 缩放
            {
              type: "collapse-expand",
              onChange: (item, collapsed) => {
                const data = item.get("model");
                // 获取图形实例
                const graph = this.$refs.treeRef.graphInstance;
                graph.updateItem(item, {
                  collapsed,
                });
                data.collapsed = collapsed;
                return true;
              },
            },
            "drag-canvas", // 拖拽
            // 'zoom-canvas' // 缩放
          ],
        },
        defaultNode: {
          type: "tree-node",
          shape: "image",
          anchorPoints: [
            // 节点的连接点：边连入节点的相对位置，即节点与其相关边的交点位置
            [0, 0.5],
            [1, 0.5],
          ],
        },
        defaultEdge: {
          type: "cubic-horizontal-edge",
          style: {
            stroke: "#A3B1BF", //线条颜色
          },
        },
        layout: {
          type: "compactBox",
          direction: "LR",
          getHeight: function getHeight() {
            return 100;
          },
          getWidth: () => {
            // 半动态宽度--树的extend为3，固定值200差不多，但是树的extend为4时，部分边得箭头有点歪
            // 经测试，*50比较合适
            return this.maxChildrenLen > 3 ? this.maxChildrenLen * 50 : 200;
          },
          getVGap: function getVGap() {
            return 5;
          },
          getHGap: () => {
            return 80;
          },
        },
      };
    },
    //树图导出图片
    exportImage() {
      let graph = this.$refs.treeRef.graphInstance;
      graph.downloadFullImage(`${this.orderId}订单流转图`, "image/png", {
        backgroundColor: "#fff",
        padding: 20,
      });
    },
    // 时间戳转换
    TimeDate(now) {
      now = new Date(now * 1000);
      var year = now.getFullYear();
      var month =
        now.getMonth() + 1 < 10 ? `0${now.getMonth() + 1}` : now.getMonth() + 1;
      var date = now.getDate() < 10 ? `0${now.getDate()}` : now.getDate();
      var hour = now.getHours() < 10 ? `0${now.getHours()}` : now.getHours();
      var minute =
        now.getMinutes() < 10 ? `0${now.getMinutes()}` : now.getMinutes();
      var second =
        now.getSeconds() < 10 ? `0${now.getSeconds()}` : now.getSeconds();
      return (
        year +
        "-" +
        month +
        "-" +
        date +
        " " +
        hour +
        ":" +
        minute +
        ":" +
        second
      );
    },
  },
};
</script>

<style lang="less" scoped>
.page-container {
  height: 100%;

  .el-breadcrumb {
    height: 48px;
    padding: 0 24px;
    line-height: 48px;
    background: #fff;
    border-bottom: 1px solid #e5e6eb;
  }

  .main-container {
    height: calc(100% - 48px);
    padding: 20px;
  }

  .operation-container {
    display: flex;
    gap: 16px;
    align-items: center;
    height: 80px;
    margin-bottom: 20px;
    padding: 0 20px;
    background: #fff;
  }

  .content-container {
    position: relative;
    min-height: 600px;
    // height: calc(100% - 100px);
    padding: 20px;
    overflow-x: auto;
    background: #fff;
  }
}
</style>
