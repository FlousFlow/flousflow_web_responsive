import { isMobileOS } from "@web/core/browser/feature_detection";
import { user } from "@web/core/user";
import { useService } from "@web/core/utils/hooks";
import { patch } from "@web/core/utils/patch";
import { ListRenderer } from "@web/views/list/list_renderer";
import { _t } from "@web/core/l10n/translation";
import { onMounted, onWillDestroy, onWillUnmount, proxy } from "@odoo/owl";
import { getActiveHotkey } from "@web/core/hotkeys/hotkey_utils";

export const patchListRendererDesktop = () => ({
    setup() {
        super.setup(...arguments);
        this.actionService = useService("action");
        let listRoot;
        const onProductEnter = (ev) => this.onOrderLineProductEnter(ev);
        onMounted(() => {
            if (this.isFlousFlowOrderLineList()) {
                listRoot = this.rootRef();
                listRoot?.addEventListener("keydown", onProductEnter, true);
            }
        });
        onWillUnmount(() => listRoot?.removeEventListener("keydown", onProductEnter, true));
        const list = this.props.list;

        const { actionId, actionType } = this.env.config || {};

        // Start by determining if the current ListRenderer is in a context that would
        // allow the edition of the arch by studio.
        // It needs to be a full list view, in an action
        // (not a X2Many list, and not an "embedded" list in another component)
        // Also, there is not enough information when an action is in target new,
        // and this use case is fairly outside of the feature's scope
        const isPotentiallyEditable =
            !isMobileOS() &&
            !this.env.inDialog &&
            user.isSystem &&
            list === list.model.root &&
            actionId &&
            actionType === "ir.actions.act_window";
        this.studioEditable = proxy({ value: isPotentiallyEditable });

        if (isPotentiallyEditable) {
            const computeStudioEditable = (action) => {
                // Finalize the computation when the actionService is ready.
                // The following code is copied from studioService.
                if (!action.xml_id) {
                    return false;
                }
                if (
                    action.res_model.indexOf("settings") > -1 &&
                    action.res_model.indexOf("x_") !== 0
                ) {
                    return false; // settings views aren't editable; but x_settings is
                }
                if (action.res_model === "board.board") {
                    return false; // dashboard isn't editable
                }
                if (action.view_mode === "qweb") {
                    // Apparently there is a QWebView that allows to
                    // implement ActWindow actions that are completely custom
                    // but not editable by studio
                    return false;
                }
                if (action.res_model === "knowledge.article") {
                    // The knowledge form view is very specific and custom, it doesn't make sense
                    // to edit it. Editing the list and kanban is more debatable, but for simplicity's sake
                    // we set them to not editable too.
                    return false;
                }
                if (action.res_model === "account.bank.statement.line") {
                    return false; // bank reconciliation isn't editable
                }
                return Boolean(action.res_model);
            };
            const onUiUpdated = () => {
                const action = this.actionService.currentController.action;
                if (action.id === actionId) {
                    this.studioEditable.value = computeStudioEditable(action);
                }
                stopListening();
            };
            const stopListening = () =>
                this.env.bus.removeEventListener("ACTION_MANAGER:UI-UPDATED", onUiUpdated);
            this.env.bus.addEventListener("ACTION_MANAGER:UI-UPDATED", onUiUpdated);

            onWillDestroy(stopListening);
        }
    },

    isFlousFlowOrderLineList() {
        return ["sale.order.line", "purchase.order.line"].includes(this.props.list.resModel);
    },

    getOrderLineRow(record) {
        if (!record || !this.tableRef()) {
            return null;
        }
        return [...this.tableRef().querySelectorAll("tr.o_data_row")].find(
            (row) => row.dataset.id === String(record.id)
        );
    },

    getOrderLineFieldInput(record, fieldNames) {
        const row = this.getOrderLineRow(record);
        if (!row) {
            return null;
        }
        for (const fieldName of fieldNames) {
            const widget = row.querySelector(`.o_field_widget[name="${fieldName}"]`);
            if (!widget || !widget.getClientRects().length) {
                continue;
            }
            const input = widget.querySelector("input:not([type=hidden]), textarea");
            if (input && !input.disabled && !input.readOnly) {
                return input;
            }
        }
        return null;
    },

    focusOrderLineField(record, fieldNames) {
        const input = this.getOrderLineFieldInput(record, fieldNames);
        if (!input) {
            return false;
        }
        this.focus(input);
        return true;
    },

    onOrderLineProductEnter(ev) {
        if (getActiveHotkey(ev) !== "enter" || !this.isFlousFlowOrderLineList()) {
            return;
        }
        const input = ev.target;
        const productWidget = input.closest?.(
            '.o_field_widget[name="product_id"], .o_field_widget[name="product_template_id"]'
        );
        // Odoo 20 Sales uses a combined label/product widget rather than a
        // product_id/product_template_id widget in editable order lines.
        const saleLabelWidget = this.props.list.resModel === "sale.order.line"
            ? input.closest?.('.o_field_widget.o_field_sol_label_text[name="label"]')
            : null;
        const row = input.closest?.("tr.o_data_row");
        const autocomplete = productWidget || saleLabelWidget;
        const record = row && this.props.list.records.find((item) => String(item.id) === row.dataset.id);
        const product = record?.data.product_id || record?.data.product_template_id;
        const quantityField = this.props.list.resModel === "sale.order.line"
            ? "product_uom_qty"
            : "product_qty";
        if (
            autocomplete &&
            row &&
            record &&
            !record.data.display_type &&
            product?.id &&
            input.getAttribute("aria-expanded") !== "true" &&
            this.getOrderLineFieldInput(record, [quantityField])
        ) {
            ev.preventDefault();
            ev.stopPropagation();
            this.focusOrderLineField(record, [quantityField]);
            return;
        }
        const selectedOption = autocomplete?.querySelector(
            '[role="option"][aria-selected="true"]'
        );
        const dropdown = autocomplete?.querySelector(".o-autocomplete--dropdown-menu");
        if (
            (!productWidget && !(saleLabelWidget && input.matches("textarea"))) ||
            !row ||
            !dropdown ||
            !selectedOption ||
            selectedOption.closest("li")?.matches(
                ".o_m2o_dropdown_option_search_more, .o_m2o_dropdown_option_create_edit, .o_m2o_no_result"
            )
        ) {
            return;
        }
        if (!record || record.data.display_type) {
            return;
        }
        setTimeout(() => this.focusQuantityAfterProductEnter(record), 0);
    },

    async focusQuantityAfterProductEnter(record) {
        if (!this.isFlousFlowOrderLineList() || document.querySelector(".o_dialog")) {
            return;
        }
        try {
            if (!(await this.props.list.enterEditMode(record))) {
                return;
            }
            await new Promise((resolve) => requestAnimationFrame(resolve));
            const product = record.data.product_id || record.data.product_template_id;
            if (!product?.id || document.querySelector(".o_dialog")) {
                return;
            }
            const quantityField = this.props.list.resModel === "sale.order.line"
                ? "product_uom_qty"
                : "product_qty";
            this.focusOrderLineField(record, [quantityField]);
        } catch (error) {
            console.error("FlousFlow order-line product focus failed:", error);
        }
    },

    onCellKeydown(ev, group = null, record = null) {
        const hotkey = getActiveHotkey(ev);
        const widget = ev.target.closest?.(".o_field_widget");
        const fieldName = widget?.getAttribute("name");
        if (
            hotkey === "enter" &&
            record &&
            !record.data.display_type &&
            this.isFlousFlowOrderLineList()
        ) {
            const quantityField = this.props.list.resModel === "sale.order.line"
                ? "product_uom_qty"
                : "product_qty";
            const isProductField =
                fieldName === "product_id" ||
                fieldName === "product_template_id" ||
                (this.props.list.resModel === "sale.order.line" &&
                    fieldName === "label" &&
                    widget?.classList.contains("o_field_sol_label_text"));
            const product = record.data.product_id || record.data.product_template_id;
            const autocompleteIsOpen = Boolean(
                widget?.querySelector('input[role="combobox"][aria-expanded="true"]')
            );
            if (
                isProductField &&
                product?.id &&
                !autocompleteIsOpen &&
                this.getOrderLineFieldInput(record, [quantityField])
            ) {
                ev.preventDefault();
                ev.stopPropagation();
                this.lastCreatingAction = false;
                this.focusOrderLineField(record, [quantityField]);
                return;
            }
            if (fieldName === quantityField && this.getOrderLineFieldInput(record, ["price_unit"])) {
                ev.preventDefault();
                ev.stopPropagation();
                this.lastCreatingAction = false;
                this.advanceOrderLineToPrice(record).catch((error) => {
                    console.error("FlousFlow order-line quantity navigation failed:", error);
                });
                return;
            }
            if (
                fieldName === "price_unit" &&
                this.canCreate &&
                this.props.editable &&
                this.getOrderLineFieldInput(record, ["product_id", "product_template_id"])
            ) {
                ev.preventDefault();
                ev.stopPropagation();
                this.lastCreatingAction = false;
                this.addOrderLineAfterPrice(record).catch((error) => {
                    console.error("FlousFlow order-line creation failed:", error);
                });
                return;
            }
        }
        return super.onCellKeydown(...arguments);
    },

    async advanceOrderLineToPrice(record) {
        if (!(await this.props.list.enterEditMode(record))) {
            return;
        }
        await new Promise((resolve) => requestAnimationFrame(resolve));
        this.focusOrderLineField(record, ["price_unit"]);
    },

    async addOrderLineAfterPrice(record) {
        const list = this.props.list;
        if (!(await list.leaveEditMode({ canAbandon: false }))) {
            return;
        }
        const createControl = (this.controls || []).find((control) => control.type === "create");
        const newRecord = await list.addNewRecord({
            context: createControl?.context,
            mode: "edit",
            position: this.props.editable,
        });
        await new Promise((resolve) => requestAnimationFrame(resolve));
        this.focusOrderLineField(newRecord, ["product_id", "product_template_id"]);
    },

    isStudioEditable() {
        return this.studioEditable.value;
    },

    get displayOptionalFields() {
        return this.isStudioEditable() || super.displayOptionalFields;
    },
});

export const unpatchListRendererDesktop = patch(ListRenderer.prototype, patchListRendererDesktop());
