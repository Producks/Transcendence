# Generated by Django 4.2.6 on 2023-11-13 01:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('match_history', '0006_remove_matchhistory_unique_rows_match_history_and_more'),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name='matchhistory',
            name='winner and loser are the same user',
        ),
        migrations.AddConstraint(
            model_name='matchhistory',
            constraint=models.CheckConstraint(check=models.Q(('winner', models.F('loser')), _negated=True), name='Winner and loser are the same user'),
        ),
    ]
