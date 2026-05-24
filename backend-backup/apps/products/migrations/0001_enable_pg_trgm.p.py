from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0001_initial'),  # உங்க actual first migration name போடுங்க
    ]

    operations = [
        migrations.RunSQL(
            "CREATE EXTENSION IF NOT EXISTS pg_trgm;",
            reverse_sql="DROP EXTENSION IF EXISTS pg_trgm;"
        ),
    ]