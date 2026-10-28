# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import api, models


class IrUiView(models.Model):
    _inherit = "ir.ui.view"

    @api.model_create_multi
    def create(self, vals_list):
        # The optional Website app makes visibility required on every view.
        if "visibility" in self._fields:
            for vals in vals_list:
                if vals.get("name") == "res.users.preferences.form.color.scheme":
                    vals.setdefault("visibility", "public")
        return super().create(vals_list)
