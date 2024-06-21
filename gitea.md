# yaml 锚点笔记（gitea）

```
name: 构建
on:
  push:
    ## 以下二者是或的关系
    branches:
      - master
    tags:
      - v**
复用锚点: &repeat
  - name: Checkout
    uses: actions/checkout@v3
    with:
      fetch-depth: 15

  - name: Hash Files
    uses: seepine/hash-files@v1
    id: get-hash
    with:
      patterns: |-
        package.json
        package-lock.json

  - name: NPM Cache
    id: npm-cache
    uses: actions/cache@v3
    with:
      key: coal-trade-web-${{ steps.get-hash.outputs.hash }}
      path: ${{ gitea.workspace }}/node_modules

  - name: NPM Install
    if: steps.npm-cache.outputs.cache-hit != 'true'
    run: npm i --registry=http://registry.npmmirror.com

  - name: NPM build
    run: npm run build:${{env.MODE}}

  - name: Build and push the Docker image
    uses: docker/build-push-action@v4
    with:
      context: .
      file: docker/Dockerfile
      push: true
      tags: ghub.webterren.com/coal-trade-web:${{env.docker-tag}}

  - name: set image
    uses: actions-hub/kubectl@master
    env:
      KUBE_CONFIG: ${{ env.kube-config }}
    with:
      args: set image deployment/coal-trade-web coal-trade-web=ghub.webterren.com/coal-trade-web:${{ env.docker-tag }} ${{env.nameSpace}}

  - name: rollout restart
    uses: actions-hub/kubectl@master
    env:
      KUBE_CONFIG: ${{ env.kube-config }}
    with:
      args: rollout restart deployment/coal-trade-web ${{env.nameSpace}}

jobs:
  构建发布开发版:
    if: ${{ gitea.ref_name == 'master' }}
    runs-on: ubuntu-latest
    env:
      MODE: dev
      nameSpace: -n coal-dev
      docker-tag: latest
      kube-config: ${{ secrets.KUBE_CONFIG_DEV }}
    steps: *repeat

  构建发布测试版:
    if: ${{ startsWith(gitea.ref_name, 'v')  && contains(gitea.ref_name, 'rc') }}
    runs-on: ubuntu-latest
    env:
      MODE: staging
      nameSpace: -n coal-staging
      docker-tag: ${{ gitea.ref_name }}
      kube-config: ${{ secrets.KUBE_CONFIG_DEV }}
    steps: *repeat

  构建发布正式版:
    if: ${{ startsWith(gitea.ref_name, 'v')  && !contains(gitea.ref_name, 'rc') }}
    runs-on: ubuntu-latest
    env:
      MODE: prod
      nameSpace: ""
      docker-tag: ${{ gitea.ref_name }}
      kube-config: ${{ secrets.KUBE_CONFIG }}
    steps: *repeat

```
