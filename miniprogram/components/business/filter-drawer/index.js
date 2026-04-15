"use strict";
const defaultFilter = {
    priceRange: "all",
    minOrder: "all",
    material: "all",
};
Component({
    properties: {
        visible: {
            type: Boolean,
            value: false,
        },
        value: {
            type: Object,
            value: defaultFilter,
        },
        priceOptions: {
            type: Array,
            value: [],
        },
        quantityOptions: {
            type: Array,
            value: [],
        },
        materialOptions: {
            type: Array,
            value: [],
        },
    },
    data: {
        draft: defaultFilter,
    },
    observers: {
        "visible, value"(visible, value) {
            if (!visible)
                return;
            this.setData({
                draft: {
                    ...defaultFilter,
                    ...(value ?? {}),
                },
            });
        },
    },
    methods: {
        noop() { },
        handleClose() {
            this.triggerEvent("close");
        },
        handleReset() {
            const draft = { ...defaultFilter };
            this.setData({ draft });
            this.triggerEvent("reset", { value: draft });
        },
        handleApply() {
            this.triggerEvent("apply", { value: this.data.draft });
        },
        handleSelect(event) {
            const { field, value } = event.currentTarget.dataset;
            if (!field || !value)
                return;
            this.setData({
                [`draft.${field}`]: value,
            });
        },
    },
});
