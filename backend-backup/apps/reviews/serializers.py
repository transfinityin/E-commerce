# apps/reviews/serializers.py
from rest_framework import serializers
from apps.reviews.models import Review
from apps.users.serializers import UserSerializer


class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model  = Review
        fields = ('id','user','rating','title','comment','admin_reply','is_verified','created_at','updated_at') 
        read_only_fields = ('id','user','is_verified','created_at','updated_at')

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)