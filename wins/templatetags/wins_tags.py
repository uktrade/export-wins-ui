from django import template

register = template.Library()

@register.filter()
def as_financial_year(value):
    next_year = value + 1
    next_year_short = next_year - 2000
    return f'{value}/{next_year_short}'
