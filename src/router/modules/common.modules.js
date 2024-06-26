// 可导入多个模块，每个模块对应一个路由模块
// import ordersManageModules from '@/router/modules/orders-manage.modules'
// import supportingServicesModules from '@/router/modules/supporting-services.modules'

export default [
  {
    path: "/home",
    name: "Home",
    component: () => import("@/views/Home.vue"),
  },
  {
    path: "/blockChain",
    name: "BlockChain",
    component: () => import("@/views/fhevm"),
  },
  // {
  //   path: 'orders-manage',
  //   component: () => import('@/views/orders-manage'),
  //   meta: { title: '订单管理', hidden: true },
  //   redirect: 'orders-manage/listing-publish',
  //   children: [...ordersManageModules, ...supportingServicesModules]
  // },
];
