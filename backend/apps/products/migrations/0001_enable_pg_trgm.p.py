from django.db import migrations

class Migration(migrations.Migration):

    dependencies = []  # or whatever the prior migration is

    operations = [
        migrations.RunSQL(
            "CREATE EXTENSION IF NOT EXISTS pg_trgm;",
            reverse_sql="DROP EXTENSION IF EXISTS pg_trgm;"
        ),
    ]