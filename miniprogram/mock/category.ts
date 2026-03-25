import { ROUTES } from "../constants/routes";
import type { Category, RouteLink } from "../types/models";

export const rootCategories: Category[] = [
  { id: "tile", parentId: "", name: "瓷砖石材", icon: "", level: 1, isHot: true },
  { id: "cement", parentId: "", name: "水泥辅材", icon: "", level: 1, isHot: true },
  { id: "pipe", parentId: "", name: "管材管件", icon: "", level: 1, isHot: false },
  { id: "electric", parentId: "", name: "电气照明", icon: "", level: 1, isHot: false },
];

export const categoryLinks: RouteLink[] = [
  { label: "搜索结果页", description: "承接分类点击后的结果浏览。", route: ROUTES.searchResult },
  { label: "商品详情页", description: "用于直达重点商品详情。", route: ROUTES.productDetail },
  { label: "建材资讯页", description: "从选型回流到知识内容。", route: ROUTES.articleList },
];
