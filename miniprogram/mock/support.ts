import { ROUTES } from "../constants/routes";
import type {
  ChatMessage,
  ComplaintForm,
  FaqCategory,
  FaqItem,
  SupportCard,
  SupportProblemType,
  SupportQuickQuestion,
  SupportSessionMeta,
} from "../types/models";

export const supportServiceTime = "在线客服 08:30-20:30，FAQ 与投诉建议全天可查看。";

export const supportCards: SupportCard[] = [
  {
    id: "support-chat",
    icon: "咨",
    title: "在线咨询",
    description: "售前选型、订单进度和发票问题统一在这里处理。",
    badge: "平均 2 分钟内响应",
    route: ROUTES.supportChat,
    availability: "available",
    developing: true,
  },
  {
    id: "support-faq",
    icon: "答",
    title: "常见问题",
    description: "先看配送、发票、支付和售后类高频问答。",
    badge: "自助排查更快",
    route: ROUTES.supportFaq,
    availability: "available",
    developing: true,
  },
  {
    id: "support-complaint",
    icon: "单",
    title: "投诉建议",
    description: "提交订单服务、商品问题或流程建议，并保留本地草稿。",
    badge: "支持关联订单",
    route: ROUTES.supportComplaint,
    availability: "limited",
  },
];

export const supportQuickQuestions: SupportQuickQuestion[] = [
  { id: "qq-1", text: "帮我确认一下发票怎么开", category: "invoice" },
  { id: "qq-2", text: "订单什么时候可以发货", category: "delivery" },
  { id: "qq-3", text: "商品规格怎么选更稳妥", category: "spec" },
  { id: "qq-4", text: "优惠券为什么不可用", category: "coupon" },
];

export const supportFaqItems: FaqItem[] = [
  {
    id: "faq-1",
    category: "order",
    question: "下单后多久能看到订单状态？",
    answer: "本地 Mock 版本在提交订单后会立即生成订单，可在订单列表页查看对应状态并继续支付或确认收货。",
    sort: 1,
  },
  {
    id: "faq-2",
    category: "order",
    question: "支付失败后还能重新支付吗？",
    answer: "可以。支付结果页失败态和订单列表中的待支付订单都提供继续支付入口，用于演示本地支付回流。",
    sort: 2,
  },
  {
    id: "faq-3",
    category: "invoice",
    question: "电子发票和纸质发票有什么区别？",
    answer: "电子发票适合即时回传，纸质发票需要补充收件信息。当前版本会在发票中心保留申请记录，并可回流结算页。",
    sort: 3,
  },
  {
    id: "faq-4",
    category: "invoice",
    question: "为什么有些订单暂时不能开票？",
    answer: "通常是因为订单尚未完成支付，或开票信息未填写完整。你可以先在订单详情确认支付状态，再到发票中心补齐信息。",
    sort: 4,
  },
  {
    id: "faq-5",
    category: "delivery",
    question: "现货商品一定当天发出吗？",
    answer: "不一定。当前前端会展示发货说明，真实场景里还需结合仓配半径、批量发运和项目排期综合判断。",
    sort: 5,
  },
  {
    id: "faq-6",
    category: "delivery",
    question: "地址改了以后会同步到结算页吗？",
    answer: "会。地址列表支持默认地址切换和结算场景回流，修改后重新进入结算页即可看到最新地址。",
    sort: 6,
  },
];

export const supportProblemTypes: SupportProblemType[] = [
  {
    value: "delivery",
    label: "配送问题",
    desc: "发货慢、到货异常、配送说明不清等。",
  },
  {
    value: "invoice",
    label: "发票问题",
    desc: "开票资料、发票状态或回流异常。",
  },
  {
    value: "product",
    label: "商品问题",
    desc: "型号、规格、商品描述或质量反馈。",
  },
  {
    value: "service",
    label: "服务建议",
    desc: "流程体验、客服响应或功能改进建议。",
  },
];

export const defaultComplaintDraft: ComplaintForm = {
  contactName: "",
  phone: "",
  orderNo: "",
  problemType: "",
  description: "",
  images: [],
};

export function getFaqCategories(): FaqCategory[] {
  const baseCategories = [
    { value: "all", label: "全部" },
    { value: "order", label: "订单支付" },
    { value: "invoice", label: "发票开具" },
    { value: "delivery", label: "配送地址" },
  ];

  return baseCategories.map((item) => ({
    ...item,
    count: item.value === "all" ? supportFaqItems.length : supportFaqItems.filter((faq) => faq.category === item.value).length,
  }));
}

export function getFaqItemsByCategory(category: string) {
  if (!category || category === "all") {
    return [...supportFaqItems].sort((a, b) => a.sort - b.sort);
  }

  return supportFaqItems.filter((item) => item.category === category).sort((a, b) => a.sort - b.sort);
}

export function createSupportSessionMeta(params: {
  source?: string;
  productName?: string;
  orderNo?: string;
}): SupportSessionMeta {
  if (params.source === "product") {
    return {
      title: "商品咨询",
      subtitle: params.productName ? `当前咨询商品：${params.productName}` : "当前来自商品详情页，可继续追问规格和发货问题。",
      serviceTime: supportServiceTime,
      responseSla: "当前优先处理规格、库存和发货说明咨询。",
      contextType: "product",
    };
  }

  if (params.source === "order") {
    return {
      title: "订单服务",
      subtitle: params.orderNo ? `已关联订单号 ${params.orderNo}` : "当前来自订单详情页，可继续追问支付、发票和售后问题。",
      serviceTime: supportServiceTime,
      responseSla: "当前优先处理支付状态、发票和售后问题。",
      contextType: "order",
    };
  }

  return {
    title: "建材采购客服",
    subtitle: "支持商品选型、订单进度、发票和售后问题咨询。",
    serviceTime: supportServiceTime,
    responseSla: "工作时段内平均 2 分钟内响应。",
    contextType: "general",
  };
}

export function createWelcomeMessages(meta: SupportSessionMeta): ChatMessage[] {
  return [
    {
      id: "support-welcome",
      sender: "service",
      text: `你好，这里是${meta.title}。${meta.subtitle}`,
      time: "刚刚",
      status: "sent",
    },
    {
      id: "support-note",
      sender: "system",
      text: `${meta.serviceTime} ${meta.responseSla}`,
      time: "刚刚",
      status: "sent",
    },
  ];
}

export function createSupportReply(message: string, meta: SupportSessionMeta) {
  if (message.includes("发票")) {
    return "发票相关问题可以先确认订单支付状态，再到发票中心填写抬头、税号和邮箱。若你是从结算页过来，提交后会自动回流。";
  }

  if (message.includes("发货") || message.includes("配送")) {
    return "当前版本会在商品详情和订单详情里展示发货说明。若是项目批量采购，建议先确认现货标签、配送说明和订单状态再安排补货。";
  }

  if (message.includes("规格") || message.includes("型号")) {
    return meta.contextType === "product"
      ? "你当前来自商品详情页，建议先确认规格弹层中的型号、口径或表面工艺，再结合起订量判断是否直接下单。"
      : "如果是选型问题，建议先从分类页或搜索页缩小范围，再进入商品详情确认具体规格和起订量。";
  }

  if (message.includes("优惠券")) {
    return "优惠券页会按可用和不可用分组展示，结算场景下只有满足门槛的优惠券才能直接回流使用。";
  }

  if (message.includes("售后") || message.includes("投诉")) {
    return "涉及售后或服务反馈时，可以继续描述问题，也可以直接去投诉建议页提交表单并关联订单。";
  }

  return "已收到。当前版本使用本地 Mock 会话演示客服链路，你可以继续追问商品规格、订单进度、发票或售后问题。";
}
