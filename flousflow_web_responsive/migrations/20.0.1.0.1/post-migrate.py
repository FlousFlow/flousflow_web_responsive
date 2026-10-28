from odoo import SUPERUSER_ID, api


def migrate(cr, version):
    env = api.Environment(cr, SUPERUSER_ID, {})
    arabic = env['res.lang'].search([('code', '=', 'ar_001'), ('active', '=', True)], limit=1)
    if not arabic:
        return

    fields = env['ir.model.fields'].search([
        ('model', 'in', ['product.product', 'product.template']),
        ('name', '=', 'is_storable'),
    ])
    for field in fields.with_context(lang='ar_001'):
        if field.field_description == 'التتبع':
            field.write({'field_description': 'تتبُع المخزون'})
