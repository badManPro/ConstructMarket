"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultSearchFilterState = exports.brandFilterOptions = exports.materialFilterOptions = exports.minOrderFilterOptions = exports.priceFilterOptions = exports.sortOptions = exports.relatedCategories = exports.articleEntrances = exports.homeCategoryNav = exports.homeBanners = exports.hotSearchKeywords = void 0;
exports.getHomeSections = getHomeSections;
exports.getFavoriteProducts = getFavoriteProducts;
exports.searchProducts = searchProducts;
exports.getProductDetail = getProductDetail;
exports.getRecommendedProducts = getRecommendedProducts;
const routes_1 = require("../constants/routes");
const baseProducts = [
    {
        id: "p-floor-001",
        spuId: "spu-floor-001",
        skuId: "sku-floor-001",
        name: "工程级仿石纹地砖 800x800",
        cover: "石纹工程砖",
        brand: "匠岩",
        model: "JY-800S",
        price: 128,
        unit: "片",
        minOrderQty: 10,
        salesVolume: 1260,
        stockStatus: "现货",
        tags: ["热卖", "支持开票"],
        supportInvoice: true,
        isFavorite: false,
        categoryId: "tile",
        categoryName: "瓷砖石材",
        material: "stone",
        coverTone: "linear-gradient(135deg, #334155, #64748b)",
    },
    {
        id: "p-floor-002",
        spuId: "spu-floor-002",
        skuId: "sku-floor-002",
        name: "防滑厨卫砖 600x600",
        cover: "防滑厨卫砖",
        brand: "衡筑",
        model: "HZ-600K",
        price: 88,
        unit: "片",
        minOrderQty: 20,
        salesVolume: 860,
        stockStatus: "现货",
        tags: ["防滑", "现货"],
        supportInvoice: true,
        isFavorite: false,
        categoryId: "tile",
        categoryName: "瓷砖石材",
        material: "ceramic",
        coverTone: "linear-gradient(135deg, #0f766e, #14b8a6)",
    },
    {
        id: "p-cement-001",
        spuId: "spu-cement-001",
        skuId: "sku-cement-001",
        name: "42.5R 高标号水泥",
        cover: "高标号水泥",
        brand: "鼎固",
        model: "DG-42.5R",
        price: 39,
        unit: "袋",
        minOrderQty: 50,
        salesVolume: 3420,
        stockStatus: "现货",
        tags: ["工地常备", "销量高"],
        supportInvoice: true,
        isFavorite: false,
        categoryId: "cement",
        categoryName: "水泥辅材",
        material: "cement",
        coverTone: "linear-gradient(135deg, #7c2d12, #ea580c)",
    },
    {
        id: "p-cement-002",
        spuId: "spu-cement-002",
        skuId: "sku-cement-002",
        name: "瓷砖粘结剂 20kg",
        cover: "瓷砖粘结剂",
        brand: "筑稳",
        model: "ZW-TA20",
        price: 62,
        unit: "袋",
        minOrderQty: 20,
        salesVolume: 1480,
        stockStatus: "现货",
        tags: ["粘结加强", "施工稳定"],
        supportInvoice: true,
        isFavorite: false,
        categoryId: "cement",
        categoryName: "水泥辅材",
        material: "mortar",
        coverTone: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
    },
    {
        id: "p-pipe-001",
        spuId: "spu-pipe-001",
        skuId: "sku-pipe-001",
        name: "PPR 冷热水管 4米",
        cover: "冷热水管",
        brand: "川朗",
        model: "CL-PPR20",
        price: 46,
        unit: "根",
        minOrderQty: 30,
        salesVolume: 970,
        stockStatus: "现货",
        tags: ["冷热通用", "家装常用"],
        supportInvoice: true,
        isFavorite: false,
        categoryId: "pipe",
        categoryName: "管材管件",
        material: "pipe",
        coverTone: "linear-gradient(135deg, #1d4ed8, #38bdf8)",
    },
    {
        id: "p-pipe-002",
        spuId: "spu-pipe-002",
        skuId: "sku-pipe-002",
        name: "PVC 排水管 DN110",
        cover: "PVC 排水",
        brand: "稳流",
        model: "WL-PVC110",
        price: 52,
        unit: "根",
        minOrderQty: 20,
        salesVolume: 1320,
        stockStatus: "现货",
        tags: ["排水专用", "抗冲击"],
        supportInvoice: true,
        isFavorite: false,
        categoryId: "pipe",
        categoryName: "管材管件",
        material: "pipe",
        coverTone: "linear-gradient(135deg, #155e75, #06b6d4)",
    },
    {
        id: "p-electric-001",
        spuId: "spu-electric-001",
        skuId: "sku-electric-001",
        name: "LED 工程射灯 12W",
        cover: "工程射灯",
        brand: "曜工",
        model: "YG-DL12",
        price: 76,
        unit: "个",
        minOrderQty: 20,
        salesVolume: 680,
        stockStatus: "现货",
        tags: ["节能", "批量价优"],
        supportInvoice: true,
        isFavorite: false,
        categoryId: "electric",
        categoryName: "电气照明",
        material: "light",
        coverTone: "linear-gradient(135deg, #854d0e, #f59e0b)",
    },
    {
        id: "p-electric-002",
        spuId: "spu-electric-002",
        skuId: "sku-electric-002",
        name: "阻燃 BV 电线 2.5平方",
        cover: "阻燃电线",
        brand: "通安",
        model: "TA-BV25",
        price: 219,
        unit: "卷",
        minOrderQty: 5,
        salesVolume: 540,
        stockStatus: "现货",
        tags: ["阻燃", "家装工程通用"],
        supportInvoice: true,
        isFavorite: false,
        categoryId: "electric",
        categoryName: "电气照明",
        material: "wire",
        coverTone: "linear-gradient(135deg, #831843, #ec4899)",
    },
];
const detailMap = {
    "p-floor-001": {
        ...baseProducts[0],
        gallery: ["大堂铺贴效果", "近景纹理展示", "项目实拍对比"],
        subtitle: "耐磨釉面，适合工程大面积铺贴，哑光石纹更稳重。",
        description: "适合办公楼大堂、商场公共区和工程交付场景。当前版本使用本地 Mock 数据演示商品信息和规格切换。",
        specGroups: [
            { groupName: "表面", options: ["哑光石纹", "浅灰细砂", "深灰岩板"] },
            { groupName: "厚度", options: ["9.5mm", "10.5mm"] },
        ],
        selectedSpecText: "请选择规格",
        params: [
            { key: "吸水率", value: "<0.5%" },
            { key: "适用区域", value: "大堂/公共区域/工程样板间" },
            { key: "包装数量", value: "3片/箱" },
        ],
        serviceTags: ["支持开票", "批量价可谈", "同城配送"],
        shopInfo: { shopId: "shop-01", shopName: "匠岩建材旗舰店", score: 4.8 },
        deliveryDesc: "预计 48 小时内从华东仓发出",
        recommendedIds: ["p-floor-002", "p-cement-002", "p-electric-001"],
    },
    "p-floor-002": {
        ...baseProducts[1],
        gallery: ["厨卫防滑效果", "边缘细节", "批量铺贴示意"],
        subtitle: "湿区防滑等级更高，适合厨卫和功能间。",
        description: "适合厨卫、茶水间和功能辅助区域，支持整批采购。",
        specGroups: [
            { groupName: "颜色", options: ["浅米", "浅灰", "石英白"] },
            { groupName: "表面", options: ["柔光", "防滑面"] },
        ],
        selectedSpecText: "请选择规格",
        params: [
            { key: "适配区域", value: "厨卫/茶水间/后勤区" },
            { key: "防滑等级", value: "R10" },
            { key: "包装数量", value: "4片/箱" },
        ],
        serviceTags: ["支持开票", "样品可寄", "包损补发"],
        shopInfo: { shopId: "shop-02", shopName: "衡筑精选辅材", score: 4.7 },
        deliveryDesc: "预计 72 小时内发货",
        recommendedIds: ["p-floor-001", "p-cement-001", "p-pipe-001"],
    },
    "p-cement-001": {
        ...baseProducts[2],
        gallery: ["袋装仓储", "工地堆放", "强度检测说明"],
        subtitle: "适合抹灰、砌筑和基础施工，工地常备通用型。",
        description: "V1 中用于演示搜索、详情和加购链路，未接真实库存。",
        specGroups: [
            { groupName: "规格", options: ["42.5R", "32.5R"] },
            { groupName: "包装", options: ["50kg/袋"] },
        ],
        selectedSpecText: "请选择规格",
        params: [
            { key: "适配工序", value: "砌筑/抹灰/基层施工" },
            { key: "执行标准", value: "GB 175-2023" },
            { key: "建议储存", value: "干燥通风环境" },
        ],
        serviceTags: ["支持开票", "整车配送", "工程常备"],
        shopInfo: { shopId: "shop-03", shopName: "鼎固水泥直供", score: 4.9 },
        deliveryDesc: "工地整车配送，按区域排期",
        recommendedIds: ["p-cement-002", "p-pipe-002", "p-floor-001"],
    },
    "p-cement-002": {
        ...baseProducts[3],
        gallery: ["粘结剂袋装", "瓷砖铺贴示意", "施工节点"],
        subtitle: "提升瓷砖铺贴稳定性，适合工程与家装混合场景。",
        description: "可作为瓷砖配套辅材，用于搜索和详情联动演示。",
        specGroups: [
            { groupName: "适配砖型", options: ["普通砖", "大板砖"] },
            { groupName: "包装", options: ["20kg/袋"] },
        ],
        selectedSpecText: "请选择规格",
        params: [
            { key: "施工方式", value: "薄贴法" },
            { key: "适配基层", value: "水泥砂浆/混凝土" },
            { key: "初凝时间", value: "约 2 小时" },
        ],
        serviceTags: ["支持开票", "批量价优", "配套发货"],
        shopInfo: { shopId: "shop-04", shopName: "筑稳工程辅材", score: 4.8 },
        deliveryDesc: "可与瓷砖订单同仓发出",
        recommendedIds: ["p-floor-001", "p-cement-001", "p-floor-002"],
    },
    "p-pipe-001": {
        ...baseProducts[4],
        gallery: ["冷热水管样件", "管路布局", "节点安装示意"],
        subtitle: "适合住宅和办公楼冷热水系统。",
        description: "适合家装和工程项目的冷热水管道铺设。",
        specGroups: [
            { groupName: "口径", options: ["20mm", "25mm", "32mm"] },
            { groupName: "颜色", options: ["白色", "绿色"] },
        ],
        selectedSpecText: "请选择规格",
        params: [
            { key: "耐温范围", value: "0-95℃" },
            { key: "长度", value: "4米/根" },
            { key: "适配系统", value: "冷热水管路" },
        ],
        serviceTags: ["支持开票", "整包采购", "同城急送"],
        shopInfo: { shopId: "shop-05", shopName: "川朗管材仓", score: 4.7 },
        deliveryDesc: "现货发运，支持项目批量配送",
        recommendedIds: ["p-pipe-002", "p-cement-001", "p-electric-002"],
    },
    "p-pipe-002": {
        ...baseProducts[5],
        gallery: ["排水管样件", "立管施工示意", "节点配件组合"],
        subtitle: "适合卫生间、设备间和排水立管项目。",
        description: "常用于排水系统改造和新建项目。",
        specGroups: [
            { groupName: "口径", options: ["DN75", "DN110", "DN160"] },
            { groupName: "壁厚", options: ["国标", "加厚"] },
        ],
        selectedSpecText: "请选择规格",
        params: [
            { key: "适用场景", value: "排水/排污/通气" },
            { key: "长度", value: "4米/根" },
            { key: "材质", value: "PVC-U" },
        ],
        serviceTags: ["支持开票", "工程价可谈", "配件齐全"],
        shopInfo: { shopId: "shop-06", shopName: "稳流管道中心", score: 4.6 },
        deliveryDesc: "大批量下单可预约指定时段配送",
        recommendedIds: ["p-pipe-001", "p-cement-001", "p-floor-002"],
    },
    "p-electric-001": {
        ...baseProducts[6],
        gallery: ["射灯出光效果", "吊顶安装", "样板间照明效果"],
        subtitle: "适合工程样板间、走廊和公共区照明。",
        description: "主打节能稳定，适配工程批量采购。",
        specGroups: [
            { groupName: "色温", options: ["3000K", "4000K", "6000K"] },
            { groupName: "开孔", options: ["75mm", "90mm"] },
        ],
        selectedSpecText: "请选择规格",
        params: [
            { key: "功率", value: "12W" },
            { key: "显色指数", value: "Ra>90" },
            { key: "适配区域", value: "走廊/样板间/大厅" },
        ],
        serviceTags: ["支持开票", "批量折扣", "工程备货"],
        shopInfo: { shopId: "shop-07", shopName: "曜工照明", score: 4.8 },
        deliveryDesc: "支持项目分批发货",
        recommendedIds: ["p-electric-002", "p-floor-001", "p-pipe-001"],
    },
    "p-electric-002": {
        ...baseProducts[7],
        gallery: ["电线线盘", "配电施工", "线槽敷设示意"],
        subtitle: "适合住宅、办公和商业空间布线。",
        description: "用于演示高单价商品在搜索和详情中的展示样式。",
        specGroups: [
            { groupName: "颜色", options: ["红色", "蓝色", "黄绿"] },
            { groupName: "包装", options: ["100米/卷"] },
        ],
        selectedSpecText: "请选择规格",
        params: [
            { key: "导体材质", value: "无氧铜" },
            { key: "绝缘等级", value: "阻燃" },
            { key: "适配场景", value: "住宅/办公/商业空间" },
        ],
        serviceTags: ["支持开票", "项目专供", "阻燃线材"],
        shopInfo: { shopId: "shop-08", shopName: "通安线缆库", score: 4.7 },
        deliveryDesc: "可整卷发货，支持工程补货",
        recommendedIds: ["p-electric-001", "p-pipe-001", "p-cement-002"],
    },
};
exports.hotSearchKeywords = ["42.5R 水泥", "工程地砖", "PPR 水管", "阻燃电线"];
exports.homeBanners = [
    {
        id: "banner-01",
        eyebrow: "工程主材周",
        title: "地砖与辅材组合采购",
        subtitle: "从铺贴主材到粘结剂，一屏进入工程样板间采购路径。",
        actionText: "查看主推商品",
        accent: "linear-gradient(135deg, #ffe7e7, #fff4ef)",
        imageUrl: "",
        linkType: "internal",
        route: routes_1.ROUTES.productDetail,
        params: { id: "p-floor-001" },
    },
    {
        id: "banner-02",
        eyebrow: "工地补货",
        title: "水泥与管材现货专区",
        subtitle: "按类目快速进入高频采购结果页，适合临时补货场景。",
        actionText: "进入结果页",
        accent: "linear-gradient(135deg, #fff0df, #fff7eb)",
        imageUrl: "",
        linkType: "internal",
        route: routes_1.ROUTES.searchResult,
        params: { keyword: "现货", categoryId: "cement" },
    },
    {
        id: "banner-03",
        eyebrow: "照明选型",
        title: "公共区照明批量采购",
        subtitle: "从射灯、电线到布线辅材，适配办公楼和商场项目。",
        actionText: "查看照明类目",
        accent: "linear-gradient(135deg, #fff2e2, #fff9ef)",
        imageUrl: "",
        linkType: "internal",
        route: routes_1.ROUTES.searchResult,
        params: { keyword: "照明", categoryId: "electric" },
    },
];
exports.homeCategoryNav = [
    { id: "tile", name: "瓷砖石材", tagline: "大厅与公共区", route: routes_1.ROUTES.category, params: { categoryId: "tile" } },
    { id: "cement", name: "水泥辅材", tagline: "工地常备", route: routes_1.ROUTES.category, params: { categoryId: "cement" } },
    { id: "pipe", name: "管材管件", tagline: "冷热与排水", route: routes_1.ROUTES.category, params: { categoryId: "pipe" } },
    { id: "electric", name: "电气照明", tagline: "照明与线材", route: routes_1.ROUTES.category, params: { categoryId: "electric" } },
];
exports.articleEntrances = [
    {
        id: "article-01",
        category: "行业新闻",
        title: "工程项目批量采购，如何降低补货波动",
        summary: "从主材、辅材和临采节奏三方面整理 B 端采购建议。",
        route: routes_1.ROUTES.articleList,
        params: { category: "industry_news" },
    },
    {
        id: "article-02",
        category: "产品知识",
        title: "水泥、粘结剂、砂浆如何配套选用",
        summary: "适合当前版本的主材辅材联动浏览场景。",
        route: routes_1.ROUTES.articleList,
        params: { category: "product_knowledge" },
    },
    {
        id: "article-03",
        category: "装修指南",
        title: "管材和电线的常见工程选型误区",
        summary: "适合作为分类页和搜索页之后的内容补充。",
        route: routes_1.ROUTES.articleList,
        params: { category: "renovation_guide" },
    },
];
exports.relatedCategories = [
    { id: "all", name: "全部结果", count: 8 },
    { id: "tile", name: "瓷砖石材", count: 2 },
    { id: "cement", name: "水泥辅材", count: 2 },
    { id: "pipe", name: "管材管件", count: 2 },
    { id: "electric", name: "电气照明", count: 2 },
];
exports.sortOptions = [
    { value: "default", label: "默认" },
    { value: "sales_desc", label: "销量" },
    { value: "price_asc", label: "价格升序" },
    { value: "price_desc", label: "价格降序" },
    { value: "brand", label: "品牌" },
];
exports.priceFilterOptions = [
    { value: "all", label: "全部价格" },
    { value: "budget", label: "100 以下" },
    { value: "mid", label: "100 - 200" },
    { value: "premium", label: "200 以上" },
];
exports.minOrderFilterOptions = [
    { value: "all", label: "全部起订量" },
    { value: "qty10", label: "10 件内" },
    { value: "qty20", label: "20 件内" },
    { value: "qty50", label: "50 件内" },
];
exports.materialFilterOptions = [
    { value: "all", label: "全部材质" },
    { value: "stone", label: "石材砖面" },
    { value: "ceramic", label: "陶瓷" },
    { value: "cement", label: "水泥" },
    { value: "mortar", label: "砂浆/粘结剂" },
    { value: "pipe", label: "管材" },
    { value: "wire", label: "线材" },
    { value: "light", label: "照明" },
];
exports.brandFilterOptions = [...new Set(baseProducts.map((item) => item.brand))]
    .map((brand) => ({
    id: brand,
    name: brand,
}));
exports.defaultSearchFilterState = {
    priceRange: "all",
    minOrder: "all",
    material: "all",
};
function withFavoriteState(items, favoriteIds) {
    const favorites = new Set(favoriteIds);
    return items.map((item) => ({
        ...item,
        isFavorite: favorites.has(item.id),
    }));
}
function getHomeSections(favoriteIds) {
    return {
        campaignProducts: withFavoriteState(baseProducts.slice(0, 3), favoriteIds),
        hotProducts: withFavoriteState(baseProducts.slice(3, 7), favoriteIds),
    };
}
function getFavoriteProducts(favoriteIds) {
    const ids = [...favoriteIds].reverse();
    return ids
        .map((id) => baseProducts.find((item) => item.id === id))
        .filter((item) => Boolean(item))
        .map((item) => ({
        ...item,
        isFavorite: true,
    }));
}
function searchProducts(params) {
    const { keyword, categoryId, sortOption, selectedBrandIds = [], filterState, favoriteIds } = params;
    const normalizedKeyword = keyword.trim().toLowerCase();
    let next = withFavoriteState(baseProducts, favoriteIds).filter((item) => {
        const matchesKeyword = !normalizedKeyword ||
            [item.name, item.brand, item.model, item.categoryName]
                .join(" ")
                .toLowerCase()
                .includes(normalizedKeyword);
        const matchesCategory = categoryId === "all" || item.categoryId === categoryId;
        const matchesBrand = !selectedBrandIds.length || selectedBrandIds.includes(item.brandId ?? item.brand);
        const matchesPrice = filterState.priceRange === "all" ||
            (filterState.priceRange === "budget" && item.price < 100) ||
            (filterState.priceRange === "mid" && item.price >= 100 && item.price < 200) ||
            (filterState.priceRange === "premium" && item.price >= 200);
        const matchesOrder = filterState.minOrder === "all" ||
            (filterState.minOrder === "qty10" && item.minOrderQty <= 10) ||
            (filterState.minOrder === "qty20" && item.minOrderQty <= 20) ||
            (filterState.minOrder === "qty50" && item.minOrderQty <= 50);
        const matchesMaterial = filterState.material === "all" || item.material === filterState.material;
        return matchesKeyword && matchesCategory && matchesBrand && matchesPrice && matchesOrder && matchesMaterial;
    });
    if (sortOption === "sales_desc") {
        next = [...next].sort((a, b) => b.salesVolume - a.salesVolume);
    }
    if (sortOption === "price_asc") {
        next = [...next].sort((a, b) => a.price - b.price);
    }
    if (sortOption === "price_desc") {
        next = [...next].sort((a, b) => b.price - a.price);
    }
    if (sortOption === "brand") {
        next = [...next].sort((a, b) => a.brand.localeCompare(b.brand));
    }
    return next;
}
function getProductDetail(productId, favoriteIds) {
    const detail = detailMap[productId] ?? detailMap["p-floor-001"];
    return withFavoriteState([detail], favoriteIds)[0];
}
function getRecommendedProducts(productId, favoriteIds) {
    const detail = detailMap[productId] ?? detailMap["p-floor-001"];
    const recommended = detail.recommendedIds
        .map((id) => baseProducts.find((item) => item.id === id))
        .filter((item) => Boolean(item));
    return withFavoriteState(recommended, favoriteIds);
}
