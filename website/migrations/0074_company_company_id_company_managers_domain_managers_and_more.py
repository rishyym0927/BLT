# Generated by Django 4.1 on 2023-06-02 14:18

import uuid

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("website", "0073_issue_markdown_description_alter_issue_screenshot"),
    ]

    operations = [
        migrations.AddField(
            model_name="company",
            name="company_id",
            field=models.CharField(
                default=uuid.UUID("76403ede-d578-422f-8bbc-8563779604bd"),
                editable=False,
                max_length=255,
                unique=True,
            ),
        ),
        migrations.AddField(
            model_name="company",
            name="managers",
            field=models.ManyToManyField(related_name="user_companies", to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name="domain",
            name="managers",
            field=models.ManyToManyField(related_name="user_domains", to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name="company",
            name="name",
            field=models.CharField(max_length=255),
        ),
    ]
