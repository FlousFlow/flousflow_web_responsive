from odoo import SUPERUSER_ID, api

from odoo.addons.flousflow_web_responsive.hooks import _align_arabic_preferences_title


def migrate(cr, version):
    env = api.Environment(cr, SUPERUSER_ID, {})
    _align_arabic_preferences_title(env)
