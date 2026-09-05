# 原版服务图标的 3D 几何化

## 同一矢量源

`src/icons/originalIconRegistry.js` 保存 17 种线性图标的本地 path、viewBox、线宽与 18 项服务映射：

- 2D 列表、搜索与详情通过 `ServiceIcon` 直接渲染原 SVG。
- 3D 场景通过 `getIconSvgMarkup` 把同一组受信矢量数据交给 `SVGLoader`。
- 不下载外部模型，不使用图片、纹理、CanvasTexture 或 DOM 模拟 3D 图标。

## 3D 构造

- `extrudedIconGeometry.js` 用 `SVGLoader` 解析原始路径。
- 线性 stroke 由 `TubeGeometry` 和圆形端帽建立真实厚度；未来的 fill path 走 `SVGLoader.createShapes + ExtrudeGeometry`。
- 合并后通过 `mergeVertices` 生成带 `position`、`normal` 和 `index` 的缓存 `BufferGeometry`。
- 17 种图标按 high/low 两档各解析一次，两个使用 globe 的服务共享轮廓缓存。
- 18 个服务累计 high 为 11,232 三角形，low 为 5,024 三角形。
- `ExtrudedServiceIcon` 只把实际 Mesh 安装到轻量圆形底座；Drei `Html` 仅用于名称 HUD，不承载图标。
- hover 抬升并增强受光，focus 旋转约 35° 展示侧壁；reduced-motion 保持静态。
- 页面隐藏、场景离屏时暂停；运行时连续慢帧会逐级降低 DPR，必要时回退 2D 服务列表。

## 自动验证

- 每个 geometry 必须有索引、法线与非零 Z 厚度。
- 18 项映射完整，geometry signature 足够区分各轮廓。
- high/low 正视轮廓都与原 SVG 进行像素 IoU 比较。
- 代码括号、云、盾牌等闭合轮廓通过负空间检查。
- E2E 对照图分别输出原 2D icon、3D 正视和 3D 斜视。

## 文案

原版与后加文案的保留/删除清单见 `CONTENT-AUDIT.md`。
