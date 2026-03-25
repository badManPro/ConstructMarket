Component({
  properties: {
    visible: {
      type: Boolean,
      value: false,
    },
    product: {
      type: Object,
      value: {},
    },
    selectedOptions: {
      type: Array,
      value: [],
    },
    quantity: {
      type: Number,
      value: 1,
    },
  },
  data: {
    draftOptions: [] as string[],
    draftQuantity: 1,
  },
  observers: {
    "visible, selectedOptions, quantity, product"(
      visible: boolean,
      selectedOptions: string[],
      quantity: number,
      product: { minOrderQty?: number } | null,
    ) {
      if (!visible) return;
      this.setData({
        draftOptions: [...(selectedOptions ?? [])],
        draftQuantity: quantity || product?.minOrderQty || 1,
      });
    },
  },
  methods: {
    noop() {},
    handleClose() {
      this.triggerEvent("close");
    },
    handleSelect(event: WechatMiniprogram.Event) {
      const { groupIndex, option } = event.currentTarget.dataset as { groupIndex?: string; option?: string };
      if (groupIndex === undefined || !option) return;
      const next = [...this.data.draftOptions];
      next[Number(groupIndex)] = option;
      this.setData({ draftOptions: next });
    },
    decreaseQuantity() {
      const product = this.data.product as { minOrderQty?: number } | null;
      const minOrderQty = product?.minOrderQty ?? 1;
      this.setData({
        draftQuantity: Math.max(minOrderQty, this.data.draftQuantity - minOrderQty),
      });
    },
    increaseQuantity() {
      const product = this.data.product as { minOrderQty?: number } | null;
      const minOrderQty = product?.minOrderQty ?? 1;
      this.setData({
        draftQuantity: this.data.draftQuantity + minOrderQty,
      });
    },
    handleConfirm() {
      const product = this.data.product as { specGroups?: Array<{ options: string[] }> } | null;
      const expected = product?.specGroups?.length ?? 0;
      const selectedText = this.data.draftOptions.filter(Boolean).join(" / ");

      this.triggerEvent("confirm", {
        selectedOptions: this.data.draftOptions,
        quantity: this.data.draftQuantity,
        isComplete: this.data.draftOptions.filter(Boolean).length === expected,
        selectedText,
      });
    },
  },
});
