# Generated by Django 4.1.13 on 2023-12-18 05:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_profile', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='avatar',
            field=models.ImageField(blank=True, null=True, upload_to='avatars/'),
        ),
        migrations.AlterField(
            model_name='user',
            name='password',
            field=models.CharField(default='abc', max_length=128),
        ),
    ]
