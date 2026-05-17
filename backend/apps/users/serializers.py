from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Address,NotificationSettings
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)
    class Meta:
        model  = User
        fields = ('name', 'email', 'phone', 'password', 'password2')
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return attrs
    def create(self, validated_data):
        validated_data.pop('password2')
        return User.objects.create_user(**validated_data)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ('id','name','email','phone','avatar','role','is_active','date_joined')
        read_only_fields = ('id','email','role','is_active','date_joined')

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ('name','phone','avatar')

class ChangePasswordSerializer(serializers.Serializer):
    old_password  = serializers.CharField(write_only=True)
    new_password  = serializers.CharField(write_only=True, validators=[validate_password])
    new_password2 = serializers.CharField(write_only=True)
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({'new_password': 'Passwords do not match.'})
        return attrs
    def validate_old_password(self, value):
        if not self.context['request'].user.check_password(value):
            raise serializers.ValidationError('Old password incorrect.')
        return value
class UserMiniSerializer(serializers.ModelSerializer):
    """Minimal user info for nested displays"""
    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'phone', 'avatar')
        read_only_fields = ('id',)
class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Address
        fields = ('id','full_name','phone','line1','line2','city','state','pincode','country','latitude','longitude','is_default')
        read_only_fields = ('id',)
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError('No account with this email.')
        return value

class ResetPasswordSerializer(serializers.Serializer):
    token         = serializers.CharField()
    new_password  = serializers.CharField(validators=[validate_password])
    new_password2 = serializers.CharField()
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({'new_password': 'Passwords do not match.'})
        return attrs
    


class NotificationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationSettings
        fields = ('order_updates', 'promotional_emails', 'sms_alerts', 'push_notifications')