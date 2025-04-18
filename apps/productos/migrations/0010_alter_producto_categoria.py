# Generated by Django 5.1.6 on 2025-02-26 00:01

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("productos", "0009_producto_categoria"),
    ]

    operations = [
        migrations.AlterField(
            model_name="producto",
            name="categoria",
            field=models.ForeignKey(
                default=1,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="productos",
                to="productos.categoria",
            ),
            preserve_default=False,
        ),
    ]
