"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.articleFeed = void 0;
exports.getArticleTabs = getArticleTabs;
exports.getArticleCategoryLabel = getArticleCategoryLabel;
exports.getArticlesByCategory = getArticlesByCategory;
exports.getArticleById = getArticleById;
exports.getRelatedArticles = getRelatedArticles;
const articleCategoryMeta = [
    {
        value: "industry_news",
        label: "行业新闻",
        desc: "关注采购节奏、市场波动和项目补货判断。",
    },
    {
        value: "product_knowledge",
        label: "产品知识",
        desc: "围绕主材与辅材的搭配、标准和施工要点。",
    },
    {
        value: "renovation_guide",
        label: "装修指南",
        desc: "补充常见选型误区和落地建议。",
    },
];
exports.articleFeed = [
    {
        id: "article-01",
        category: "industry_news",
        title: "工程项目批量采购，如何降低补货波动",
        cover: "补货波动",
        summary: "从计划拆分、临采预案和高频 SKU 三方面，整理工地补货更稳的做法。",
        source: "ConstructMarket 研究组",
        publishAt: "2026-03-23 09:30",
        content: "项目进入连续施工阶段后，真正拉开采购效率差距的往往不是单次大单，而是补货链路是否可控。\n\n建议先把高频主材、辅材和临采物料拆成三层池子，主材按周计划，辅材按安全库存，临采物料按现场反馈滚动补足。\n\n当水泥、粘结剂、管材等品类同时采购时，优先梳理最容易拖慢工序的关键 SKU，并提前锁定补货节奏，能显著减少停工等待。\n\n前端演示阶段可通过分类页、搜索页和资讯页的联动，让采购用户快速补齐“为什么买”“买什么”“怎么买”的信息链路。",
        relatedIds: ["article-03", "article-05"],
        tone: "linear-gradient(135deg, #fff1ea, #ffe4d6)",
        readingTime: "4 分钟阅读",
        tags: ["补货", "项目采购", "交付节奏"],
    },
    {
        id: "article-02",
        category: "product_knowledge",
        title: "水泥、粘结剂、砂浆如何配套选用",
        cover: "辅材配套",
        summary: "围绕基层、砖型和施工方式，快速判断常见辅材的组合关系。",
        source: "ConstructMarket 材料库",
        publishAt: "2026-03-22 14:10",
        content: "同样是铺贴场景，水泥、粘结剂和砂浆的职责并不相同。水泥偏基础施工，粘结剂偏瓷砖铺贴稳定性，砂浆则更多承接找平和基层处理。\n\n如果项目同时涉及大厅地砖、厨卫砖和局部大板，建议优先区分基层条件，再匹配粘结剂等级与施工方法，避免把一种辅材覆盖所有工序。\n\n对前端选型页来说，这类内容最适合放在商品详情和搜索结果之后，帮助用户在浏览商品时同步理解配套关系。",
        relatedIds: ["article-04", "article-06"],
        tone: "linear-gradient(135deg, #fff5df, #ffe9c1)",
        readingTime: "5 分钟阅读",
        tags: ["水泥", "粘结剂", "施工配套"],
    },
    {
        id: "article-03",
        category: "industry_news",
        title: "建材市场现货心智，决定项目临采效率",
        cover: "现货判断",
        summary: "现货并不等于立刻可交付，仓配时效和补货批次同样关键。",
        source: "ConstructMarket 市场观察",
        publishAt: "2026-03-21 18:20",
        content: "工地临采最常见的误区，是只看页面上的“现货”标签，而忽略仓配半径、发货节奏和补货批次。\n\n对于瓷砖、水泥和管材这类高频品类，建议把现货能力拆成可发货、可补货和可分批送达三类描述，让采购决策更贴近实际施工节奏。\n\n这也是内容页和商品详情页应该互相打通的原因，用户在内容里理解判断标准，在商品页完成交易动作。",
        relatedIds: ["article-01", "article-05"],
        tone: "linear-gradient(135deg, #ffeceb, #ffd8d8)",
        readingTime: "3 分钟阅读",
        tags: ["现货", "仓配", "临采"],
    },
    {
        id: "article-04",
        category: "product_knowledge",
        title: "PPR 与 PVC 管材，采购时先看哪几个参数",
        cover: "管材参数",
        summary: "冷热水系统和排水系统的参数心智不同，别在同一套表里混看。",
        source: "ConstructMarket 材料库",
        publishAt: "2026-03-20 11:45",
        content: "PPR 管材更关注冷热水场景的耐温和口径匹配，PVC 排水管则更关注壁厚、配件适配和节点施工稳定性。\n\n采购页面如果只展示价格，很容易让用户忽略最关键的系统适配信息。因此在搜索结果页和商品详情页，建议始终把型号、口径和适用场景放在核心位置。\n\n内容页承担的任务是帮助用户建立参数阅读顺序，再回流到商品页完成规格确认。",
        relatedIds: ["article-02", "article-06"],
        tone: "linear-gradient(135deg, #eef6ff, #dcecff)",
        readingTime: "4 分钟阅读",
        tags: ["PPR", "PVC", "参数选型"],
    },
    {
        id: "article-05",
        category: "renovation_guide",
        title: "管材和电线的常见工程选型误区",
        cover: "选型误区",
        summary: "从线径、口径到施工场景，归纳三类最常见的误判点。",
        source: "ConstructMarket 装修指南",
        publishAt: "2026-03-19 16:00",
        content: "工程采购里最常见的问题不是看不到产品，而是把不兼容的参数放进同一条询价链路。\n\n例如电线的线径和阻燃等级、管材的口径和场景要求，本质上属于不同维度。若页面只突出低价，采购人员很容易在补货时做出错误替代。\n\n因此分类页和搜索页需要更清晰的筛选标签，而内容页则负责解释这些标签背后的业务含义。",
        relatedIds: ["article-01", "article-04"],
        tone: "linear-gradient(135deg, #f0f8f1, #e0f2e7)",
        readingTime: "4 分钟阅读",
        tags: ["电线", "管材", "误区复盘"],
    },
    {
        id: "article-06",
        category: "renovation_guide",
        title: "样板间先行时，如何安排主材与辅材到货顺序",
        cover: "到货顺序",
        summary: "先样板、再批量，是工程采购里最常见也最容易失控的节奏。",
        source: "ConstructMarket 装修指南",
        publishAt: "2026-03-18 10:00",
        content: "样板间阶段需要的不一定是最低价，而是更稳定的到货和更清晰的材料配套。\n\n建议优先锁定主材、确认辅材替换范围，并把样板确认过的参数直接沉淀到后续批量采购条件中。这样既能减少返工，也能让补货判断更快。\n\n在前端体验上，这类内容最适合放在首页资讯入口和分类页之间，承担决策前的认知补充。",
        relatedIds: ["article-02", "article-04"],
        tone: "linear-gradient(135deg, #fff0ec, #ffe0db)",
        readingTime: "3 分钟阅读",
        tags: ["样板间", "到货节奏", "主辅材协同"],
    },
];
function getArticleTabs() {
    return [
        {
            value: "all",
            label: "全部",
            count: exports.articleFeed.length,
            desc: "按时间查看全部资讯内容。",
        },
        ...articleCategoryMeta.map((item) => ({
            value: item.value,
            label: item.label,
            count: exports.articleFeed.filter((article) => article.category === item.value).length,
            desc: item.desc,
        })),
    ];
}
function getArticleCategoryLabel(category) {
    return articleCategoryMeta.find((item) => item.value === category)?.label ?? "全部";
}
function getArticlesByCategory(category) {
    if (!category || category === "all") {
        return exports.articleFeed;
    }
    return exports.articleFeed.filter((item) => item.category === category);
}
function getArticleById(articleId) {
    return exports.articleFeed.find((item) => item.id === articleId) ?? null;
}
function getRelatedArticles(articleId) {
    const current = getArticleById(articleId);
    if (!current) {
        return [];
    }
    return current.relatedIds
        .map((id) => getArticleById(id))
        .filter((item) => Boolean(item));
}
